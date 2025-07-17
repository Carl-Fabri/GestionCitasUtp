import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
      const userRole = authService.getCurrentUserRole();

      switch (userRole) {
        case 'admin':
          router.navigate(['/admin/manage-appointments']);
          break;
        case 'doctor':
          // router.navigate(['/doctor/dashboard']);
          break;
        case 'patient':
          // router.navigate(['/patient/dashboard']);
          break;
        default:
          // router.navigate(['/dashboard']);
          break;
      }

      return false;
    }

    return true;
};

export const protectedGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
      return true; // Permitir acceso a rutas protegidas si está autenticado
    }

    // Redirigir a login si no está autenticado
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
};
