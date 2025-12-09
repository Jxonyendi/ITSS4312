import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonThumbnail, IonChip, IonButtons } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { EmergencyService, Order } from '../services/emergency.services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';
import { SettingsButtonComponent } from '../components/settings-button/settings-button.component';
import { AddressDisplayComponent } from '../components/address-display/address-display.component';

@Component({
  selector: 'app-tracker',
  templateUrl: 'tracker.page.html',
  styleUrls: ['tracker.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonButton, 
    IonItem, 
      IonLabel,
      IonThumbnail,
    IonChip,
    IonButtons,
    CommonModule,
    ChatWidgetComponent,
    CartButtonComponent,
    SettingsButtonComponent,
    AddressDisplayComponent
  ],
  standalone: true
})
export class TrackerPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  private ordersSubscription?: Subscription;
  private etaUpdateInterval?: any;

  constructor(
    private emergencyService: EmergencyService,
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to orders from EmergencyService
    // Assuming the service has an orders$ observable
    if (this.emergencyService.orders$) {
      this.ordersSubscription = this.emergencyService.orders$.subscribe(
        (orders: Order[]) => {
          this.orders = orders || [];
        }
      );
    }
    
    // Update ETA every second for real-time countdown and check for delivered orders
    this.etaUpdateInterval = setInterval(() => {
      // Check for orders that should be marked as delivered (ETA reached 0)
      this.checkAndMarkDelivered();
      // Force change detection to update ETA display
      this.cdr.detectChanges();
    }, 1000); // Update every second
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.etaUpdateInterval) {
      clearInterval(this.etaUpdateInterval);
    }
  }

  /**
   * Get all active orders (not cancelled or delivered)
   */
  getActiveOrders(): Order[] {
    return this.orders.filter(
      order => order.status !== 'cancelled' && order.status !== 'delivered'
    );
  }

  /**
   * Get completed orders (cancelled or delivered)
   */
  getCompletedOrders(): Order[] {
    return this.orders.filter(
      order => order.status === 'cancelled' || order.status === 'delivered'
    );
  }

  /**
   * Get status display text
   */
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'placed': 'Order Placed',
      'accepted': 'Accepted',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  /**
   * Check if order can be cancelled
   */
  canCancel(order: Order): boolean {
    return order.status !== 'cancelled' && order.status !== 'delivered';
  }

  /**
   * Cancel order with confirmation
   */
  async cancelOrder(order: Order) {
    const alert = await this.alertController.create({
      header: 'Cancel Order',
      message: `Are you sure you want to cancel order ${order.id}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: async () => {
            await this.emergencyService.setOrderStatusById(order.id, 'cancelled');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Format timestamp to readable date
   */
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Navigate to order details page
   */
  viewOrderDetails(orderId: string) {
    this.router.navigate(['/order-details', orderId]);
  }

  /**
   * Calculate remaining ETA in minutes based on order placed time and initial ETA
   */
  getRemainingETA(order: Order): number | null {
    // Don't show ETA for cancelled or delivered orders
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return null;
    }
    
    if (!order.etaMinutes || !order.placedAt) {
      return null;
    }
    
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - order.placedAt) / 60000);
    const remaining = order.etaMinutes - elapsedMinutes;
    
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Get ETA display text
   */
  getETAText(order: Order): string {
    const remaining = this.getRemainingETA(order);
    if (remaining === null) {
      return '';
    }
    if (remaining === 0) {
      return 'Arriving soon';
    }
    return `${remaining} min`;
  }

  /**
   * Check for orders with ETA = 0 and automatically mark them as delivered
   */
  private async checkAndMarkDelivered(): Promise<void> {
    const activeOrders = this.getActiveOrders();
    
    for (const order of activeOrders) {
      const remaining = this.getRemainingETA(order);
      
      // If ETA has reached 0 or below, mark as delivered
      if (remaining !== null && remaining <= 0 && order.status !== 'delivered' && order.status !== 'cancelled') {
        await this.emergencyService.setOrderStatusById(order.id, 'delivered');
      }
    }
  }

  /**
   * Format address for display
   */
  formatAddress(order: Order): string {
    if (!order.address) {
      return '';
    }
    const parts: string[] = [];
    if (order.address.street) parts.push(order.address.street);
    if (order.address.city) parts.push(order.address.city);
    if (order.address.state) parts.push(order.address.state);
    if (order.address.zipCode) parts.push(order.address.zipCode);
    return parts.join(', ');
  }

  /**
   * Get delivery type display text
   */
  getDeliveryTypeText(order: Order): string {
    if (!order.deliveryType) {
      return '';
    }
    return order.deliveryType === 'carry' ? 'Carry Out' : 'Delivery';
  }
}

