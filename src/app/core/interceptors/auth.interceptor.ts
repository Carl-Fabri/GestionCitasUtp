import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { UserStorageService } from '../../services/user-storage.service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private userStorage = inject(UserStorageService);
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No agregar token a las rutas de autenticación
    if (this.isAuthRoute(req.url)) {
      return next.handle(req);
    }

    // Obtener el token del storage
    let token = this.userStorage.getToken();
    const refreshToken = this.userStorage.getRefreshToken();

    // Si no hay token pero hay refresh token, intentar renovar primero
    if (!token && refreshToken) {
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          const newToken = this.userStorage.getToken();
          if (newToken) {
            const authReq = req.clone({
              setHeaders: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
            return next.handle(authReq);
          }
          return next.handle(req);
        }),
        catchError((error) => {
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }

    if (token) {
      // Clonar la petición y agregar el header de autorización
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el token expiró (401), intentar renovarlo
          if (error.status === 401 && !this.isAuthRoute(req.url)) {
            return this.handle401Error(authReq, next);
          }

          return throwError(() => error);
        })
      );
    }

    // Si no hay token ni refresh token, enviar la petición sin modificar
    return next.handle(req);
  }  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = this.userStorage.getRefreshToken();

    if (refreshToken) {
      // Intentar renovar el token
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          // Reintentar la petición original con el nuevo token
          const newToken = this.userStorage.getToken();
          const newAuthReq = req.clone({
            setHeaders: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            }
          });

          return next.handle(newAuthReq);
        }),
        catchError((refreshError) => {
          // Si falla la renovación, hacer logout
          this.authService.logout();
          return throwError(() => refreshError);
        })
      );
    } else {
      // No hay refresh token, hacer logout
      this.authService.logout();
      return throwError(() => new Error('Token expirado y no hay refresh token'));
    }
  }

  private isAuthRoute(url: string): boolean {
    const authRoutes = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password'];
    return authRoutes.some(route => url.includes(route));
  }
}
