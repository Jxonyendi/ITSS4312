import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html'
})
export class HomePage {
  preview = '';

  constructor(
    private svc: EmergencyService,
    private toast: ToastController
  ) {}

  async sendHelp() {
    this.preview = 'I need help. Please call me.';
    const res = await this.svc.broadcastToContacts(0);
    this.showToast('Help message sent to saved contacts (mock).');
    console.log(res);
  }

  async sendOk() {
    this.preview = 'I am okay. No help needed.';
    const res = await this.svc.broadcastToContacts(1);
    this.showToast('OK message sent to saved contacts (mock).');
    console.log(res);
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }
}
