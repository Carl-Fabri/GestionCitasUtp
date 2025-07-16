import { Routes } from '@angular/router';
import { ManageAppointmentsComponent } from './pages/admin/manage-appointments/manage-appointments.component';
import { EmptyLayoutComponent } from './components/layouts/empty-layout/empty-layout.component';

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
    ],
  },
];
