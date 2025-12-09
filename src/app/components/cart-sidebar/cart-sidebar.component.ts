import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonCard,
  IonCardContent,
  IonBadge,
} from '@ionic/angular/standalone';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  addOutline,
  removeOutline,
  trashOutline,
  cardOutline,
  cartOutline,
} from 'ionicons/icons';
import { CheckoutComponent } from '../checkout/checkout.component';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonCard,
    IonCardContent,
    IonBadge,
    CheckoutComponent,
  ],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss'],
})
export class CartSidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  cartItems: CartItem[] = [];
  subtotal = 0;
  tax = 0;
  total = 0;
  private cartSubscription?: Subscription;
  showCheckout = false;

  constructor(private cartService: CartService) {
    addIcons({
      'close-outline': closeOutline,
      'add-outline': addOutline,
      'remove-outline': removeOutline,
      'trash-outline': trashOutline,
      'card-outline': cardOutline,
      'cart-outline': cartOutline,
    });
  }

  ngOnInit() {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.getCartItems$().subscribe((items) => {
      this.cartItems = items;
      this.calculateTotals();
    });

    // Listen for open cart event
    window.addEventListener('openCart', () => {
      this.open();
    });

    // Initial load
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotals();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    window.removeEventListener('openCart', () => {});
  }

  open() {
    this.isOpen = true;
    this.showCheckout = false;
  }

  close() {
    this.isOpen = false;
    this.showCheckout = false;
  }

  calculateTotals() {
    this.subtotal = this.cartService.getCartTotal();
    this.tax = this.subtotal * 0.08; // 8% tax
    this.total = this.subtotal + this.tax;
  }

  increaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id);
  }

  getItemTotal(item: CartItem): number {
    return item.pizzaPrice * item.quantity;
  }

  getCustomizationString(item: CartItem): string {
    if (!item.customization) return '';
    const parts: string[] = [];
    if (item.customization.size) parts.push(item.customization.size);
    if (item.customization.crust) parts.push(item.customization.crust);
    if (item.customization.sauce) parts.push(item.customization.sauce);
    if (item.customization.cheese) parts.push(item.customization.cheese);
    if (item.customization.toppings && item.customization.toppings.length > 0) {
      parts.push(`Toppings: ${item.customization.toppings.join(', ')}`);
    }
    return parts.join(' • ');
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      return;
    }
    this.showCheckout = true;
  }

  onCheckoutComplete() {
    this.close();
  }
}

