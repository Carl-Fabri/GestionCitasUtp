import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';
import { User } from '../../core/interfaces/user';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-profile-container">
      <div class="profile-card" *ngIf="currentUser">
        <div class="profile-header">
          <h2>Perfil de Usuario</h2>
          <button
            class="refresh-btn"
            (click)="refreshProfile()"
            [disabled]="isLoading">
            {{ isLoading ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>

        <div class="profile-content">
          <div class="profile-item">
            <label>ID:</label>
            <span>{{ currentUser.id }}</span>
          </div>

          <div class="profile-item">
            <label>Nombre:</label>
            <span>{{ currentUser.name }}</span>
          </div>

          <div class="profile-item">
            <label>Email:</label>
            <span>{{ currentUser.email }}</span>
          </div>

          <div class="profile-item">
            <label>DNI:</label>
            <span>{{ currentUser.dni }}</span>
          </div>

          <div class="profile-item">
            <label>Rol:</label>
            <span class="role-badge" [ngClass]="getRoleClass(currentUser.role)">
              {{ currentUser.role }}
            </span>
          </div>

          <div class="profile-item" *ngIf="currentUser.role_id">
            <label>ID del Rol:</label>
            <span>{{ currentUser.role_id }}</span>
          </div>
        </div>

        <div class="profile-actions">
          <button
            class="sync-btn"
            (click)="startAutoSync()"
            [disabled]="autoSyncActive">
            {{ autoSyncActive ? 'Sincronización Activa' : 'Activar Sincronización Auto' }}
          </button>

          <button
            class="logout-btn"
            (click)="logout()">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div class="loading-card" *ngIf="!currentUser && isLoading">
        <p>Cargando información del usuario...</p>
      </div>

      <div class="error-card" *ngIf="!currentUser && !isLoading">
        <p>No se pudo cargar la información del usuario</p>
        <button (click)="refreshProfile()">Reintentar</button>
      </div>
    </div>
  `,
  styles: [`
    .user-profile-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .profile-card, .loading-card, .error-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }

    .profile-header h2 {
      margin: 0;
      color: #333;
    }

    .refresh-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .refresh-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .profile-content {
      display: grid;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .profile-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .profile-item label {
      font-weight: 600;
      color: #555;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .role-admin {
      background: #dc3545;
      color: white;
    }

    .role-doctor {
      background: #28a745;
      color: white;
    }

    .role-patient {
      background: #007bff;
      color: white;
    }

    .role-default {
      background: #6c757d;
      color: white;
    }

    .profile-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .sync-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .sync-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .loading-card, .error-card {
      text-align: center;
    }

    .error-card button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isLoading = false;
  autoSyncActive = false;

  ngOnInit() {
    // Suscribirse a los cambios del usuario
    this.userProfileService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Cargar el perfil del usuario al inicializar
    this.refreshProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshProfile() {
    this.isLoading = true;

    this.userProfileService.loadUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user) {
            console.log('Perfil actualizado:', user);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar perfil:', error);
        }
      });
  }

  startAutoSync() {
    this.autoSyncActive = true;
    this.userProfileService.startUserSync(30); // Sincronizar cada 30 minutos
  }

  logout() {
    this.authService.logout();
    this.userProfileService.clearUser();
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'doctor':
        return 'role-doctor';
      case 'patient':
        return 'role-patient';
      default:
        return 'role-default';
    }
  }
}
