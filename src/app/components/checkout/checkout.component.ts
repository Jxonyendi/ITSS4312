import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonNote,
  IonTextarea,
} from '@ionic/angular/standalone';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { CartItem } from '../../services/cart.service';
import { EmergencyService } from '../../services/emergency.services';
import { CartService } from '../../services/cart.service';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonNote,
    IonTextarea,
    ReactiveFormsModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  @Input() cartItems: CartItem[] = [];
  @Input() total: number = 0;
  @Output() checkoutComplete = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  paymentForm: FormGroup;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private emergencyService: EmergencyService,
    private cartService: CartService,
    private toast: ToastController,
    private router: Router
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'card-outline': cardOutline,
    });

    this.paymentForm = this.fb.group({
      specialInstructions: [''],
      cardNumber: [
        '',
        [
          Validators.required,
          this.cardNumberValidator.bind(this),
        ],
      ],
      expiryDate: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      cardholderName: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      ],
      billingAddress: [''],
    });
  }

  cardNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    const value = control.value.replace(/\s/g, '');
    
    // Check if all characters are digits
    if (!/^\d+$/.test(value)) {
      return { invalidCard: true };
    }
    
    // Check length
    if (value.length !== 16) {
      return { invalidLength: true };
    }
    
    // For mock payment, we'll accept any 16-digit number
    // Luhn algorithm check is optional - comment out for easier testing
    // Uncomment below for real Luhn validation:
    /*
    let sum = 0;
    let isEven = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0 ? null : { invalidCard: true };
    */
    
    return null;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentForm.patchValue({ cardNumber: formatted }, { emitEvent: true });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.paymentForm.patchValue({ expiryDate: value }, { emitEvent: true });
  }

  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.slice(0, 3);
    }
    this.paymentForm.patchValue({ cvv: value }, { emitEvent: true });
  }

  get cardNumber() {
    return this.paymentForm.get('cardNumber');
  }

  get expiryDate() {
    return this.paymentForm.get('expiryDate');
  }

  get cvv() {
    return this.paymentForm.get('cvv');
  }

  get cardholderName() {
    return this.paymentForm.get('cardholderName');
  }

  async processPayment() {
    if (this.paymentForm.invalid || this.isProcessing) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;

    try {
      // Get special instructions from form
      const specialInstructions = this.paymentForm.get('specialInstructions')?.value || '';
      
      // Convert cart items to orders
      for (const item of this.cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          // Combine item note with special instructions
          const combinedNote = [item.note, specialInstructions]
            .filter(n => n && n.trim())
            .join(' | ');
            
          await this.emergencyService.placePizzaOrder({
            pizzaId: item.pizzaId,
            pizzaName: item.pizzaName,
            pizzaImage: item.pizzaImage,
            pizzaPrice: item.pizzaPrice,
            note: combinedNote || undefined,
          });
        }
      }

      // Clear cart
      this.cartService.clearCart();

      // Show success message
      const toast = await this.toast.create({
        message: 'Payment successful! Your order has been placed.',
        duration: 3000,
        color: 'success',
      });
      await toast.present();

      // Emit completion event
      this.checkoutComplete.emit();

      // Navigate to tracker
      setTimeout(() => {
        this.router.navigate(['/tabs/tracker']);
      }, 500);
    } catch (error) {
      console.error('Payment processing error:', error);
      const toast = await this.toast.create({
        message: 'An error occurred. Please try again.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
      this.isProcessing = false;
    }
  }

  goBack() {
    this.back.emit();
  }
}

