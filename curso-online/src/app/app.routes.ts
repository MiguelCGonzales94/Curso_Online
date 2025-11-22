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

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'cursos', component: CursosListComponent },
  { path: 'cursos/crear', component: CursoFormComponent },
  { path: 'cursos/editar/:id', component: CursoFormComponent },
  { path: 'curso-detalle/:id', component: CursoDetalleComponent },
  { path: 'cursos-disponibles', component: CursosDisponiblesComponent },
  { path: 'mis-cursos', component: MisCursosComponent },
  { path: 'usuarios', component: ListaUsuariosComponent },
  { path: 'usuarios/nuevo', component: EditarUsuarioComponent },
  { path: 'usuarios/editar/:id', component: EditarUsuarioComponent },
  { path: '**', redirectTo: '/dashboard' }
];
