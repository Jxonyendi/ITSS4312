import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-contact-us',
  templateUrl: 'contact-us.page.html'
})
export class ContactUsPage {
  constructor(private svc: EmergencyService, private toast: ToastController) {}

  async sendSupport() {
    // demo: send to primary contact (if exists)
    const cs = this.svc.contacts$.value;
    if (!cs.length) {
      this.showToast('No contacts saved yet. Add one in Account.');
      return;
    }
    const msg = 'Support request: This is a test from Pizza Time (mock).';
    await this.svc.sendMockSms(cs[0].phone, msg);
    this.showToast('Support message sent to first contact (mock).');
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 1500});
    t.present();
  }
}
