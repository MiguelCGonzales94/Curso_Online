import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
//import { provideHttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

//Archivos agregados
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      //Interceptores
        withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
