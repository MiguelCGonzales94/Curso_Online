import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CursoService, Curso, EstadoCurso } from '../../services/curso.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-curso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './curso-form.component.html',
  styleUrls: ['./curso-form.component.css']
})
export class CursoFormComponent implements OnInit {
  cursoForm: FormGroup;
  isEditMode = signal<boolean>(false);
  cursoId: number | null = null;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isDocente = signal<boolean>(false);

  estados = [
    { value: 'PENDIENTE', label: 'Pendiente (Requiere aprobación)' },
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
    { value: 'COMPLETADO', label: 'Completado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'RECHAZADO', label: 'Rechazado' }
  ];

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Verificar si el usuario es docente
    this.isDocente.set(this.authService.isDocente());

    this.cursoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado: [this.isDocente() ? EstadoCurso.PENDIENTE : EstadoCurso.ACTIVO, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.cursoId = +params['id'];
        this.cargarCurso(this.cursoId);
      }
    });

    // Si es docente y está creando un curso nuevo, establecer estado PENDIENTE
    if (this.isDocente() && !this.isEditMode()) {
      this.cursoForm.patchValue({ estado: EstadoCurso.PENDIENTE });
      // Deshabilitar el campo de estado para docentes en modo creación
      this.cursoForm.get('estado')?.disable();
    }
  }

  cargarCurso(id: number): void {
    this.isLoading.set(true);
    this.cursoService.obtenerCurso(id).subscribe({
      next: (curso) => {
        this.cursoForm.patchValue({
          titulo: curso.titulo,
          descripcion: curso.descripcion,
          estado: curso.estado
        });

        // Si es docente, solo puede ver el estado pero no cambiarlo
        if (this.isDocente()) {
          this.cursoForm.get('estado')?.disable();
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error completo:', error);

        if (error.status === 500) {
          this.errorMessage.set('Error interno del servidor.');
        } else if (error.status === 403) {
          this.errorMessage.set('No tienes permisos para acceder a este curso.');
        } else if (error.status === 404) {
          this.errorMessage.set('Curso no encontrado');
        } else {
          this.errorMessage.set('Error al cargar el curso.');
        }

        setTimeout(() => {
          this.router.navigate(['/cursos']);
        }, 3000);
      }
    });
  }

  onSubmit(): void {
    if (this.cursoForm.valid || (this.isDocente() && this.cursoForm.get('estado')?.disabled)) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      // Obtener los valores, incluyendo los deshabilitados
      // Obtener los valores del formulario
      const formValues = this.cursoForm.getRawValue();

      const cursoData: Curso = {
        titulo: formValues.titulo,
        descripcion: formValues.descripcion,
        estado: formValues.estado as EstadoCurso
      };

      // Si es docente creando un curso, asegurar que esté en PENDIENTE
      if (this.isDocente() && !this.isEditMode()) {
        cursoData.estado = EstadoCurso.PENDIENTE;
      }

      console.log('Datos a enviar:', cursoData);

      const request = this.isEditMode() && this.cursoId
        ? this.cursoService.actualizarCurso(this.cursoId, cursoData)
        : this.cursoService.crearCurso(cursoData);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);

          if (this.isDocente() && !this.isEditMode()) {
            this.successMessage.set('Curso creado correctamente. Está pendiente de aprobación por un administrador.');
          } else {
            this.successMessage.set(
              this.isEditMode() ? 'Curso actualizado correctamente' : 'Curso creado correctamente'
            );
          }

          setTimeout(() => {
            this.router.navigate(['/cursos']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          if (error.status === 403) {
            this.errorMessage.set('No tienes permisos. Por favor, inicia sesión nuevamente.');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 401) {
            this.errorMessage.set('Sesión expirada. Redirigiendo al login...');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage.set('Error al guardar el curso.');
          }
          console.error('Error completo:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.cursoForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.cursoForm.get(field);
    if (control?.hasError('required') && control.touched) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength') && control.touched) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }

  cancelar(): void {
    this.router.navigate(['/cursos']);
  }

  mostrarCampoEstado(): boolean {
    // Mostrar campo de estado solo si es admin o si es docente en modo edición
    return !this.isDocente() || this.isEditMode();
  }
}
