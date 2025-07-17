import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, interval, switchMap, of } from 'rxjs';
import { AuthService } from './auth.service';
import { UserStorageService } from './user-storage.service';
import { User } from '../core/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private authService = inject(AuthService);
  private userStorage = inject(UserStorageService);

  // Subject para mantener la información del usuario actualizada
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    // Inicializar con la información del usuario del storage
    const currentUser = this.userStorage.getUser();
    if (currentUser) {
      this.userSubject.next(currentUser);
    }
  }

  /**
   * Obtiene la información del usuario desde el servidor y actualiza el estado local
   */
  loadUserProfile(): Observable<User | null> {
    return this.authService.getMe().pipe(
      switchMap(response => {
        if (response.data) {
          this.userSubject.next(response.data);
          return of(response.data);
        }
        return of(null);
      })
    );
  }

  /**
   * Sincroniza la información del usuario periódicamente
   * Útil para mantener actualizada la información del usuario
   */
  startUserSync(intervalMinutes: number = 30): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Sincronizar cada X minutos
    interval(intervalMinutes * 60 * 1000)
      .pipe(
        switchMap(() => {
          if (this.authService.isAuthenticated()) {
            return this.loadUserProfile();
          }
          return of(null);
        })
      )
      .subscribe({
        next: (user) => {
          if (user) {
            console.log('Usuario sincronizado automáticamente');
          }
        },
        error: (error) => {
          console.error('Error en sincronización automática del usuario:', error);
        }
      });
  }

  /**
   * Obtiene la información del usuario actual del storage
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    return this.getCurrentUser()?.id || null;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getCurrentUserRole(): string | null {
    return this.getCurrentUser()?.role || null;
  }

  /**
   * Limpia la información del usuario
   */
  clearUser(): void {
    this.userSubject.next(null);
  }
}
