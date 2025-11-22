import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../../services/usuario.service';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent implements OnInit {
  usuarioForm: FormGroup;
  modoEdicion: boolean = false;
  usuarioId: number | null = null;
  cargando: boolean = false;
  guardando: boolean = false;
  error: string = '';
  mostrarPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      rol: ['ESTUDIANTE', Validators.required],
      telefono: ['', [Validators.pattern(/^\d{9,15}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicion = true;
        this.usuarioId = +params['id'];
        this.cargarUsuario();
        // En modo edición, password no es requerido
        this.usuarioForm.get('password')?.clearValidators();
      } else {
        // En modo creación, password es requerido
        this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      this.usuarioForm.get('password')?.updateValueAndValidity();
    });
  }

  cargarUsuario(): void {
    if (this.usuarioId) {
      this.cargando = true;
      this.usuarioService.obtenerUsuario(this.usuarioId).subscribe({
        next: (usuario) => {
          // Mapear rol del backend al formato del frontend
          const rolMapeado = this.mapearRolDesdeBackend(usuario.rol);
          this.usuarioForm.patchValue({
            nombre: usuario.nombre,
            email: usuario.email,
            rol: rolMapeado,
            telefono: usuario.telefono || ''
          });
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar el usuario';
          this.cargando = false;
          console.error(err);
        }
      });
    }
  }

  private mapearRolDesdeBackend(rol: any): 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN' {
    const roleMap: { [key: string]: 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN' } = {
      'ROLE_ESTUDIANTE': 'ESTUDIANTE',
      'ROLE_DOCENTE': 'DOCENTE',
      'ROLE_ADMIN': 'ADMIN'
    };
    return roleMap[rol] || 'ESTUDIANTE';
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.guardando = true;
      this.error = '';

      const usuario: Usuario = this.usuarioForm.value;

      // Si está en modo edición y no se ingresó password, no lo enviamos
      if (this.modoEdicion && !usuario.password) {
        delete usuario.password;
      }

      if (this.modoEdicion && this.usuarioId) {
        this.usuarioService.actualizarUsuario(this.usuarioId, usuario).subscribe({
          next: () => {
            this.guardando = false;
            this.router.navigate(['/usuarios']);
          },
          error: (err) => {
            this.error = err.error?.message || 'Error al actualizar el usuario';
            this.guardando = false;
            console.error('Error completo:', err);
          }
        });
      } else {
        console.log('Creando usuario:', usuario);
        this.usuarioService.crearUsuario(usuario).subscribe({
          next: (response) => {
            console.log('Usuario creado exitosamente:', response);
            this.guardando = false;
            // Usar timeout para asegurar que el backend procese antes de navegar
            setTimeout(() => {
              this.router.navigate(['/usuarios']);
            }, 500);
          },
          error: (err) => {
            console.error('Error completo al crear:', err);
            this.error = err.error?.message || err.error?.error || 'Error al crear el usuario';
            this.guardando = false;
          }
        });
      }
    } else {
      this.marcarCamposComoTocados();
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      this.usuarioForm.get(key)?.markAsTouched();
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  esInvalido(campo: string): boolean {
    const control = this.usuarioForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obtenerMensajeError(campo: string): string {
    const control = this.usuarioForm.get(campo);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido';
    }
    return '';
  }
}
