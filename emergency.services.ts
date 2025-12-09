import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { SmsManager } from '@byteowls/capacitor-sms';

export interface PizzaCodeAction {
  id: string;
  topping: string;
  action: 'SMS' | 'LOCATION' | 'UBER';
  payload?: any;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  isPrimary?: boolean;
}

// API response type (MongoDB returns _id)
interface ApiContact {
  id?: string;
  _id?: string;
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

// API response type (MongoDB returns _id)
interface ApiOrder {
  id?: string;
  _id?: string;
  status: 'placed'|'accepted'|'on_the_way'|'delivered'|'cancelled';
  placedAt: number | Date;
  etaMinutes?: number;
  fakeCourierName?: string;
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

  private readonly CONTACTS_STORAGE_KEY = 'pizza_time_contacts';
  private readonly ORDERS_STORAGE_KEY = 'pizza_time_orders';

  constructor(private apiService: ApiService) {
    // Initialize with data from API or localStorage
    this.loadContacts();
    this.loadOrders();
  }

  /**
   * Load contacts from API or localStorage
   */
  private async loadContacts(): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(
          this.apiService.get<ApiContact[]>('contacts')
        );
        if (response.success && response.data) {
          // Convert API contacts to app format
          const contacts = response.data.map((c: ApiContact) => ({
            id: c.id || c._id || '',
            name: c.name,
            phone: c.phone,
            isPrimary: c.isPrimary
          }));
          this.contacts$.next(contacts);
        }
      } catch (error) {
        console.error('Failed to load contacts from API:', error);
        // Fallback to localStorage
        this.loadContactsFromStorage();
      }
    } else {
      this.loadContactsFromStorage();
    }
  }

  /**
   * Load contacts from localStorage
   */
  private loadContactsFromStorage(): void {
    try {
      const data = localStorage.getItem(this.CONTACTS_STORAGE_KEY);
      if (data) {
        this.contacts$.next(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load contacts from storage:', error);
    }
  }

  /**
   * Load orders from API or localStorage
   */
  private async loadOrders(): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(
          this.apiService.get<ApiOrder[]>('orders')
        );
        if (response.success && response.data) {
          // Convert API orders to app format
          const orders = response.data.map((o: ApiOrder) => ({
            id: o.id || o._id || '',
            status: o.status,
            placedAt: o.placedAt ? (typeof o.placedAt === 'number' ? o.placedAt : new Date(o.placedAt).getTime()) : Date.now(),
            etaMinutes: o.etaMinutes,
            fakeCourierName: o.fakeCourierName,
            pizzaId: o.pizzaId,
            pizzaName: o.pizzaName,
            pizzaImage: o.pizzaImage,
            pizzaPrice: o.pizzaPrice,
            note: o.note
          }));
          this.orders$.next(orders);
        }
      } catch (error) {
        console.error('Failed to load orders from API:', error);
        // Fallback to localStorage
        this.loadOrdersFromStorage();
      }
    } else {
      this.loadOrdersFromStorage();
    }
  }

  /**
   * Load orders from localStorage
   */
  private loadOrdersFromStorage(): void {
    try {
      const data = localStorage.getItem(this.ORDERS_STORAGE_KEY);
      if (data) {
        this.orders$.next(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load orders from storage:', error);
    }
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
   * Send SMS - sends directly from app on mobile (FREE - uses device SMS)
   * Opens SMS app on browser/desktop
   */
  async sendMockSms(phone: string, msg: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean phone number (remove non-digits except +)
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      
      if (Capacitor.isNativePlatform()) {
        // REAL SMS - Opens SMS app with message pre-filled (FREE - uses device SMS)
        try {
          // Opens native SMS app with message pre-filled
          await SmsManager.send({
            numbers: [cleanPhone],
            text: msg
          });
          
          return { success: true, message: 'SMS app opened with message ready to send!' };
        } catch (smsError: any) {
          console.error('SMS error:', smsError);
          // Handle specific error codes
          if (smsError.code === 'SEND_CANCELLED') {
            return { success: false, message: 'SMS cancelled by user' };
          } else if (smsError.code === 'ERR_SERVICE_NOTFOUND') {
            return { success: false, message: 'SMS service not available on this device' };
          } else if (smsError.code === 'UNIMPLEMENTED') {
            // Fallback to sms: link
            window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
            return { success: true, message: 'SMS app opened' };
          }
          return { 
            success: false, 
            message: `Failed to open SMS: ${smsError.message || smsError.code || 'Unknown error'}` 
          };
        }
      } else {
        // Browser/Desktop: Open SMS app or WhatsApp Web
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Mobile browser: Open native SMS app
          window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
          return { success: true, message: 'SMS app opened' };
        } else {
          // Desktop: Open WhatsApp Web (works without account)
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
          window.open(whatsappUrl, '_blank');
          return { success: true, message: 'WhatsApp Web opened - send message there' };
        }
      }
    } catch (error: any) {
      return { success: false, message: `Failed to send SMS: ${error.message || 'Unknown error'}` };
    }
  }

  async setOrderStatus(status: 'placed'|'accepted'|'on_the_way'|'delivered'|'cancelled'): Promise<void> {
    const currentOrders = this.orders$.value;
    if (currentOrders.length > 0) {
      const activeOrder = currentOrders.find(
        o => o.status !== 'cancelled' && o.status !== 'delivered'
      );
      if (activeOrder) {
        await this.setOrderStatusById(activeOrder.id, status);
      }
    }
  }

  async setOrderStatusById(orderId: string, status: 'placed'|'accepted'|'on_the_way'|'delivered'|'cancelled'): Promise<void> {
    const currentOrders = this.orders$.value;
    const orderToUpdate = currentOrders.find(o => o.id === orderId);
    if (orderToUpdate) {
      if (environment.useBackend) {
        try {
          const response = await firstValueFrom(
            this.apiService.put<Order>(`orders/${orderId}`, { status })
          );
          if (response.success && response.data) {
            // Update local state
            const updated = currentOrders.map(o => 
              o.id === orderId ? { ...o, status } : o
            );
            this.orders$.next(updated);
          }
        } catch (error) {
          console.error('Failed to update order status:', error);
          // Fallback to local update
          const updated = currentOrders.map(o => 
            o.id === orderId ? { ...o, status } : o
          );
          this.orders$.next(updated);
          this.saveOrdersToStorage();
        }
      } else {
        const updated = currentOrders.map(o => 
          o.id === orderId ? { ...o, status } : o
        );
        this.orders$.next(updated);
        this.saveOrdersToStorage();
      }
    }
  }

  getOrders(): Order[] {
    return this.orders$.value;
  }

  /**
   * Save orders to localStorage (fallback)
   */
  private saveOrdersToStorage(): void {
    if (!environment.useBackend) {
      localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(this.orders$.value));
    }
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
      // Fallback to mock location if geolocation fails
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
      } else {
        // Browser: Open Uber web or show message
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
    const orderData = {
      status: 'placed' as const,
      placedAt: Date.now(),
      etaMinutes: 15,
      fakeCourierName: 'Maya',
      pizzaId: payload.pizzaId,
      pizzaName: payload.pizzaName,
      pizzaImage: payload.pizzaImage,
      pizzaPrice: payload.pizzaPrice,
      note: payload.note,
    };

    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(
          this.apiService.post<ApiOrder>('orders', orderData)
        );
        if (response.success && response.data) {
          const apiOrder = response.data as ApiOrder;
          const order: Order = {
            id: apiOrder.id || apiOrder._id || '',
            ...orderData,
            placedAt: apiOrder.placedAt ? (typeof apiOrder.placedAt === 'number' ? apiOrder.placedAt : new Date(apiOrder.placedAt).getTime()) : Date.now()
          };
          const currentOrders = this.orders$.value;
          this.orders$.next([order, ...currentOrders]);
          return order;
        } else {
          throw new Error(response.message || 'Failed to create order');
        }
      } catch (error) {
        console.error('Failed to create order via API:', error);
        // Fallback to local storage
        return this.createOrderLocally(orderData);
      }
    } else {
      return this.createOrderLocally(orderData);
    }
  }

  /**
   * Create order locally (fallback)
   */
  private createOrderLocally(orderData: any): Order {
    const order: Order = {
      id: Math.random().toString(36).substring(2, 15),
      ...orderData
    };
    const currentOrders = this.orders$.value;
    this.orders$.next([order, ...currentOrders]);
    this.saveOrdersToStorage();
    return order;
  }

  async addContact(contact: Contact): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(
          this.apiService.post<ApiContact>('contacts', {
            name: contact.name,
            phone: contact.phone,
            isPrimary: contact.isPrimary
          })
        );
        if (response.success && response.data) {
          const apiContact = response.data as ApiContact;
          const newContact: Contact = {
            id: apiContact.id || apiContact._id || '',
            name: apiContact.name,
            phone: apiContact.phone,
            isPrimary: apiContact.isPrimary
          };
          const currentContacts = this.contacts$.value;
          this.contacts$.next([...currentContacts, newContact]);
        }
      } catch (error) {
        console.error('Failed to add contact via API:', error);
        // Fallback to local storage
        this.addContactLocally(contact);
      }
    } else {
      this.addContactLocally(contact);
    }
  }

  /**
   * Add contact locally (fallback)
   */
  private addContactLocally(contact: Contact): void {
    const currentContacts = this.contacts$.value;
    this.contacts$.next([...currentContacts, contact]);
    this.saveContactsToStorage();
  }

  async updateContact(updatedContact: Contact): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(
          this.apiService.put<ApiContact>(`contacts/${updatedContact.id}`, {
            name: updatedContact.name,
            phone: updatedContact.phone,
            isPrimary: updatedContact.isPrimary
          })
        );
        if (response.success && response.data) {
          const apiContact = response.data as ApiContact;
          const updated: Contact = {
            id: apiContact.id || apiContact._id || '',
            name: apiContact.name,
            phone: apiContact.phone,
            isPrimary: apiContact.isPrimary
          };
          const currentContacts = this.contacts$.value;
          const index = currentContacts.findIndex(c => c.id === updatedContact.id);
          if (index !== -1) {
            const updatedList = [...currentContacts];
            updatedList[index] = updated;
            this.contacts$.next(updatedList);
          }
        }
      } catch (error) {
        console.error('Failed to update contact via API:', error);
        // Fallback to local storage
        this.updateContactLocally(updatedContact);
      }
    } else {
      this.updateContactLocally(updatedContact);
    }
  }

  /**
   * Update contact locally (fallback)
   */
  private updateContactLocally(updatedContact: Contact): void {
    const currentContacts = this.contacts$.value;
    const index = currentContacts.findIndex(c => c.id === updatedContact.id);
    if (index !== -1) {
      const updated = [...currentContacts];
      updated[index] = updatedContact;
      this.contacts$.next(updated);
      this.saveContactsToStorage();
    }
  }

  async removeContact(id: string): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(
          this.apiService.delete<Contact>(`contacts/${id}`)
        );
        if (response.success) {
          const currentContacts = this.contacts$.value;
          this.contacts$.next(currentContacts.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Failed to remove contact via API:', error);
        // Fallback to local storage
        this.removeContactLocally(id);
      }
    } else {
      this.removeContactLocally(id);
    }
  }

  /**
   * Remove contact locally (fallback)
   */
  private removeContactLocally(id: string): void {
    const currentContacts = this.contacts$.value;
    this.contacts$.next(currentContacts.filter(c => c.id !== id));
    this.saveContactsToStorage();
  }

  /**
   * Save contacts to localStorage (fallback)
   */
  private saveContactsToStorage(): void {
    if (!environment.useBackend) {
      localStorage.setItem(this.CONTACTS_STORAGE_KEY, JSON.stringify(this.contacts$.value));
    }
  }

    // ============================
  // 🔐 PIZZA CODE SECURITY LOGIC
  // ============================

  private readonly PIZZA_PIN_KEY = 'pizza_time_pin';
  private readonly PIZZA_CODES_KEY = 'pizza_time_codes';

  // Default mappings (safe fallback)
  private pizzaCodes: PizzaCodeAction[] = [
    { id: 'cheese', topping: 'Cheese', action: 'SMS', payload: 1 },
    { id: 'pepperoni', topping: 'Pepperoni', action: 'UBER' },
    { id: 'veggie', topping: 'Veggie', action: 'LOCATION' }
  ];

  /** =====================
   * 🔐 PIN MANAGEMENT
   * ===================== */

  async setPin(pin: string): Promise<void> {
    localStorage.setItem(this.PIZZA_PIN_KEY, pin);
  }

  async verifyPin(pin: string): Promise<boolean> {
    const savedPin = localStorage.getItem(this.PIZZA_PIN_KEY);
    return savedPin === pin;
  }

  /** =====================
   * 🍕 PIZZA CODE MAPPING
   * ===================== */

  getPizzaCodes(): PizzaCodeAction[] {
    const stored = localStorage.getItem(this.PIZZA_CODES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return this.pizzaCodes;
  }

  savePizzaCodes(codes: PizzaCodeAction[]): void {
    this.pizzaCodes = codes;
    localStorage.setItem(this.PIZZA_CODES_KEY, JSON.stringify(codes));
  }

  /** =====================
   * 🚨 EXECUTE PIZZA ACTION
   * ===================== */

  async executePizzaAction(topping: string): Promise<any> {
    const codes = this.getPizzaCodes();
    const match = codes.find(c => c.topping === topping);

    if (!match) {
      return { success: false, message: 'No action mapped' };
    }

    switch (match.action) {

      case 'SMS':
        return await this.broadcastToContacts(
          typeof match.payload === 'number' ? match.payload : 0
        );

      case 'LOCATION': {
        const loc = await this.getMockLocation();
        return await this.broadcastToContacts(0);
      }

      case 'UBER': {
        const loc = await this.getMockLocation();
        return await this.placeMockUberOrder(loc);
      }

      default:
        return { success: false, message: 'Unknown action' };
    }
  }

}