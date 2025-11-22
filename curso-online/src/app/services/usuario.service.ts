import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { AuthService } from './auth.service';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol?: 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN';
  telefono?: string;
  fechaRegistro?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/usuarios';
  private authUrl = 'http://localhost:8080/auth';

  constructor(
    private http: HttpClient,
    //private authService: AuthService
  ) {}

 // private getHeaders(): HttpHeaders {
 //   const token = this.authService.getToken();
 //   return new HttpHeaders({
 //     'Content-Type': 'application/json',
 //     'Authorization': `Bearer ${token}`
 //   });
 // }

  // Obtener todos los usuarios
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Obtener un usuario por ID
  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo usuario (usando el endpoint de registro)
  crearUsuario(usuario: Usuario): Observable<any> {
    // Mapear los roles del frontend a los roles del backend
    const roleMap: { [key: string]: string } = {
      'ESTUDIANTE': 'ROLE_ESTUDIANTE',
      'DOCENTE': 'ROLE_DOCENTE',
      'ADMIN': 'ROLE_ADMIN'
    };

    const registerData = {
      email: usuario.email,
      password: usuario.password,
      nombre: usuario.nombre,
      role: roleMap[usuario.rol || 'ESTUDIANTE']
    };
    console.log('Enviando datos de registro:', registerData);
    return this.http.post(`${this.authUrl}/register`, registerData);
  }

  // Actualizar un usuario existente
  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  // Eliminar un usuario
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener el perfil del usuario actual
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`);
  }

  // Actualizar el perfil del usuario actual
  actualizarPerfil(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/perfil`, usuario);
  }

  // Buscar usuarios por nombre o email
  buscarUsuarios(termino: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/buscar?q=${termino}`);
  }
}
