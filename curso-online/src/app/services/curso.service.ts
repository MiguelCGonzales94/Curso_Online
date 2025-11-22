import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

//import { AuthService } from './auth.service';

export enum EstadoCurso {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export interface Curso {
  id?: number;
  titulo: string;
  descripcion: string;
  estado: EstadoCurso;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = 'http://localhost:8080/cursos';

  constructor(
    private http: HttpClient,
    //private authService: AuthService
  ) {}

  //*private getHeaders(): HttpHeaders {
  //  const token = this.authService.getToken();
  //  return new HttpHeaders({
  //    'Content-Type': 'application/json',
  //    'Authorization': `Bearer ${token}`
  //  });
  //}


crearCurso(curso: Curso): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, curso);
  }

  obtenerCurso(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  listarCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  actualizarCurso(id: number, curso: Curso): Observable<Curso> {
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, curso);
  }

  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  inscribirCurso(cursoId: number, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursoregistros`, {
      cursoId,
      usuarioId
    });
  }

  inscribirCursoPorUrl(cursoId: number, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursoregistros/${cursoId}/${usuarioId}`, {});
  }

  inscribirCursoQueryParams(cursoId: number, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursoregistros?cursoId=${cursoId}&usuarioId=${usuarioId}`, {});
  }
}
