import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'order',
        loadComponent: () =>
          import('../orders/tab4.page').then((m) => m.OrderPage),
      },
      {
        path: 'tracker',
        loadComponent: () =>
          import('../tracker/tracker.page').then((m) => m.TrackerPage),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('../account/account.page').then((m) => m.AccountPage),
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('../contact-us/contact-us.page').then((m) => m.ContactUsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'order-history',
        loadComponent: () =>
          import('../order-history/order-history.page').then((m) => m.OrderHistoryPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
