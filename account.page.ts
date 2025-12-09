import { Component, OnInit } from '@angular/core';
import { EmergencyService, Contact } from '../services/emergency.services';
import { AuthService } from '../services/auth.service';
import { ToastController, AlertController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonButtons,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';

import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonButtons,
    IonSelect,
    IonSelectOption,

    ChatWidgetComponent,
    CartButtonComponent
  ]
})
export class AccountPage implements OnInit {
  contacts: Contact[] = [];
  contactForm!: FormGroup;
  editingContact: Contact | null = null;
  messages: string[] = [];
  currentUser: any = null;

  // 🔒 PIN STATE
  enteredPin = '';
  pinUnlocked = false;
  private readonly CORRECT_PIN = '1234'; // mock PIN for now

  constructor(
    private svc: EmergencyService,
    private authService: AuthService,
    private toast: ToastController,
    private alertController: AlertController,
    private fb: FormBuilder
  ) {
    this.svc.contacts$.subscribe(c => (this.contacts = c));
    this.messages = this.svc.messages;
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.required, this.phoneValidator]]
    });
  }

  // 🔓 PIN UNLOCK
  unlockPin() {
    if (this.enteredPin === this.CORRECT_PIN) {
      this.pinUnlocked = true;
      this.showToast('Unlocked');
    } else {
      this.showToast('Incorrect PIN');
    }
  }

  phoneValidator(control: AbstractControl) {
    if (!control.value) return null;
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(control.value.replace(/\s/g, ''))
      ? null
      : { invalidPhone: true };
  }

  async add() {
    if (this.contactForm.invalid) return;
    const v = this.contactForm.value;
    const c: Contact = {
      id: Math.random().toString(36).slice(2, 9),
      name: v.name.trim(),
      phone: v.phone.trim()
    };
    await this.svc.addContact(c);
    this.contactForm.reset();
    this.showToast('Contact saved');
  }

  edit(c: Contact) {
    this.editingContact = c;
    this.contactForm.patchValue(c);
  }

  async update() {
    if (!this.editingContact) return;
    const v = this.contactForm.value;
    await this.svc.updateContact({
      ...this.editingContact,
      name: v.name.trim(),
      phone: v.phone.trim()
    });
    this.editingContact = null;
    this.contactForm.reset();
    this.showToast('Contact updated');
  }

  cancelEdit() {
    this.editingContact = null;
    this.contactForm.reset();
  }

  async remove(id: string) {
    await this.svc.removeContact(id);
    this.showToast('Contact removed');
  }

  async sendPreview(i: number) {
    await this.svc.broadcastToContacts(i);
    this.showToast('Preview sent');
  }

  logout() {
    this.authService.logout();
    this.showToast('Logged out');
  }

  async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 1500 });
    t.present();
  }
}
