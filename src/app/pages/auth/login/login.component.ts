import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { UserStorageService } from '../../../services/user-storage.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userStorage = inject(UserStorageService);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success) {
            // Mostrar mensaje de éxito
            this.router.navigate(['/admin/manage-appointments']);

            // this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', {
            //   duration: 3000,
            //   panelClass: ['success-snackbar']
            // });

            // Redirigir según el rol del usuario
            this.redirectByRole();
          } else {
            this.showErrorMessage(response.message || 'Error en el inicio de sesión');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);

          // Manejar diferentes tipos de errores
          let errorMessage = 'Error de conexión. Inténtalo de nuevo.';

          if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.showErrorMessage(errorMessage);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched();
    }
  }

  private redirectByRole(): void {
    const userRole = this.userStorage.getRole();

    switch (userRole) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'patient':
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  redirectToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
