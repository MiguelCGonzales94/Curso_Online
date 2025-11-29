import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CursoService, Curso, EstadoCurso, EstadisticasCursos } from '../../services/curso.service';

@Component({
  selector: 'app-aprobacion-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aprobacion-cursos.component.html',
  styleUrls: ['./aprobacion-cursos.component.css']
})
export class AprobacionCursosComponent implements OnInit {
  cursosPendientes = signal<Curso[]>([]);
  estadisticas = signal<EstadisticasCursos | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  procesando = signal<number | null>(null);

  constructor(
    private cursoService: CursoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCursosPendientes();
    this.cargarEstadisticas();
  }

  cargarCursosPendientes(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cursoService.listarCursosPendientes().subscribe({
      next: (data) => {
        this.cursosPendientes.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al cargar los cursos pendientes');
        console.error('Error:', error);
      }
    });
  }

  cargarEstadisticas(): void {
    this.cursoService.obtenerEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas.set(data);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  aprobarCurso(id: number): void {
    if (!confirm('¿Estás seguro de aprobar este curso? Estará disponible para inscripción.')) {
      return;
    }

    this.procesando.set(id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cursoService.aprobarCurso(id).subscribe({
      next: () => {
        this.procesando.set(null);
        this.successMessage.set('✅ Curso aprobado exitosamente');

        // Actualizar lista y estadísticas
        this.cargarCursosPendientes();
        this.cargarEstadisticas();

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error) => {
        this.procesando.set(null);
        this.errorMessage.set('❌ Error al aprobar el curso');
        console.error('Error:', error);

        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      }
    });
  }

  rechazarCurso(id: number): void {
    if (!confirm('¿Estás seguro de rechazar este curso? Esta acción no se puede deshacer.')) {
      return;
    }

    this.procesando.set(id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cursoService.rechazarCurso(id).subscribe({
      next: () => {
        this.procesando.set(null);
        this.successMessage.set('✅ Curso rechazado');

        // Actualizar lista y estadísticas
        this.cargarCursosPendientes();
        this.cargarEstadisticas();

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error) => {
        this.procesando.set(null);
        this.errorMessage.set('❌ Error al rechazar el curso');
        console.error('Error:', error);

        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      }
    });
  }

  estaProcesando(id: number): boolean {
    return this.procesando() === id;
  }

  verDetalles(curso: Curso): void {
    // Aquí podrías abrir un modal o navegar a una vista detallada
    alert(`Detalles del curso:\n\nTítulo: ${curso.titulo}\n\nDescripción: ${curso.descripcion}`);
  }
}
