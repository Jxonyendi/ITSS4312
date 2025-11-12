import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.service';
import { ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html'
})
export class AccountPage {
  contacts = [];
  newName = '';
  newPhone = '';
  messages = [];

  constructor(private svc: EmergencyService, private toast: ToastController) {
    this.svc.contacts$.subscribe(c => this.contacts = c);
    this.messages = this.svc.messages;
  }

  add() {
    if (!this.newName || !this.newPhone) return;
    const c = { id: (Math.random().toString(36).slice(2,9)), name: this.newName, phone: this.newPhone };
    this.svc.addContact(c);
    this.newName = this.newPhone = '';
    this.showToast('Contact saved');
  }

  remove(id:string) {
    this.svc.removeContact(id);
    this.showToast('Removed');
  }

  async sendPreview(i:number) {
    const res = await this.svc.broadcastToContacts(i);
    console.log('preview', res);
    this.showToast('Preview sent to contacts (mock).');
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 1500});
    t.present();
  }
}
