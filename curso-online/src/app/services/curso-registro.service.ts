import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin } from 'rxjs';

//agregamos curso
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
  private usuariosUrl = 'http://localhost:8080/usuarios';
  private cursosUrl = 'http://localhost:8080/cursos';

  constructor(
    private http: HttpClient,
    //  private authService: AuthService
  ) { }

  //private getHeaders(): HttpHeaders {
  //  const token = this.authService.getToken();
  //  return new HttpHeaders({
  //    'Content-Type': 'application/json',
  //    'Authorization': `Bearer ${token}`
  //  });
  //}


  // Inscribirse a un curso
  inscribirseACurso(inscripcion: InscripcionRequest): Observable<CursoRegistro> {
    // Obtener datos completos del usuario y curso
    return forkJoin({
      usuario: this.http.get<Usuario>(`${this.usuariosUrl}/${inscripcion.usuarioId}`),
      curso: this.http.get<Curso>(`${this.cursosUrl}/${inscripcion.cursoId}`)
    }).pipe(
      switchMap(({ usuario, curso }) => {
        // Construir objeto CursoRegistro completo
        const cursoRegistro: CursoRegistro = {
          usuario: usuario,
          curso: curso
        };

        console.log('📤 Enviando inscripción:', cursoRegistro);

        // Enviar al backend
        return this.http.post<CursoRegistro>(this.apiUrl, cursoRegistro);
      })
    );
  }

  // Obtener una inscripción por ID
  obtenerInscripcion(id: number): Observable<CursoRegistro> {
    return this.http.get<CursoRegistro>(`${this.apiUrl}/${id}`);
  }

  // Listar todas las inscripciones
  listarInscripciones(): Observable<CursoRegistro[]> {
    return this.http.get<CursoRegistro[]>(this.apiUrl);
  }

  // Obtener cursos de un usuario específico
  obtenerCursosDeUsuario(usuarioId: number): Observable<CursoRegistro[]> {
    return this.http.get<CursoRegistro[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Cancelar inscripción (eliminar)
  cancelarInscripcion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Verificar si un usuario está inscrito en un curso
  estaInscrito(usuarioId: number, cursoId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verificar/${usuarioId}/${cursoId}`);
  }
}





