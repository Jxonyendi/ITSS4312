import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-order',
  templateUrl: 'order.page.html'
})
export class OrderPage {
  alias = 'Large Pepperoni';
  note = '';
  lastOrder: any = null;

  constructor(private svc: EmergencyService, private toast: ToastController) {
    const os = this.svc.getOrders();
    this.lastOrder = os.length ? os[0] : null;
    this.svc.orders$.subscribe(o => {
      this.lastOrder = o.length ? o[0] : null;
    });
  }

  async placeOrder() {
    const loc = await this.svc.getMockLocation();
    const order = await this.svc.placeMockUberOrder(loc);
    this.showToast('Pizza order placed (mock). Use tracker to follow.');
    console.log('Placed mock order', order, 'note:', this.note);
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }
}

import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-order',
  templateUrl: 'order.page.html'
})
export class OrderPage {
  alias = 'Large Pepperoni';
  note = '';
  lastOrder: any = null;

  constructor(private svc: EmergencyService, private toast: ToastController) {
    const os = this.svc.getOrders();
    this.lastOrder = os.length ? os[0] : null;
    this.svc.orders$.subscribe(o => {
      this.lastOrder = o.length ? o[0] : null;
    });
  }

  async placeOrder() {
    const loc = await this.svc.getMockLocation();
    const order = await this.svc.placeMockUberOrder(loc);
    this.showToast('Pizza order placed (mock). Use tracker to follow.');
    console.log('Placed mock order', order, 'note:', this.note);
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }
}

