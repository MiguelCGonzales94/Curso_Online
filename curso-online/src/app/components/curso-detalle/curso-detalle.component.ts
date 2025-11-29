import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Leccion {
  id: number;
  titulo: string;
  duracion: string;
  completada: boolean;
  contenido: string;
}

interface CursoDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  instructor: string;
  duracionTotal: string;
  progreso: number;
  lecciones: Leccion[];
}

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './curso-detalle.component.html',
  styleUrls: ['./curso-detalle.component.css']
})
export class CursoDetalleComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/cursos';

  curso = signal<CursoDetalle | null>(null);
  leccionActual = signal<Leccion | null>(null);
  progreso = signal<number>(0);
  loading = signal<boolean>(true);
  error = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarCursoDesdeBackend(+id);
      }
    });
  }

  cargarCursoDesdeBackend(id: number) {
    this.loading.set(true);
    this.error.set('');
    this.curso.set(null);

    this.http.get<CursoDetalle>(`${this.apiUrl}/${id}`).subscribe({
      next: (data) => {


        //  Simulación de lecciones si no existen ---
        if (!data.lecciones || data.lecciones.length === 0) {
          data.lecciones = [
            { id: 1, titulo: 'Bienvenida al curso', duracion: '5 min', completada: false, contenido: 'Introducción a ' + data.titulo },
            { id: 2, titulo: 'Conceptos Fundamentales', duracion: '15 min', completada: false, contenido: 'Teoría básica necesaria...' },
            { id: 3, titulo: 'Práctica Final', duracion: '30 min', completada: false, contenido: 'Evaluación de conocimientos...' }
          ];
          data.duracionTotal = '50 min';
          data.instructor = 'Instructor Demo';
          data.progreso = 0;
        }
        // ----------------------------------------------------

        this.curso.set(data);
        this.progreso.set(data.progreso || 0);

        if (data.lecciones && data.lecciones.length > 0) {
          this.seleccionarLeccion(data.lecciones[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error backend:', err);
        this.error.set(`El curso con ID ${id} no existe en la base de datos.`);
        this.loading.set(false);
      }
    });
  }

  seleccionarLeccion(leccion: Leccion) {
    this.leccionActual.set(leccion);
  }

  marcarComoCompletada(leccion: Leccion) {
    leccion.completada = !leccion.completada;
    this.actualizarProgreso();
  }

  actualizarProgreso() {
    const curso = this.curso();
    if (curso && curso.lecciones) {
      const completadas = curso.lecciones.filter(l => l.completada).length;
      const total = curso.lecciones.length;
      const nuevoProgreso = total === 0 ? 0 : Math.round((completadas / total) * 100);
      this.progreso.set(nuevoProgreso);
    }
  }

  siguienteLeccion() {
    const curso = this.curso();
    const actual = this.leccionActual();
    if (curso && actual) {
      const index = curso.lecciones.findIndex(l => l.id === actual.id);
      if (index >= 0 && index < curso.lecciones.length - 1) {
        this.seleccionarLeccion(curso.lecciones[index + 1]);
      }
    }
  }

  leccionAnterior() {
    const curso = this.curso();
    const actual = this.leccionActual();
    if (curso && actual) {
      const index = curso.lecciones.findIndex(l => l.id === actual.id);
      if (index > 0) {
        this.seleccionarLeccion(curso.lecciones[index - 1]);
      }
    }
  }

  siguienteCurso() {
    const cursoActual = this.curso();
    if (cursoActual) {
      this.router.navigate(['/curso-detalle', cursoActual.id + 1]);
    }
  }

  generarCertificado() {
    alert(`¡Felicidades! Generando certificado para: ${this.curso()?.titulo}`);
  }

  volverAMisCursos() {
    this.router.navigate(['/mis-cursos']);
  }
}
