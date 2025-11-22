import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor';
            break;
          case 400:
            errorMessage = error.error?.message || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado';
            break;
          case 403:
            errorMessage = 'No tienes permisos';
            break;
          case 404:
            errorMessage = error.error?.message || 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = error.error?.message || 'Error del servidor';
            break;
          default:
            errorMessage = error.error?.message || `Error ${error.status}`;
        }
      }

      console.error('Error HTTP:', errorMessage);

      return throwError(() => ({
        ...error,
        userMessage: errorMessage
      }));
    })
  );
};
