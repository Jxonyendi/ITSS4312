import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-address-display',
  templateUrl: './address-display.component.html',
  styleUrls: ['./address-display.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonLabel, CommonModule]
})
export class AddressDisplayComponent implements OnInit, OnDestroy {
  address: string = '';
  deliveryType: 'carry' | 'delivery' | null = null;
  private refreshSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    addIcons({
      'location-outline': locationOutline
    });
  }

  ngOnInit() {
    this.loadAddress();
    // Refresh address every 2 seconds to catch updates
    this.refreshSubscription = interval(2000).subscribe(() => {
      this.loadAddress();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadAddress() {
    const savedAddress = this.cartService.getAddress();
    const savedType = this.cartService.getDeliveryType();
    
    this.deliveryType = savedType;
    
    if (savedAddress) {
      const parts: string[] = [];
      if (savedAddress.street) parts.push(savedAddress.street);
      if (savedAddress.city) parts.push(savedAddress.city);
      if (savedAddress.state) parts.push(savedAddress.state);
      if (savedAddress.zipCode) parts.push(savedAddress.zipCode);
      
      this.address = parts.join(', ');
    } else {
      this.address = '';
    }
  }

  getDisplayText(): string {
    if (!this.address) {
      return '';
    }
    
    const typeText = this.deliveryType === 'carry' ? 'Carry' : 'Delivery';
    return `${typeText}: ${this.address}`;
  }

  onClick() {
    // Navigate to home page to change address
    this.router.navigate(['/tabs/home']);
  }
}

