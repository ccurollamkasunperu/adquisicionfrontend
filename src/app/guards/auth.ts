import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const clonedReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })
      : req;
    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const isUnauthenticated = error.status === 401 || (error.error && error.error.message === 'Unauthenticated.');
        
        if (isUnauthenticated && this.router.url !== '/login') {
          localStorage.clear();
          swal.fire({
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            window.location.href = '/login';
          });
          // No propagar el error para evitar que aparezca el Swal de error en los componentes
          return EMPTY;
        }
        return throwError(error);
      })
    );
  }
}