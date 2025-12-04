import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmergencyService, Order } from '../services/emergency.services';
import { ToastController, AlertController } from '@ionic/angular';
import {
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
  IonChip,
  IonIcon,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, timeOutline, locationOutline, personOutline } from 'ionicons/icons';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-order-details',
  templateUrl: 'order-details.page.html',
  styleUrls: ['order-details.page.scss'],
  standalone: true,
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
    IonChip,
    IonIcon,
    IonBackButton,
    IonButtons,
    CommonModule,
    ChatWidgetComponent,
  ],
})
export class OrderDetailsPage implements OnInit, OnDestroy {
  order: Order | null = null;
  orderId: string = '';
  private ordersSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emergencyService: EmergencyService,
    private toast: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      timeOutline,
      locationOutline,
      personOutline,
    });
  }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrder();

    // Subscribe to orders updates
    this.ordersSubscription = this.emergencyService.orders$.subscribe((orders) => {
      const updatedOrder = orders.find((o) => o.id === this.orderId);
      if (updatedOrder) {
        this.order = updatedOrder;
      }
    });
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  loadOrder() {
    const orders = this.emergencyService.getOrders();
    this.order = orders.find((o) => o.id === this.orderId) || null;

    if (!this.order) {
      this.showToast('Order not found');
      this.router.navigate(['/tabs/tracker']);
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      placed: 'Order Placed',
      accepted: 'Accepted',
      on_the_way: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      placed: 'primary',
      accepted: 'tertiary',
      on_the_way: 'warning',
      delivered: 'success',
      cancelled: 'danger',
    };
    return colorMap[status] || 'medium';
  }

  getStatusIcon(status: string): string {
    if (status === 'delivered') return 'checkmark-circle-outline';
    if (status === 'cancelled') return 'close-circle-outline';
    return 'time-outline';
  }

  canCancel(): boolean {
    return this.order !== null && this.order.status !== 'cancelled' && this.order.status !== 'delivered';
  }

  async cancelOrder() {
    if (!this.order) return;

    const alert = await this.alertController.create({
      header: 'Cancel Order',
      message: `Are you sure you want to cancel order ${this.order.id}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'destructive',
          handler: async () => {
            await this.emergencyService.setOrderStatus('cancelled');
            this.showToast('Order cancelled');
          },
        },
      ],
    });

    await alert.present();
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  goBack() {
    this.router.navigate(['/tabs/tracker']);
  }

  async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    t.present();
  }
}
