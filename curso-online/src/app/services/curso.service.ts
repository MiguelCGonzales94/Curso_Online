import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum EstadoCurso {
  PENDIENTE = 'PENDIENTE',
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
  RECHAZADO = 'RECHAZADO'
}

export interface Curso {
  id?: number;
  titulo: string;
  descripcion: string;
  estado: EstadoCurso;
}

export interface EstadisticasCursos {
  pendientes: number;
  aprobados: number;
  rechazados: number;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = 'http://localhost:8080/cursos';
  private aprobacionUrl = 'http://localhost:8080/cursos/aprobacion';

  constructor(private http: HttpClient) {}

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

  // Nuevos métodos para aprobación
  listarCursosPendientes(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.aprobacionUrl}/pendientes`);
  }

  aprobarCurso(id: number): Observable<any> {
    return this.http.put(`${this.aprobacionUrl}/${id}/aprobar`, {});
  }

  rechazarCurso(id: number): Observable<any> {
    return this.http.put(`${this.aprobacionUrl}/${id}/rechazar`, {});
  }

  obtenerEstadisticas(): Observable<EstadisticasCursos> {
    return this.http.get<EstadisticasCursos>(`${this.aprobacionUrl}/estadisticas`);
  }

  // Métodos existentes para inscripción
  inscribirCurso(cursoId: number, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cursoregistros`, {
      cursoId,
      usuarioId
    });
  }
}
