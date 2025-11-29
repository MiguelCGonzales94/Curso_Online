import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CursoService, Curso, EstadoCurso } from '../../services/curso.service';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.css']
})
export class CursosListComponent implements OnInit {
  cursos = signal<Curso[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private cursoService: CursoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cursoService.listarCursos().subscribe({
      next: (data) => {
        this.cursos.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 403 || error.status === 401) {
          this.errorMessage.set('Sesión expirada. Por favor, inicia sesión nuevamente.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage.set('Error al cargar los cursos. Verifica tu conexión.');
        }
        console.error('Error:', error);
      }
    });
  }

  eliminarCurso(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    console.log('Eliminando curso ID:', id);

    this.cursoService.eliminarCurso(id).subscribe({
      next: () => {
        this.successMessage.set('Curso eliminado exitosamente');

        const cursosActuales = this.cursos();
        this.cursos.set(cursosActuales.filter(c => c.id !== id));

        console.log('Curso eliminado exitosamente');

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error) => {
        console.error('Error al eliminar curso:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);

        if (error.status === 404) {
          this.errorMessage.set('El curso no existe');
        } else if (error.status === 500) {
          this.errorMessage.set('No se puede eliminar el curso porque tiene estudiantes inscritos o hay un error en el servidor');
        } else if (error.status === 403 || error.status === 401) {
          this.errorMessage.set('No tienes permisos para eliminar este curso');
        } else if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('Error al eliminar el curso. Por favor, intenta de nuevo.');
        }

        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      }
    });
  }

  editarCurso(id: number): void {
    this.router.navigate(['/cursos/editar', id]);
  }

  getEstadoClass(estado: EstadoCurso): string {
    const classes: { [key in EstadoCurso]: string } = {
      [EstadoCurso.PENDIENTE]: 'estado-pendiente',
      [EstadoCurso.ACTIVO]: 'estado-activo',
      [EstadoCurso.INACTIVO]: 'estado-inactivo',
      [EstadoCurso.COMPLETADO]: 'estado-completado',
      [EstadoCurso.CANCELADO]: 'estado-cancelado',
      [EstadoCurso.RECHAZADO]: 'estado-rechazado'
    };
    return classes[estado];
  }

  getEstadoLabel(estado: EstadoCurso): string {
    const labels: { [key in EstadoCurso]: string } = {
      [EstadoCurso.PENDIENTE]: 'Pendiente',
      [EstadoCurso.ACTIVO]: 'Activo',
      [EstadoCurso.INACTIVO]: 'Inactivo',
      [EstadoCurso.COMPLETADO]: 'Completado',
      [EstadoCurso.CANCELADO]: 'Cancelado',
      [EstadoCurso.RECHAZADO]: 'Rechazado'
    };
    return labels[estado];
  }
}
