import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CursoService, Curso, EstadoCurso } from '../../services/curso.service';

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

  estados = [
    { value: EstadoCurso.ACTIVO, label: 'Activo' },
    { value: EstadoCurso.INACTIVO, label: 'Inactivo' },
    { value: EstadoCurso.COMPLETADO, label: 'Completado' },
    { value: EstadoCurso.CANCELADO, label: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cursoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado: [EstadoCurso.ACTIVO, [Validators.required]]
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
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error completo:', error);
        
        if (error.status === 500) {
          this.errorMessage.set('Error interno del servidor. Verifica que el curso existe y que el backend esté configurado correctamente.');
        } else if (error.status === 403) {
          this.errorMessage.set('No tienes permisos para acceder a este curso. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 404) {
          this.errorMessage.set('Curso no encontrado');
        } else if (error.status === 0) {
          this.errorMessage.set('No se puede conectar con el servidor. Verifica que el backend esté en ejecución.');
        } else {
          this.errorMessage.set('Error al cargar el curso. Verifica tu conexión.');
        }
        
        setTimeout(() => {
          this.router.navigate(['/cursos']);
        }, 3000);
      }
    });
  }

  onSubmit(): void {
    if (this.cursoForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const cursoData: Curso = this.cursoForm.value;

      const request = this.isEditMode() && this.cursoId
        ? this.cursoService.actualizarCurso(this.cursoId, cursoData)
        : this.cursoService.crearCurso(cursoData);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            this.isEditMode() ? 'Curso actualizado correctamente' : 'Curso creado correctamente'
          );
          setTimeout(() => {
            this.router.navigate(['/cursos']);
          }, 1500);
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
            this.errorMessage.set('Error al guardar el curso. Verifica que el backend esté funcionando.');
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
}
