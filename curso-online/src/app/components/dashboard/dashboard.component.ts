import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  userName: string | null = null;
  userRole: string | null = null;
  availableCards: DashboardCard[] = [];

  private allCards: DashboardCard[] = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear, editar y administrar usuarios',
      icon: 'fas fa-users',
      route: '/usuarios',
      roles: ['ROLE_ADMIN']
    },
    {
      title: 'Gestión de Cursos',
      description: 'Crear, editar y administrar cursos',
      icon: 'fas fa-book',
      route: '/cursos',
      roles: ['ROLE_ADMIN', 'ROLE_DOCENTE']
    },
    {
      title: 'Cursos Disponibles',
      description: 'Explora e inscríbete en cursos',
      icon: 'fas fa-graduation-cap',
      route: '/cursos-disponibles',
      roles: ['ROLE_ESTUDIANTE']
    },
    {
      title: 'Mis Cursos',
      description: 'Ver tus cursos inscritos',
      icon: 'fas fa-book-reader',
      route: '/mis-cursos',
      roles: ['ROLE_ESTUDIANTE', 'ROLE_DOCENTE']
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole();
    this.filterCardsByRole();
  }

  private filterCardsByRole(): void {
    const userRole = this.authService.getUserRole();
    if (userRole) {
      this.availableCards = this.allCards.filter(card =>
        card.roles.includes(userRole)
      );
    }
  }

  getRoleLabel(): string {
    const role = this.userRole;
    if (role === 'ROLE_ADMIN') return 'Administrador';
    if (role === 'ROLE_DOCENTE') return 'Docente';
    if (role === 'ROLE_ESTUDIANTE') return 'Estudiante';
    return 'Usuario';
  }

  logout(): void {
    this.authService.logout();
  }
}
