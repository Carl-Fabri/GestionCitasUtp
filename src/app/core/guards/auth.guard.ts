import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { inject } from "@angular/core";
import { Router } from "express";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isAuthenticated()) {
      router.navigateByUrl("dashboard", { replaceUrl: true });
      return false;
    }
      return true;
};
