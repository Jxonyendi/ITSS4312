import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonThumbnail, IonChip, IonSegment, IonSegmentButton, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmergencyService, Order } from '../services/emergency.services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';
import { SettingsButtonComponent } from '../components/settings-button/settings-button.component';
import { AddressDisplayComponent } from '../components/address-display/address-display.component';

@Component({
  selector: 'app-order-history',
  templateUrl: 'order-history.page.html',
  styleUrls: ['order-history.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonChip,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    CommonModule,
    FormsModule,
    ChatWidgetComponent,
    CartButtonComponent,
    SettingsButtonComponent,
    AddressDisplayComponent
  ],
  standalone: true
})
export class OrderHistoryPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  filterStatus: string = 'all';
  private ordersSubscription?: Subscription;

  constructor(
    private emergencyService: EmergencyService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.emergencyService.orders$) {
      this.ordersSubscription = this.emergencyService.orders$.subscribe(
        (orders: Order[]) => {
          this.orders = orders || [];
          this.applyFilter();
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  applyFilter() {
    if (this.filterStatus === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.filterStatus);
    }
    // Sort by most recent first
    this.filteredOrders.sort((a, b) => b.placedAt - a.placedAt);
  }

  onFilterChange(event: any) {
    this.filterStatus = event.detail.value;
    this.applyFilter();
  }

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

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'placed': 'primary',
      'accepted': 'tertiary',
      'on_the_way': 'warning',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  viewOrderDetails(orderId: string) {
    this.router.navigate(['/order-details', orderId]);
  }

  getTotalSpent(): number {
    return this.orders
      .filter(order => order.status === 'delivered' && order.pizzaPrice)
      .reduce((sum, order) => sum + (order.pizzaPrice || 0), 0);
  }

  getTotalOrders(): number {
    return this.orders.length;
  }
}

