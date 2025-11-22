import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  curso = signal<CursoDetalle | null>(null);
  leccionActual = signal<Leccion | null>(null);
  progreso = signal<number>(0);

  private cursosEjemplo: CursoDetalle[] = [
    {
      id: 7,
      titulo: 'Introducción a Angular',
      descripcion: 'Aprende los fundamentos de Angular',
      instructor: 'Juan Pérez',
      duracionTotal: '10 horas',
      progreso: 30,
      lecciones: [
        { id: 1, titulo: 'Introducción a Angular', duracion: '15 min', completada: true, contenido: 'Angular es un framework de desarrollo web...' },
        { id: 2, titulo: 'Componentes', duracion: '25 min', completada: true, contenido: 'Los componentes son la base de Angular...' },
        { id: 3, titulo: 'Directivas', duracion: '20 min', completada: false, contenido: 'Las directivas permiten manipular el DOM...' },
        { id: 4, titulo: 'Servicios', duracion: '30 min', completada: false, contenido: 'Los servicios son clases que comparten lógica...' },
        { id: 5, titulo: 'Routing', duracion: '25 min', completada: false, contenido: 'El routing permite navegar entre páginas...' }
      ]
    },
    {
      id: 1,
      titulo: 'Curso de ejemplo',
      descripcion: 'Este es un curso de ejemplo',
      instructor: 'Instructor Demo',
      duracionTotal: '5 horas',
      progreso: 0,
      lecciones: [
        { id: 1, titulo: 'Introducción', duracion: '10 min', completada: false, contenido: 'Bienvenido al curso...' },
        { id: 2, titulo: 'Conceptos básicos', duracion: '20 min', completada: false, contenido: 'En esta lección veremos...' }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const cursoId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID del curso:', cursoId);
    this.cargarCurso(cursoId);
  }

  cargarCurso(cursoId: number): void {
    const cursoEncontrado = this.cursosEjemplo.find(c => c.id === cursoId);
    
    if (cursoEncontrado) {
      this.curso.set(cursoEncontrado);
      this.progreso.set(cursoEncontrado.progreso);
      if (cursoEncontrado.lecciones.length > 0) {
        this.seleccionarLeccion(cursoEncontrado.lecciones[0]);
      }
    } else {
      console.error('Curso no encontrado');
    }
  }

  seleccionarLeccion(leccion: Leccion): void {
    this.leccionActual.set(leccion);
  }

  marcarComoCompletada(leccion: Leccion): void {
    const cursoActual = this.curso();
    if (!cursoActual) return;

    leccion.completada = !leccion.completada;
    
    const leccionesCompletadas = cursoActual.lecciones.filter(l => l.completada).length;
    const progresoCalculado = Math.round((leccionesCompletadas / cursoActual.lecciones.length) * 100);
    this.progreso.set(progresoCalculado);
    cursoActual.progreso = progresoCalculado;
  }

  siguienteLeccion(): void {
    const cursoActual = this.curso();
    const leccionAct = this.leccionActual();
    
    if (!cursoActual || !leccionAct) return;

    const indiceActual = cursoActual.lecciones.findIndex(l => l.id === leccionAct.id);
    if (indiceActual < cursoActual.lecciones.length - 1) {
      this.seleccionarLeccion(cursoActual.lecciones[indiceActual + 1]);
    }
  }

  leccionAnterior(): void {
    const cursoActual = this.curso();
    const leccionAct = this.leccionActual();
    
    if (!cursoActual || !leccionAct) return;

    const indiceActual = cursoActual.lecciones.findIndex(l => l.id === leccionAct.id);
    if (indiceActual > 0) {
      this.seleccionarLeccion(cursoActual.lecciones[indiceActual - 1]);
    }
  }

  volverAMisCursos(): void {
    this.router.navigate(['/mis-cursos']);
  }
}
