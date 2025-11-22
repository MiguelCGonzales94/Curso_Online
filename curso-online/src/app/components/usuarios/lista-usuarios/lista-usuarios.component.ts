import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../services/usuario.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  cargando: boolean = false;
  error: string = '';
  terminoBusqueda: string = '';
  mostrarModalEliminar: boolean = false;
  usuarioAEliminar: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';
    console.log('Cargando usuarios...');
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        console.log('Usuarios cargados:', data);
        // Mapear los roles del backend al frontend para visualización
        this.usuarios = data.map(usuario => ({
          ...usuario,
          rol: this.mapearRolDesdeBackend(usuario.rol)
        }));
        this.usuariosFiltrados = this.usuarios;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'Error al cargar los usuarios: ' + (err.error?.message || err.message);
        this.cargando = false;
      }
    });
  }

  private mapearRolDesdeBackend(rol: any): 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN' {
    const roleMap: { [key: string]: 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN' } = {
      'ROLE_ESTUDIANTE': 'ESTUDIANTE',
      'ROLE_DOCENTE': 'DOCENTE',
      'ROLE_ADMIN': 'ADMIN'
    };
    return roleMap[rol] || 'ESTUDIANTE';
  }

  buscarUsuarios(): void {
    if (this.terminoBusqueda.trim() === '') {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    }
  }

  crearUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  volverDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  editarUsuario(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
  }

  confirmarEliminar(usuario: Usuario): void {
    this.usuarioAEliminar = usuario;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.mostrarModalEliminar = false;
    this.usuarioAEliminar = null;
  }

  eliminarUsuario(): void {
    if (this.usuarioAEliminar && this.usuarioAEliminar.id) {
      this.usuarioService.eliminarUsuario(this.usuarioAEliminar.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.mostrarModalEliminar = false;
          this.usuarioAEliminar = null;
        },
        error: (err) => {
          this.error = 'Error al eliminar el usuario';
          console.error(err);
          this.mostrarModalEliminar = false;
        }
      });
    }
  }
}
