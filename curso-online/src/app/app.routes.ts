import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CursosListComponent } from './components/cursos-list/cursos-list.component';
import { CursoFormComponent } from './components/curso-form/curso-form.component';
import { CursosDisponiblesComponent } from './components/cursos-disponibles/cursos-disponibles.component';
import { MisCursosComponent } from './components/mis-cursos/mis-cursos.component';
import { CursoDetalleComponent } from './components/curso-detalle/curso-detalle.component';
import { ListaUsuariosComponent } from './components/usuarios/lista-usuarios/lista-usuarios.component';
import { EditarUsuarioComponent } from './components/usuarios/editar-usuario/editar-usuario.component';

//Agregamos esta dos import
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';


//Modificaciomos para agregar las rutas de acuerod a los roles
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // RUTAS SOLO PARA ADMIN
  {
    path: 'usuarios',
    component: ListaUsuariosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'usuarios/nuevo',
    component: EditarUsuarioComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'usuarios/editar/:id',
    component: EditarUsuarioComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },

  // RUTAS PARA ADMIN Y DOCENTE
  {
    path: 'cursos',
    component: CursosListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_DOCENTE'] }
  },
  {
    path: 'cursos/crear',
    component: CursoFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_DOCENTE'] }
  },
  {
    path: 'cursos/editar/:id',
    component: CursoFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_DOCENTE'] }
  },

  // RUTAS SOLO PARA ESTUDIANTES
  {
    path: 'cursos-disponibles',
    component: CursosDisponiblesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ESTUDIANTE'] }
  },

  // RUTAS PARA ESTUDIANTES Y DOCENTES
  {
    path: 'mis-cursos',
    component: MisCursosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ESTUDIANTE', 'ROLE_DOCENTE'] }
  },
  {
    path: 'curso-detalle/:id',
    component: CursoDetalleComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '/dashboard' }
];
