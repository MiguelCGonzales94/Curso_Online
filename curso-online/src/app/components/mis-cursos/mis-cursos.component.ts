import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { EstadoCurso } from '../../services/curso.service';

interface CursoInscripcion {
  id?: number;
  curso: {
    id: number;
    titulo: string;
    descripcion: string;
    estado: EstadoCurso;
  };
  usuario: {
    id: number;
    nombre: string;
  };
}

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-cursos.component.html',
  styleUrls: ['./mis-cursos.component.css']
})
export class MisCursosComponent implements OnInit {
  misCursos = signal<CursoInscripcion[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  cancelando = signal<number | null>(null);

  private apiUrl = 'http://localhost:8080/cursoregistros';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMisCursos();
  }

  cargarMisCursos(): void {
    const usuarioId = this.authService.currentUserId();
    
    if (!usuarioId) {
      this.errorMessage.set('Debes iniciar sesión');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    console.log('Cargando cursos para usuario ID:', usuarioId);

    this.http.get<CursoInscripcion[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('Todos los registros RAW:', JSON.stringify(data, null, 2));
        
        // Filtrar por usuario actual
        const misCursosData = data.filter(
          inscripcion => {
            console.log('Inscripción completa:', inscripcion);
            console.log('ID de inscripción:', inscripcion.id);
            console.log('Comparando:', inscripcion.usuario?.id, 'con', usuarioId);
            return inscripcion.usuario && inscripcion.usuario.id === usuarioId;
          }
        );
        
        console.log('Cursos filtrados:', misCursosData);
        
        // Verificar si hay IDs
        misCursosData.forEach((inscripcion, index) => {
          console.log(`Inscripción ${index}: ID = ${inscripcion.id}`);
        });
        
        this.misCursos.set(misCursosData);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        
        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 500) {
          this.errorMessage.set('Error en el servidor. Por favor, intenta más tarde.');
        } else {
          this.errorMessage.set('Error al cargar tus cursos');
        }
        
        console.error('Error al cargar cursos:', error);
        console.error('Error completo:', error.error);
      }
    });
  }

  cancelarInscripcion(inscripcionId: number): void {
    if (!inscripcionId || inscripcionId === 0) {
      console.error('ID de inscripción es undefined o 0');
      console.error('Todas las inscripciones:', this.misCursos());
      this.errorMessage.set('⚠️ No se puede cancelar: ID de inscripción no disponible. El backend no está devolviendo IDs.');
      
      setTimeout(() => {
        this.errorMessage.set('');
      }, 5000);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas cancelar esta inscripción? Esta acción se reflejará en el servidor.')) {
      return;
    }

    console.log('Cancelando inscripción ID:', inscripcionId);
    console.log('URL completa:', `${this.apiUrl}/${inscripcionId}`);

    this.cancelando.set(inscripcionId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.delete(`${this.apiUrl}/${inscripcionId}`).subscribe({
      next: () => {
        this.cancelando.set(null);
        this.successMessage.set('✅ Inscripción cancelada exitosamente en el servidor');
        
        const cursosActuales = this.misCursos();
        this.misCursos.set(cursosActuales.filter(c => c.id !== inscripcionId));
        
        console.log('Inscripción eliminada exitosamente del backend');
        
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error) => {
        this.cancelando.set(null);
        console.error('Error al cancelar inscripción:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        console.error('URL intentada:', `${this.apiUrl}/${inscripcionId}`);
        
        if (error.status === 404) {
          this.errorMessage.set('❌ La inscripción no existe en el servidor');
        } else if (error.status === 500) {
          this.errorMessage.set('❌ Error en el servidor. Por favor, intenta más tarde.');
        } else if (error.status === 403 || error.status === 401) {
          this.errorMessage.set('❌ No tienes permisos para cancelar esta inscripción');
        } else {
          this.errorMessage.set('❌ Error al cancelar la inscripción en el servidor');
        }
        
        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      }
    });
  }

  trackByInscripcion(index: number, inscripcion: CursoInscripcion): any {
    // Usar el ID si existe, sino usar una combinación de curso e index
    return inscripcion.id || `${inscripcion.curso.id}-${inscripcion.usuario.id}-${index}`;
  }

  estaCancelando(inscripcionId: number): boolean {
    return this.cancelando() === inscripcionId;
  }

  getEstadoClass(estado: EstadoCurso): string {
    return estado === EstadoCurso.ACTIVO ? 'estado-activo' : 'estado-inactivo';
  }

  getEstadoLabel(estado: EstadoCurso): string {
    return estado === EstadoCurso.ACTIVO ? 'Activo' : 'Inactivo';
  }

  accederAlCurso(cursoId: number): void {
    this.router.navigate(['/curso-detalle', cursoId]);
  }
}
