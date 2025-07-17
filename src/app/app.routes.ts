import { Routes } from '@angular/router';
import { ManageAppointmentsComponent } from './pages/admin/manage-appointments/manage-appointments.component';
import { EmptyLayoutComponent } from './components/layouts/empty-layout/empty-layout.component';
import { protectedGuard } from './core/guards/auth.guard';
import { ManageLayoutComponent } from './components/layouts/manage-layout/manage-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: EmptyLayoutComponent,

    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./core/routes/auth.routes').then(
            (m) => m.AuthRoutes
          ),
      },
      {
        path: 'admin',
        component: ManageLayoutComponent,
        // canActivate: [protectedGuard],
        loadChildren: () =>
          import('./core/routes/private.routes').then(
            (m) => m.PrivateRoutes
          ),
      },
      {
        path: '**',
        redirectTo: 'auth/login'
      }
    ],
  },
];
