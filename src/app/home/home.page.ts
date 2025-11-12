import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { ToastController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonTextarea } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonTextarea, CommonModule]
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
