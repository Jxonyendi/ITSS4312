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
  messages: string[] = [
    'I need help. Please call me.',
    'I am okay. No help needed.',
    'Emergency situation. Please respond immediately.'
  ];

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

  getOrders(): Order[] {
    return this.orders$.value;
  }

  async getMockLocation(): Promise<any> {
    // Mock location
    return {
      lat: 32.7767,
      lng: -96.7970,
      address: 'Mock Location'
    };
  }

  async placeMockUberOrder(location: any): Promise<Order> {
    const order: Order = {
      id: Math.random().toString(36).substring(2, 15),
      status: 'placed',
      placedAt: Date.now(),
      etaMinutes: 15,
      fakeCourierName: 'Maya'
    };
    const currentOrders = this.orders$.value;
    this.orders$.next([order, ...currentOrders]);
    return order;
  }

  addContact(contact: Contact): void {
    const currentContacts = this.contacts$.value;
    this.contacts$.next([...currentContacts, contact]);
  }

  removeContact(id: string): void {
    const currentContacts = this.contacts$.value;
    this.contacts$.next(currentContacts.filter(c => c.id !== id));
  }
}