import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
}

export interface CursoRegistroRequest {
  cursoId: number;
  usuarioId: number;
  // Agregar campos adicionales que el backend pueda necesitar
  fechaRegistro?: string;
}

export interface CursoRegistroResponse {
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private cursoRegistroUrl = 'http://localhost:8080/cursoregistros';
  private tokenKey = 'auth_token';
  private userIdKey = 'user_id';
  private userNameKey = 'user_name';
  private userEmailKey = 'user_email';
  
  isAuthenticated = signal<boolean>(false);
  currentUserId = signal<number | null>(null);
  currentUserName = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Inicializar después de que el constructor se complete
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.isAuthenticated.set(this.hasToken());
    this.currentUserId.set(this.getUserId());
    this.currentUserName.set(this.getUserName());
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            this.isAuthenticated.set(true);
            
            // Extraer email del token
            const email = this.extractEmailFromToken(response.token);
            
            // Obtener userId del backend usando el email
            if (email) {
              this.getUserIdByEmailSync(email);
            }
            
            if (response.userName) {
              this.setUserName(response.userName);
              this.currentUserName.set(response.userName);
            }
            if (response.userEmail) {
              this.setUserEmail(response.userEmail);
            } else if (email) {
              this.setUserEmail(email);
            }
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.userEmailKey);
    this.isAuthenticated.set(false);
    this.currentUserId.set(null);
    this.currentUserName.set(null);
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

  private hasToken(): boolean {
    return !!this.getToken();
  }

  // Método para extraer userId del token JWT
  private extractUserIdFromToken(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // El backend puede usar diferentes nombres: userId, id, sub (subject), user_id, etc.
      // El campo 'sub' normalmente contiene el email del usuario
      const userId = payload.userId || payload.id || payload.user_id;
      
      if (userId) {
        return Number(userId);
      }
      
      // Si no hay userId en el token, el sub contiene el email
      // Necesitarás hacer una petición adicional para obtener el userId por email
      return null;
    } catch (error) {
      return null;
    }
  }

  // Método para extraer email del token JWT
  private extractEmailFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (error) {
      return null;
    }
  }

  // Método para obtener userId por email
  private getUserIdByEmailSync(email: string): void {
    // Usar directamente el método que funciona
    this.http.get<any[]>(`http://localhost:8080/usuarios`).subscribe({
      next: (usuarios) => {
        const usuario = usuarios.find(u => u.email === email);
        if (usuario && usuario.id) {
          this.setUserId(usuario.id);
          this.currentUserId.set(usuario.id);
          
          if (usuario.nombre) {
            this.setUserName(usuario.nombre);
            this.currentUserName.set(usuario.nombre);
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener usuario:', error);
      }
    });
  }

  // Método público para verificar autenticación
  checkAuthentication(): boolean {
    const hasToken = this.hasToken();
    const hasUserId = !!this.getUserId();
    return hasToken && hasUserId;
  }

  inscribirCurso(cursoId: number, usuarioId: number): Observable<any> {
    // Validar que los valores sean números válidos
    if (!cursoId || isNaN(cursoId)) {
      console.error('cursoId inválido:', cursoId);
      throw new Error('ID de curso inválido');
    }
    
    if (!usuarioId || isNaN(usuarioId)) {
      console.error('usuarioId inválido:', usuarioId);
      throw new Error('ID de usuario inválido');
    }

    // Enviar objetos con la estructura que el backend espera (objetos completos)
    const body = {
      curso: {
        id: Number(cursoId)
      },
      usuario: {
        id: Number(usuarioId)
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.cursoRegistroUrl, body, { headers });
  }
}
