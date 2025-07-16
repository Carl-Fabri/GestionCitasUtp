import { Routes } from "@angular/router";
import { LoginComponent } from "../../pages/auth/login/login.component";
import { RegisterComponent } from "../../pages/auth/register/register.component";
import { authGuard } from "../guards/auth.guard";

export const AuthRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        // canActivate: [authGuard],
        component: LoginComponent,
      },
      {
        path: 'register',
        // canActivate: [authGuard],
        component: RegisterComponent,
      },
    ],
  },
]
