import { Routes } from '@angular/router';
import { ManageAppointmentsComponent } from '../../pages/admin/manage-appointments/manage-appointments.component';

export const PrivateRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: ManageAppointmentsComponent, // Temporal, reemplazar con un componente de dashboard
      },
      {
        path: 'manage-appointments',
        component: ManageAppointmentsComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
