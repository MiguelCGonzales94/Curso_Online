import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaUsuariosComponent } from './components/usuarios/lista-usuarios/lista-usuarios.component';
import { EditarUsuarioComponent } from './components/usuarios/editar-usuario/editar-usuario.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'usuarios', component: ListaUsuariosComponent },
  { path: 'usuarios/nuevo', component: EditarUsuarioComponent },
  { path: 'usuarios/editar/:id', component: EditarUsuarioComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    enableTracing: false,
    useHash: false 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }