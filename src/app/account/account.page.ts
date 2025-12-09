import { Component, OnInit } from '@angular/core';
import { EmergencyService, PizzaCodeAction } from '../services/emergency.services';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';
import { SettingsButtonComponent } from '../components/settings-button/settings-button.component';
import { AddressDisplayComponent } from '../components/address-display/address-display.component';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    CartButtonComponent,
    SettingsButtonComponent,
    AddressDisplayComponent
  ]
})
export class AccountPage implements OnInit {

  currentUser: any;

  // 🔐 PIN STATE
  pinInput = '';
  pinUnlocked = false;

  // ✉️ Messages
  messages: string[] = [];
  newMessage = '';

  // 🍕 Pizza mappings
  toppings = ['Cheese', 'Pepperoni', 'Veggie', 'Meat Lovers'];
  pizzaMappings: PizzaCodeAction[] = [];

  constructor(
    private svc: EmergencyService,
    private auth: AuthService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.messages = [...this.svc.messages];
    this.pizzaMappings = this.svc.getPizzaCodes();

    this.auth.currentUser.subscribe(u => this.currentUser = u);
  }

  /* ======================
     🔐 PIN UNLOCK
     ====================== */

  async unlock() {
    const ok = await this.svc.verifyPin(this.pinInput);
    if (ok) {
      this.pinUnlocked = true;
      this.showToast('Settings unlocked');
    } else {
      this.showToast('Invalid PIN');
    }
  }

  /* ======================
     ✉️ CUSTOM MESSAGES
     ====================== */

  saveMessage() {
    if (!this.newMessage.trim()) return;

    this.messages.push(this.newMessage.trim());
    this.svc.messages = [...this.messages];
    this.newMessage = '';
    this.showToast('Message saved');
  }

  /* ======================
     🍕 PIZZA MAPPINGS
     ====================== */

  addMapping() {
  this.pizzaMappings.push({
    id: Math.random().toString(36).substring(2),
    topping: 'Cheese',
    action: 'SEND_HELP_TEXT',
    payload: 0
  });
}


  savePizzaMappings() {
    this.svc.savePizzaCodes(this.pizzaMappings);
    this.showToast('Pizza mappings saved');
  }

  /* ======================
     UI
     ====================== */

  async showToast(message: string) {
    const t = await this.toast.create({ message, duration: 1500 });
    t.present();
  }
}
