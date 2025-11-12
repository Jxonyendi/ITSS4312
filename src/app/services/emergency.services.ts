import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  isPrimary?: boolean;
}

export interface Order {
  id: string;
  status: 'placed'|'accepted'|'on_the_way'|'delivered'|'cancelled';
  placedAt: number;
  etaMinutes?: number;
  fakeCourierName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {
  contacts$ = new BehaviorSubject<Contact[]>([]);
  orders$ = new BehaviorSubject<Order[]>([]);

  constructor() {
    // Initialize with empty arrays
  }

  async broadcastToContacts(type: number): Promise<any> {
    // Mock implementation
    return { success: true, type };
  }

  async sendMockSms(phone: string, msg: string): Promise<void> {
    // Mock implementation
    console.log(`Sending SMS to ${phone}: ${msg}`);
  }

  setOrderStatus(status: 'placed'|'accepted'|'on_the_way'|'delivered'|'cancelled'): void {
    const currentOrders = this.orders$.value;
    if (currentOrders.length > 0) {
      const activeOrder = currentOrders.find(
        o => o.status !== 'cancelled' && o.status !== 'delivered'
      );
      if (activeOrder) {
        activeOrder.status = status;
        this.orders$.next([...currentOrders]);
      }
    }
  }
}