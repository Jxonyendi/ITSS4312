import { Component } from '@angular/core';
import { EmergencyService, Contact } from '../services/emergency.services';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, CommonModule, FormsModule]
})
export class AccountPage {
  contacts: Contact[] = [];
  newName = '';
  newPhone = '';
  messages: string[] = [];
  currentUser: any = null;

  constructor(
    private svc: EmergencyService,
    private authService: AuthService,
    private toast: ToastController
  ) {
    this.svc.contacts$.subscribe(c => this.contacts = c);
    this.messages = this.svc.messages;
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
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

  logout() {
    this.authService.logout();
    this.showToast('Logged out successfully');
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 1500});
    t.present();
  }
}
