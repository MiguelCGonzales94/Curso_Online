import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  role: 'ROLE_ESTUDIANTE' | 'ROLE_DOCENTE' | 'ROLE_ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  error?: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private usuariosUrl = 'http://localhost:8080/usuarios';
  private tokenKey = 'auth_token';
  private userIdKey = 'user_id';
  private userNameKey = 'user_name';
  private userEmailKey = 'user_email';
  private userRoleKey = 'user_role';

  isAuthenticated = signal<boolean>(false);
  currentUserId = signal<number | null>(null);
  currentUserName = signal<string | null>(null);
  currentUserRole = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const hasToken = this.hasToken();
    const userId = this.getUserId();
    const userName = this.getUserName();
    const userRole = this.getUserRole();

    this.isAuthenticated.set(hasToken);
    this.currentUserId.set(userId);
    this.currentUserName.set(userName);
    this.currentUserRole.set(userRole);

    console.log('Auth inicializado:', {
      token: hasToken ? 'Existe' : 'No existe',
      userId,
      userName,
      userRole
    });
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        switchMap(response => {
          if (response.token) {
            this.setToken(response.token);
            this.isAuthenticated.set(true);

            const email = this.extractEmailFromToken(response.token);
            if (email) {
              this.setUserEmail(email);
            }

            console.log('📧 Email del token:', email);

            return this.http.get<any[]>(`${this.usuariosUrl}`).pipe(
              tap(usuarios => {
                const usuario = usuarios.find(u => u.email === email);

                if (usuario) {
                  console.log('Usuario:', usuario);

                  if (usuario.id) {
                    this.setUserId(usuario.id);
                    this.currentUserId.set(usuario.id);
                  }

                  if (usuario.nombre) {
                    this.setUserName(usuario.nombre);
                    this.currentUserName.set(usuario.nombre);
                  }

                  // IMPORTANTE: El backend devuelve role como objeto
                  let rol: string | null = null;

                  if (usuario.role && typeof usuario.role === 'object') {
                    // Caso 1: role es un objeto con roleName
                    if (usuario.role.roleName) {
                      rol = usuario.role.roleName;
                      console.log('ROL de role.roleName:', rol);
                    }
                    // Caso 2: role es un objeto con nombre
                    else if (usuario.role.nombre) {
                      rol = usuario.role.nombre;
                      console.log('ROL de role.nombre:', rol);
                    }
                  }
                  // Caso 3: role es un string directo
                  else if (usuario.role && typeof usuario.role === 'string') {
                    rol = usuario.role;
                    console.log('ROL directo:', rol);
                  }
                  // Caso 4: campo "rol" en lugar de "role"
                  else if (usuario.rol) {
                    if (typeof usuario.rol === 'object' && usuario.rol.roleName) {
                      rol = usuario.rol.roleName;
                    } else if (typeof usuario.rol === 'string') {
                      rol = usuario.rol;
                    }
                    console.log('ROL de "rol":', rol);
                  }
                  // Caso 5: roles array
                  else if (usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0) {
                    const firstRole = usuario.roles[0];
                    if (typeof firstRole === 'object' && firstRole.roleName) {
                      rol = firstRole.roleName;
                    } else if (typeof firstRole === 'string') {
                      rol = firstRole;
                    }
                    console.log('ROL de roles[]:', rol);
                  }

                  if (rol) {
                    // Normalizar: asegurar que empiece con ROLE_
                    if (!rol.startsWith('ROLE_')) {
                      rol = 'ROLE_' + rol.toUpperCase();
                      console.log('ROL normalizado:', rol);
                    }

                    this.setUserRole(rol);
                    this.currentUserRole.set(rol);
                  } else {
                    console.error('ROL no encontrado');
                    // Por defecto: ESTUDIANTE
                    this.setUserRole('ROLE_ESTUDIANTE');
                    this.currentUserRole.set('ROLE_ESTUDIANTE');
                  }
                } else {
                  console.error('Usuario no encontrado:', email);
                }
              }),
              switchMap(() => of(response))
            );
          }
          return of(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.userEmailKey);
    localStorage.removeItem(this.userRoleKey);

    this.isAuthenticated.set(false);
    this.currentUserId.set(null);
    this.currentUserName.set(null);
    this.currentUserRole.set(null);

    console.log('Logout');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }

  getUserName(): string | null {
    return localStorage.getItem(this.userNameKey);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.userEmailKey);
  }

  getUserRole(): string | null {
    const role = localStorage.getItem(this.userRoleKey);
    return role;
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  isEstudiante(): boolean {
    return this.getUserRole() === 'ROLE_ESTUDIANTE';
  }

  isDocente(): boolean {
    return this.getUserRole() === 'ROLE_DOCENTE';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUserId(id: number): void {
    localStorage.setItem(this.userIdKey, id.toString());
    console.log('UserId:', id);
  }

  private setUserName(name: string): void {
    localStorage.setItem(this.userNameKey, name);
    console.log('UserName:', name);
  }

  private setUserEmail(email: string): void {
    localStorage.setItem(this.userEmailKey, email);
    console.log('UserEmail:', email);
  }

  private setUserRole(role: string): void {
    localStorage.setItem(this.userRoleKey, role);
    console.log('UserRole guardado:', role);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  checkAuthentication(): boolean {
    return this.hasToken() && !!this.getUserId();
  }

  private extractEmailFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email || null;
    } catch (error) {
      return null;
    }
  }
}
