import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonBadge],
  templateUrl: './cart-button.component.html',
  styleUrls: ['./cart-button.component.scss']
})
export class CartButtonComponent implements OnInit, OnDestroy {
  itemCount = 0;
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService) {
    addIcons({
      'cart-outline': cartOutline
    });
  }

  ngOnInit() {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.getCartItems$().subscribe(() => {
      this.itemCount = this.cartService.getCartItemCount();
    });
    
    // Initial count
    this.itemCount = this.cartService.getCartItemCount();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  openCart() {
    // This will be handled by CartSidebarComponent
    // We'll use a service or event emitter to communicate
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  }
}

