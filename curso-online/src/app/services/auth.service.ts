import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.handleLoginSuccess(response);
          }
        })
      );
  }

  private handleLoginSuccess(response: AuthResponse): void {
    if (response.token) {
      this.setToken(response.token);
      this.isAuthenticated.set(true);

      const tokenPayload = this.extractPayloadFromToken(response.token);

      if (response.userId) {
        this.setUserId(response.userId);
        this.currentUserId.set(response.userId);
      } else if (tokenPayload?.userId) {
        this.setUserId(tokenPayload.userId);
        this.currentUserId.set(tokenPayload.userId);
      }

      if (response.userName) {
        this.setUserName(response.userName);
        this.currentUserName.set(response.userName);
      }

      if (response.userEmail) {
        this.setUserEmail(response.userEmail);
      } else {
        const email = this.extractEmailFromToken(response.token);
        if (email) this.setUserEmail(email);
      }

      if (response.userRole) {
        this.setUserRole(response.userRole);
        this.currentUserRole.set(response.userRole);
      } else if (tokenPayload?.role) {
        this.setUserRole(tokenPayload.role);
        this.currentUserRole.set(tokenPayload.role);
      } else {
        this.fetchUserRoleFromBackend();
      }
    }
  }

  private fetchUserRoleFromBackend(): void {
    const userId = this.getUserId();
    if (userId) {
      this.http.get<any>(`http://localhost:8080/usuarios/${userId}`).subscribe({
        next: (user) => {
          if (user && user.rol) {
            this.setUserRole(user.rol);
            this.currentUserRole.set(user.rol);
          }
        },
        error: (error) => console.error('Error al obtener rol:', error)
      });
    }
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
    return localStorage.getItem(this.userRoleKey);
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
  }

  private setUserName(name: string): void {
    localStorage.setItem(this.userNameKey, name);
  }

  private setUserEmail(email: string): void {
    localStorage.setItem(this.userEmailKey, email);
  }

  private setUserRole(role: string): void {
    localStorage.setItem(this.userRoleKey, role);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  checkAuthentication(): boolean {
    const hasToken = this.hasToken();
    const hasUserId = !!this.getUserId();
    return hasToken && hasUserId;
  }

  private extractPayloadFromToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
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
