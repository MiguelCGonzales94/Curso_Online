import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { CursoService } from './services/curso.service';
import { CursoRegistroService } from './services/curso-registro.service';
import { UsuarioService } from './services/usuario.service';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AppComponent
  ],
  providers: [
    AuthService,
    CursoService,
    CursoRegistroService,
    UsuarioService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }