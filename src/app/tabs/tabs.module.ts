
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TabsPage,
        children: [
          { path: 'home', loadChildren: () => import('../home/home.page').then(m => m.HomePage) },
          { path: 'orders', loadChildren: () => import('../orders/orders.page').then(m => m.OrdersPage) },
          { path: 'tracker', loadChildren: () => import('../order-tracker/order-tracker.page').then(m => m.OrderTrackerPage) },
          { path: 'contact-us', loadChildren: () => import('../contact-us/contact-us.page').then(m => m.ContactUsPage) },
          { path: 'account', loadChildren: () => import('../account/account.page').then(m => m.AccountPage) },
          { path: '', redirectTo: '/tabs/home', pathMatch: 'full' }
        ]
      }
    ])
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
