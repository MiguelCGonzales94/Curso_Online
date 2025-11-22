import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { AuthService } from './auth.service';
import { Curso } from './curso.service';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface CursoRegistro {
  id?: number;
  usuario: Usuario;
  curso: Curso;
}

export interface InscripcionRequest {
  usuarioId: number;
  cursoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CursoRegistroService {
  private apiUrl = 'http://localhost:8080/cursoregistros';

  constructor(
      private http: HttpClient,
  //  private authService: AuthService
  ) {}

  //private getHeaders(): HttpHeaders {
  //  const token = this.authService.getToken();
  //  return new HttpHeaders({
  //    'Content-Type': 'application/json',
  //    'Authorization': `Bearer ${token}`
  //  });
  //}

  // Inscribirse a un curso
  inscribirseACurso(inscripcion: InscripcionRequest): Observable<CursoRegistro> {
    return this.http.post<CursoRegistro>(this.apiUrl, inscripcion,);
  }

  // Obtener una inscripción por ID
  obtenerInscripcion(id: number): Observable<CursoRegistro> {
    return this.http.get<CursoRegistro>(`${this.apiUrl}/${id}`,);
  }

  // Listar todas las inscripciones
  listarInscripciones(): Observable<CursoRegistro[]> {
    return this.http.get<CursoRegistro[]>(this.apiUrl,);
  }

  // Obtener cursos de un usuario específico
  obtenerCursosDeUsuario(usuarioId: number): Observable<CursoRegistro[]> {
    return this.http.get<CursoRegistro[]>(`${this.apiUrl}/usuario/${usuarioId}`,);
  }

  // Cancelar inscripción (eliminar)
  cancelarInscripcion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`,);
  }

  // Verificar si un usuario está inscrito en un curso
  estaInscrito(usuarioId: number, cursoId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verificar/${usuarioId}/${cursoId}`);
  }
}
