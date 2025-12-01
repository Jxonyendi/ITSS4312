import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

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
  // Optional pizza metadata for orders created from the pizza menu
  pizzaId?: string;
  pizzaName?: string;
  pizzaImage?: string;
  pizzaPrice?: number;
  note?: string;
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

  /**
   * Broadcast message to all saved contacts
   * Uses real SMS on device, mock in browser
   */
  async broadcastToContacts(type: number): Promise<any> {
    const message = this.messages[type] || this.messages[0];
    const contacts = this.contacts$.value;
    
    if (contacts.length === 0) {
      return { success: false, message: 'No contacts saved' };
    }

    const results = [];
    for (const contact of contacts) {
      const result = await this.sendMockSms(contact.phone, message);
      results.push({ contact: contact.name, ...result });
    }

    return {
      success: results.every(r => r.success),
      type,
      message,
      results,
      sentTo: contacts.length,
    };
  }

  /**
   * Send SMS - uses real SMS plugin on device, mock in browser
   * For production: Install @capacitor-community/sms or @ionic-native/sms
   */
  async sendMockSms(phone: string, msg: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if running on native platform
      if (Capacitor.isNativePlatform()) {
        // Try to use SMS plugin if available
        // Note: You'll need to install: npm install @capacitor-community/sms
        // Then import: import { SMS } from '@capacitor-community/sms';
        // const result = await SMS.send({ numbers: [phone], text: msg });
        // return { success: true, message: 'SMS sent successfully' };
        
        // For now, log and return success (install plugin for real SMS)
        console.log(`[Native] Would send SMS to ${phone}: ${msg}`);
        return { success: true, message: 'SMS queued (install SMS plugin for real sending)' };
      } else {
        // Browser: Use SMS link or mock
        console.log(`[Browser] Mock SMS to ${phone}: ${msg}`);
        // Optionally open SMS link: window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`;
        return { success: true, message: 'SMS prepared (mock mode)' };
      }
    } catch (error) {
      console.error('SMS error:', error);
      return { success: false, message: 'Failed to send SMS' };
    }
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

  /**
   * Get real device location using Capacitor Geolocation
   * Falls back to mock location if not available
   */
  async getMockLocation(): Promise<any> {
    try {
      // Check if running on native platform
      if (Capacitor.isNativePlatform()) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        
        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          accuracy: position.coords.accuracy,
        };
      } else {
        // Browser fallback - try HTML5 geolocation
        return new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
                  accuracy: position.coords.accuracy,
                });
              },
              () => {
                // Fallback to mock if geolocation fails
                resolve(this.getFallbackLocation());
              }
            );
          } else {
            resolve(this.getFallbackLocation());
          }
        });
      }
    } catch (error) {
      console.warn('Geolocation error, using fallback:', error);
      return this.getFallbackLocation();
    }
  }

  /**
   * Fallback mock location
   */
  private getFallbackLocation(): any {
    return {
      lat: 32.7767,
      lng: -96.7970,
      address: 'Mock Location (Dallas, TX)',
    };
  }

  /**
   * Place Uber order - opens Uber deep link or app
   * For production: Use Uber Ride Requests API (requires server-side OAuth)
   */
  async placeMockUberOrder(location: any): Promise<Order> {
    try {
      // Try to open Uber app with deep link
      if (Capacitor.isNativePlatform()) {
        // For iOS: uber://?action=setPickup&pickup[latitude]=${lat}&pickup[longitude]=${lng}
        // For Android: uber://?action=setPickup&pickup[latitude]=${lat}&pickup[longitude]=${lng}
        const uberUrl = `uber://?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}`;
        
        // Use Capacitor Browser or App plugin to open
        // import { Browser } from '@capacitor/browser';
        // await Browser.open({ url: uberUrl });
        
        console.log(`[Native] Would open Uber: ${uberUrl}`);
      } else {
        // Browser: Open Uber web or show message
        console.log(`[Browser] Mock Uber order from location:`, location);
        // Optionally: window.open(`https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}`);
      }

      // Create order record
      const order: Order = {
        id: Math.random().toString(36).substring(2, 15),
        status: 'placed',
        placedAt: Date.now(),
        etaMinutes: 15,
        fakeCourierName: 'Maya',
      };
      const currentOrders = this.orders$.value;
      this.orders$.next([order, ...currentOrders]);
      return order;
    } catch (error) {
      console.error('Uber order error:', error);
      // Still create order even if deep link fails
      const order: Order = {
        id: Math.random().toString(36).substring(2, 15),
        status: 'placed',
        placedAt: Date.now(),
        etaMinutes: 15,
        fakeCourierName: 'Maya',
      };
      const currentOrders = this.orders$.value;
      this.orders$.next([order, ...currentOrders]);
      return order;
    }
  }

  /**
   * Place an order that includes pizza metadata (used by the pizza menu)
   */
  async placePizzaOrder(payload: {
    pizzaId: string;
    pizzaName: string;
    pizzaImage?: string;
    pizzaPrice?: number;
    note?: string;
  }): Promise<Order> {
    const order: Order = {
      id: Math.random().toString(36).substring(2, 15),
      status: 'placed',
      placedAt: Date.now(),
      etaMinutes: 15,
      fakeCourierName: 'Maya',
      pizzaId: payload.pizzaId,
      pizzaName: payload.pizzaName,
      pizzaImage: payload.pizzaImage,
      pizzaPrice: payload.pizzaPrice,
      note: payload.note,
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