<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonList,
  IonButton,
  IonInput,
  IonItemDivider
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonText,
    IonList,
    IonButton,
    IonInput,
    IonItemDivider
  ]
})
export class AccountPage {
  user = {
    name: 'John Doe',
    address: '123 Main St',
    phone: '(555) 123-4567',
    emergencyContacts: [
      { name: 'Mom', phone: '555-111-2222' },
      { name: 'Friend', phone: '555-333-4444' }
    ]
  };

  pinInput = '';
  isUnlocked = false;
  correctPin = '1234';

  pizzaCodes = [
    { topping: 'Cheese', meaning: 'Send preset SMS' },
    { topping: 'Pepperoni', meaning: 'Share live location' },
    { topping: 'Mushroom', meaning: 'Order Uber' }
  ];

  unlock() {
    if (this.pinInput === this.correctPin) {
      this.isUnlocked = true;
      this.pinInput = '';
    }
  }

  lock() {
    this.isUnlocked = false;
=======
import { Component, OnInit } from '@angular/core';
import { EmergencyService, Contact } from '../services/emergency.services';
import { AuthService } from '../services/auth.service';
import { ToastController, AlertController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, IonNote, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, IonChip } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, IonNote, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, IonChip, CommonModule, ReactiveFormsModule, ChatWidgetComponent]
})
export class AccountPage implements OnInit {
  contacts: Contact[] = [];
  contactForm!: FormGroup;
  editingContact: Contact | null = null;
  messages: string[] = [];
  currentUser: any = null;

  constructor(
    private svc: EmergencyService,
    private authService: AuthService,
    private toast: ToastController,
    private alertController: AlertController,
    private fb: FormBuilder
  ) {
    this.svc.contacts$.subscribe(c => this.contacts = c);
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

  phoneValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    // Allow formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123 456 7890
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    const isValid = phoneRegex.test(control.value.replace(/\s/g, ''));
    return isValid ? null : { invalidPhone: true };
  }

  get name() {
    return this.contactForm.get('name');
  }

  get phone() {
    return this.contactForm.get('phone');
  }

  getNameErrorMessage(): string {
    const control = this.name;
    if (control?.hasError('required')) {
      return 'Name is required';
    }
    if (control?.hasError('minlength')) {
      return `Name must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `Name must be no more than ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  getPhoneErrorMessage(): string {
    const control = this.phone;
    if (control?.hasError('required')) {
      return 'Phone number is required';
    }
    if (control?.hasError('invalidPhone')) {
      return 'Please enter a valid phone number (e.g., 123-456-7890)';
    }
    return '';
  }

  async add() {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      this.showToast('Please fix the errors in the form');
      return;
    }

    const formValue = this.contactForm.value;
    const c: Contact = {
      id: Math.random().toString(36).slice(2, 9),
      name: formValue.name.trim(),
      phone: formValue.phone.trim()
    };
    await this.svc.addContact(c);
    this.contactForm.reset();
    this.showToast('Contact saved');
  }

  edit(contact: Contact) {
    this.editingContact = contact;
    this.contactForm.patchValue({
      name: contact.name,
      phone: contact.phone
    });
  }

  async update() {
    if (this.contactForm.invalid || !this.editingContact) {
      this.markFormGroupTouched(this.contactForm);
      this.showToast('Please fix the errors in the form');
      return;
    }

    const formValue = this.contactForm.value;
    const updatedContact: Contact = {
      ...this.editingContact,
      name: formValue.name.trim(),
      phone: formValue.phone.trim()
    };
    
    await this.svc.updateContact(updatedContact);
    this.cancelEdit();
    this.showToast('Contact updated');
  }

  cancelEdit() {
    this.editingContact = null;
    this.contactForm.reset();
  }

  async remove(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this contact?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.svc.removeContact(id);
            this.showToast('Contact removed');
          }
        }
      ]
    });

    await alert.present();
  }

  async sendPreview(i: number) {
    await this.svc.broadcastToContacts(i);
    this.showToast('Preview sent to contacts (mock).');
  }

  logout() {
    this.authService.logout();
    this.showToast('Logged out successfully');
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 1500 });
    t.present();
>>>>>>> 3a4491c94732c62edb53cc3456644a62c6092b3f
  }
}

