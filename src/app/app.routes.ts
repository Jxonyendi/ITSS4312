import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'order-details/:id',
    loadComponent: () => import('./order-details/order-details.page').then((m) => m.OrderDetailsPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/tabs/home',
  },
];
