import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class AccountPage {

  user = {
    name: 'John Doe',
    address: '123 Main St',
    phone: '(555) 123-4567',
    emergencyContacts: [
      { name: 'Mom', phone: '555-111-2222' },
      { name: 'Best Friend', phone: '555-333-4444' }
    ]
  };

  // 🔐 Pizza code lock
  pinInput = '';
  isUnlocked = false;
  privatePin = '1234';

  pizzaCodes = [
    { topping: 'Cheese', meaning: 'I am safe' },
    { topping: 'Pepperoni', meaning: 'Send preset help message' },
    { topping: 'Veggie', meaning: 'Share my live location' }
  ];

  unlock() {
    if (this.pinInput === this.privatePin) {
      this.isUnlocked = true;
      this.pinInput = '';
    }
  }

  lock() {
    this.isUnlocked = false;
  }
}
