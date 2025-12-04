import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonThumbnail, IonChip } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { EmergencyService, Order } from '../services/emergency.services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';

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
    CommonModule,
    ChatWidgetComponent
  ],
  standalone: true
})
export class TrackerPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  private ordersSubscription?: Subscription;

  constructor(
    private emergencyService: EmergencyService,
    private alertController: AlertController,
    private router: Router
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
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  /**
   * Get the active order (not cancelled or delivered)
   */
  getActiveOrder(): Order | undefined {
    return this.orders.find(
      order => order.status !== 'cancelled' && order.status !== 'delivered'
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
            await this.emergencyService.setOrderStatus('cancelled');
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
}

