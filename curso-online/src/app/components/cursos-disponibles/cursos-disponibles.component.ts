import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CursoService, Curso, EstadoCurso } from '../../services/curso.service';
import { CursoRegistroService } from '../../services/curso-registro.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cursos-disponibles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cursos-disponibles.component.html',
  styleUrls: ['./cursos-disponibles.component.css']
})
export class CursosDisponiblesComponent implements OnInit {
  cursos = signal<Curso[]>([]);
  cursosInscritos = signal<Set<number>>(new Set());
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  procesandoInscripcion = signal<number | null>(null);

  constructor(
    private cursoService: CursoService,
    private cursoRegistroService: CursoRegistroService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.authService.checkAuthentication()) {
        this.errorMessage.set('Debes iniciar sesión para ver los cursos');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        return;
      }

      this.cargarCursosDisponibles();
    }, 500);
  }

  cargarCursosDisponibles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cursoService.listarCursos().subscribe({
      next: (data) => {
        const cursosActivos = data.filter(curso => curso.estado === EstadoCurso.ACTIVO);
        this.cursos.set(cursosActivos);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al cargar los cursos disponibles');
        console.error('Error:', error);
      }
    });
  }

  inscribirse(cursoId: number): void {
    if (!cursoId) {
      return;
    }

    if (!this.authService.checkAuthentication()) {
      this.errorMessage.set('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    const usuarioId = this.authService.currentUserId();

    if (!usuarioId) {
      this.errorMessage.set('Error al obtener tu información. Por favor, inicia sesión nuevamente.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.procesandoInscripcion.set(cursoId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cursoRegistroService.inscribirseACurso({ usuarioId, cursoId }).subscribe({
      next: (response: any) => {
        this.procesandoInscripcion.set(null);
        this.successMessage.set('¡Te has inscrito exitosamente al curso!');
        this.cursosInscritos().add(cursoId);

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        this.procesandoInscripcion.set(null);

        if (error.status === 409) {
          this.errorMessage.set('Ya estás inscrito en este curso');
        } else if (error.status === 403 || error.status === 401) {
          this.errorMessage.set('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 400) {
          this.errorMessage.set('Datos inválidos. Verifica tu información.');
        } else if (error.status === 500) {
          this.errorMessage.set('Error en el servidor. Por favor, intenta más tarde.');
        } else if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('Error al inscribirse al curso. Intenta de nuevo.');
        }

        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      }
    });
  }

  estaInscrito(cursoId: number): boolean {
    return this.cursosInscritos().has(cursoId);
  }

  estaProcesando(cursoId: number): boolean {
    return this.procesandoInscripcion() === cursoId;
  }
}
