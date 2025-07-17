import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponse, RegisterRequest, RegisterResponse, RefreshTokenResponse, AuthMeResponse } from '../core/interfaces/user';
import { Observable, of, tap, catchError, throwError, map } from 'rxjs';
import { UserStorageService } from './user-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _jwtHelper = inject(JwtHelperService);
  private router = inject(Router);
  _apiUrl: string = environment.apiUrl;
  private _storage = inject(UserStorageService);

  constructor(private http: HttpClient) { }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this._apiUrl}auth/login`, data)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this._storage.saveUser(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this._storage.removeUser();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = this._storage.getToken();
    const refreshToken = this._storage.getRefreshToken();

    // Si no hay token de acceso pero hay refresh token, intentar renovar
    if (!token && refreshToken) {
      // En este caso, el interceptor se encargará de renovar el token automáticamente
      return true;
    }

    // Si hay token de acceso, verificar si no ha expirado
    if (token && !this._jwtHelper.isTokenExpired(token)) {
      return true;
    }

    // Si el token expiró pero hay refresh token, aún consideramos autenticado
    if (token && this._jwtHelper.isTokenExpired(token) && refreshToken) {
      return true;
    }

    // Si no hay tokens o el refresh token también expiró, no está autenticado
    if (!refreshToken) {
      this._storage.removeUser();
      return false;
    }

    return false;
  }

  getCurrentUser() {
    return this._storage.getUserInfo();
  }

  getCurrentUserRole(): string | null {
    return this._storage.getRole();
  }

  // Método para verificar y renovar token automáticamente
  checkAndRefreshToken(): Observable<boolean> {
    const token = this._storage.getToken();
    const refreshToken = this._storage.getRefreshToken();

    // Si no hay token pero hay refresh token, renovar automáticamente
    if (!token && refreshToken) {
      return this.refreshToken().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }

    // Si hay token pero está expirado, renovar
    if (token && this._jwtHelper.isTokenExpired(token) && refreshToken) {
      return this.refreshToken().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }

    // Si hay token válido, retornar true
    if (token && !this._jwtHelper.isTokenExpired(token)) {
      return of(true);
    }

    // Si no hay refresh token, retornar false
    return of(false);
  }

  // Método para obtener la información del usuario autenticado desde el servidor
  getMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${this._apiUrl}me`)
      .pipe(
        tap((response) => {
          if (response.data) {
            // Actualizar la información del usuario en el storage
            this._storage.updateUserInfo(response.data);
            console.log('Información del usuario actualizada desde /me');
          }
        }),
        catchError((error) => {
          console.error('Error al obtener información del usuario:', error);

          // Si es un error 401, el interceptor se encargará del refresh token
          if (error.status === 401) {
            return throwError(() => error);
          }

          // Para otros errores, usar el manejador general
          return this.handleError(error);
        })
      );
  }

  // Método para verificar y sincronizar la información del usuario
  syncUserInfo(): Observable<boolean> {
    if (!this.isAuthenticated()) {
      return of(false);
    }

    return this.getMe().pipe(
      map((response) => {
        return response.data ? true : false;
      }),
      catchError((error) => {
        console.error('Error al sincronizar información del usuario:', error);
        return of(false);
      })
    );
  }

  // Método para refrescar el token
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this._storage.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    // Estructura la petición como solicitas: { "refreshToken": "..." }
    const requestBody = {
      refreshToken: refreshToken
    };

    return this.http.post<RefreshTokenResponse>(`${this._apiUrl}auth/refresh-token`, requestBody)
      .pipe(
        tap((response) => {
          // Verifica si la respuesta es exitosa y contiene el nuevo token
          if (response.success && response.data?.token) {
            this._storage.updateAccessToken(response.data.token);
            console.log('Token renovado exitosamente');
          } else {
            console.warn('Respuesta de refresh token no contiene el token esperado');
            throw new Error('Invalid refresh token response');
          }
        }),
        catchError((error) => {
          console.error('Error al renovar token:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }



  register(data: RegisterRequest): Observable<RegisterResponse> {
    // Para pruebas
    return of({} as RegisterResponse);

    // Implementación real (descomenta cuando esté listo)
    // return this.http.post<RegisterResponse>(`${this._apiUrl}auth/register`, data)
    //   .pipe(
    //     tap((response) => {
    //       if (response.success && response.data) {
    //         this._storage.saveUser(response.data);
    //       }
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'Credenciales incorrectas';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en AuthService:', error);
    return throwError(() => ({ ...error, message: errorMessage }));
  }
}
