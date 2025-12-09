// src/app/services/emergency.services.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { SmsManager } from '@byteowls/capacitor-sms';

/*
 * ============================
 * Types / Interfaces
 * ============================
 */

export type PizzaTriggerAction =
  | 'ORDER_UBER_HOME'
  | 'SEND_HELP_TEXT'
  | 'CALL_PRIMARY'
  | 'SHARE_LOCATION';

export interface PizzaCodeAction {
  id: string;
  topping: string;            // display name like 'Pepperoni'
  action: PizzaTriggerAction; // one of the app-level triggers
  payload?: any;              // optional extra (e.g., index into messages)
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

/*
 * ============================
 * Service
 * ============================
 */

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {
  // Reactive stores
  contacts$ = new BehaviorSubject<Contact[]>([]);
  orders$ = new BehaviorSubject<Order[]>([]);

  // Prewritten messages (can be extended by user)
  messages: string[] = [
    'I need help. Please call me.',
    'I am okay. No help needed.',
    'Emergency situation. Please respond immediately.'
  ];

  // localStorage keys
  private readonly CONTACTS_STORAGE_KEY = 'pizza_time_contacts';
  private readonly ORDERS_STORAGE_KEY = 'pizza_time_orders';
  private readonly MESSAGES_STORAGE_KEY = 'pizza_time_messages';
  private readonly PIZZA_CODES_KEY = 'pizza_time_codes';

  // PIN constants (single place)
  private readonly PIZZA_PIN_KEY = 'pizza_time_pin';
  private readonly DEFAULT_PIN = '1234';

  // Default pizza code mappings (use app-level trigger names)
  private pizzaCodes: PizzaCodeAction[] = [
    // payload: index into messages[] for SEND_HELP_TEXT
    { id: 'cheese', topping: 'Cheese', action: 'SEND_HELP_TEXT', payload: 1 },
    { id: 'pepperoni', topping: 'Pepperoni', action: 'ORDER_UBER_HOME' },
    { id: 'veggie', topping: 'Veggie', action: 'SHARE_LOCATION' }
  ];

  constructor(private apiService: ApiService) {
    // Initialize state from backend or storage
    this.loadContacts();
    this.loadOrders();
    this.loadMessages();
    this.loadPizzaCodes();

    // Ensure a default PIN exists so 1234 unlocks by default
    try {
      const storedPin = localStorage.getItem(this.PIZZA_PIN_KEY);
      if (!storedPin) {
        localStorage.setItem(this.PIZZA_PIN_KEY, this.DEFAULT_PIN);
      }
    } catch (err) {
      console.warn('Could not initialize default PIN in localStorage', err);
    }
  }

  /* ============================
     Contacts
   ============================ */

  private async loadContacts(): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.get<ApiContact[]>('contacts'));
        if (response.success && response.data) {
          const contacts = response.data.map((c: ApiContact) => ({
            id: c.id || c._id || '',
            name: c.name,
            phone: c.phone,
            isPrimary: c.isPrimary
          }));
          this.contacts$.next(contacts);
          return;
        }
      } catch (error) {
        console.error('Failed to load contacts from API:', error);
      }
    }

    // Fallback to localStorage
    this.loadContactsFromStorage();
  }

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

  private saveContactsToStorage(): void {
    try {
      localStorage.setItem(this.CONTACTS_STORAGE_KEY, JSON.stringify(this.contacts$.value));
    } catch (error) {
      console.error('Failed to save contacts to storage:', error);
    }
  }

  async addContact(contact: Contact): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.post<ApiContact>('contacts', {
          name: contact.name,
          phone: contact.phone,
          isPrimary: contact.isPrimary
        }));

        if (response.success && response.data) {
          const apiContact = response.data as ApiContact;
          const newContact: Contact = {
            id: apiContact.id || apiContact._id || '',
            name: apiContact.name,
            phone: apiContact.phone,
            isPrimary: apiContact.isPrimary
          };
          this.contacts$.next([...this.contacts$.value, newContact]);
          return;
        }
      } catch (error) {
        console.error('Failed to add contact via API:', error);
      }
    }

    // Local fallback
    const current = this.contacts$.value;
    this.contacts$.next([...current, contact]);
    this.saveContactsToStorage();
  }

  async updateContact(updatedContact: Contact): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.put<ApiContact>(`contacts/${updatedContact.id}`, {
          name: updatedContact.name,
          phone: updatedContact.phone,
          isPrimary: updatedContact.isPrimary
        }));

        if (response.success && response.data) {
          const apiContact = response.data as ApiContact;
          const updated: Contact = {
            id: apiContact.id || apiContact._id || '',
            name: apiContact.name,
            phone: apiContact.phone,
            isPrimary: apiContact.isPrimary
          };
          const list = [...this.contacts$.value];
          const idx = list.findIndex(c => c.id === updated.id);
          if (idx !== -1) {
            list[idx] = updated;
            this.contacts$.next(list);
          }
          return;
        }
      } catch (error) {
        console.error('Failed to update contact via API:', error);
      }
    }

    // Local fallback
    const local = [...this.contacts$.value];
    const index = local.findIndex(c => c.id === updatedContact.id);
    if (index !== -1) {
      local[index] = updatedContact;
      this.contacts$.next(local);
      this.saveContactsToStorage();
    }
  }

  async removeContact(id: string): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.delete<Contact>(`contacts/${id}`));
        if (response.success) {
          this.contacts$.next(this.contacts$.value.filter(c => c.id !== id));
          return;
        }
      } catch (error) {
        console.error('Failed to remove contact via API:', error);
      }
    }

    // Local fallback
    this.contacts$.next(this.contacts$.value.filter(c => c.id !== id));
    this.saveContactsToStorage();
  }

  /* ============================
     Orders
   ============================ */

  private async loadOrders(): Promise<void> {
    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.get<ApiOrder[]>('orders'));
        if (response.success && response.data) {
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
          return;
        }
      } catch (error) {
        console.error('Failed to load orders from API:', error);
      }
    }

    this.loadOrdersFromStorage();
  }

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

  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(this.orders$.value));
    } catch (error) {
      console.error('Failed to save orders to storage:', error);
    }
  }

  async placePizzaOrder(payload: {
    pizzaId: string;
    pizzaName: string;
    pizzaImage?: string;
    pizzaPrice?: number;
    note?: string;
  }): Promise<Order> {
    const orderData: any = {
      status: 'placed' as const,
      placedAt: Date.now(),
      etaMinutes: 15,
      fakeCourierName: 'Maya',
      pizzaId: payload.pizzaId,
      pizzaName: payload.pizzaName,
      pizzaImage: payload.pizzaImage,
      pizzaPrice: payload.pizzaPrice,
      note: payload.note
    };

    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.post<ApiOrder>('orders', orderData));
        if (response.success && response.data) {
          const apiOrder = response.data as ApiOrder;
          const order: Order = {
            id: apiOrder.id || apiOrder._id || '',
            ...orderData,
            placedAt: apiOrder.placedAt ? (typeof apiOrder.placedAt === 'number' ? apiOrder.placedAt : new Date(apiOrder.placedAt).getTime()) : Date.now()
          };
          this.orders$.next([order, ...this.orders$.value]);
          return order;
        } else {
          throw new Error(response.message || 'Failed to create order');
        }
      } catch (error) {
        console.error('Failed to create order via API:', error);
        return this.createOrderLocally(orderData);
      }
    } else {
      return this.createOrderLocally(orderData);
    }
  }

  private createOrderLocally(orderData: any): Order {
    const order: Order = {
      id: Math.random().toString(36).substring(2, 15),
      ...orderData
    };
    this.orders$.next([order, ...this.orders$.value]);
    this.saveOrdersToStorage();
    return order;
  }

  async setOrderStatusById(orderId: string, status: 'placed'|'accepted'|'on_the_way'|'delivered'|'cancelled'): Promise<void> {
    const currentOrders = this.orders$.value;
    const orderToUpdate = currentOrders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    if (environment.useBackend) {
      try {
        const response = await firstValueFrom(this.apiService.put<Order>(`orders/${orderId}`, { status }));
        if (response.success && response.data) {
          const updated = currentOrders.map(o => o.id === orderId ? { ...o, status } : o);
          this.orders$.next(updated);
        }
      } catch (error) {
        console.error('Failed to update order status via API:', error);
        const updated = currentOrders.map(o => o.id === orderId ? { ...o, status } : o);
        this.orders$.next(updated);
        this.saveOrdersToStorage();
      }
    } else {
      const updated = currentOrders.map(o => o.id === orderId ? { ...o, status } : o);
      this.orders$.next(updated);
      this.saveOrdersToStorage();
    }
  }

  getOrders(): Order[] {
    return this.orders$.value;
  }

  /* ============================
     SMS / Broadcast
   ============================ */

  // Broadcast to all contacts (optionally append extra text)
  async broadcastToContacts(type: number, extra?: string): Promise<any> {
    const message = (this.messages[type] || this.messages[0]) + (extra ? `\n${extra}` : '');
    const contacts = this.contacts$.value;

    if (!contacts || contacts.length === 0) {
      return { success: false, message: 'No contacts saved' };
    }

    const results: any[] = [];

    for (const contact of contacts) {
      try {
        // sanitize phone
        const cleanPhone = (contact.phone || '').replace(/[^\d+]/g, '');
        if (Capacitor.isNativePlatform()) {
          // try native SmsManager where available
          try {
            await SmsManager.send({ numbers: [cleanPhone], text: message });
            results.push({ contact: contact.name, success: true });
          } catch (smsErr: any) {
            console.warn('SmsManager failed, fallback to sms: link', smsErr);
            // fallback: open sms link
            window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
            results.push({ contact: contact.name, success: true, fallback: true });
          }
        } else {
          // Browser fallback: open WhatsApp web or sms link on mobile browsers
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
            results.push({ contact: contact.name, success: true, fallback: 'sms_link' });
          } else {
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            results.push({ contact: contact.name, success: true, fallback: 'whatsapp' });
          }
        }
      } catch (err: any) {
        console.error('Failed to send/broadcast to contact', contact, err);
        results.push({ contact: contact.name, success: false, error: err?.message || err });
      }
    }

    return {
      success: results.every(r => r.success === true),
      results,
      sentTo: results.length,
      message
    };
  }

  // Single-message helper used by contact-us page or anywhere else
  async sendMockSms(phone: string, msg: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
      if (Capacitor.isNativePlatform()) {
        try {
          await SmsManager.send({ numbers: [cleanPhone], text: msg });
          return { success: true, message: 'SMS app opened with message ready to send!' };
        } catch (smsError: any) {
          console.error('SMS error:', smsError);
          if (smsError.code === 'UNIMPLEMENTED') {
            window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
            return { success: true, message: 'SMS app opened' };
          }
          return { success: false, message: smsError.message || 'Failed to send SMS' };
        }
      } else {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
          return { success: true, message: 'SMS link opened' };
        } else {
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
          window.open(whatsappUrl, '_blank');
          return { success: true, message: 'WhatsApp Web opened - send message there' };
        }
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Unknown error' };
    }
  }

  /* ============================
     Geolocation helpers
   ============================ */

  async getMockLocation(): Promise<any> {
    try {
      if (Capacitor.isNativePlatform()) {
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          accuracy: position.coords.accuracy
        };
      } else {
        // browser fallback
        return new Promise((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
                accuracy: position.coords.accuracy
              }),
              () => resolve(this.getFallbackLocation())
            );
          } else {
            resolve(this.getFallbackLocation());
          }
        });
      }
    } catch (error) {
      return this.getFallbackLocation();
    }
  }

  private getFallbackLocation(): any {
    return {
      lat: 32.7767,
      lng: -96.7970,
      address: 'Mock Location (Dallas, TX)'
    };
  }

  /* ============================
     Place Uber (deep link + web fallback)
     This is where the Uber web link you shared belongs.
   ============================ */

  async placeMockUberOrder(location: any): Promise<Order> {
    try {
      // Native deep link (attempt)
      if (Capacitor.isNativePlatform()) {
        const uberUrlNative = `uber://?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}`;
        // If you want to use Capacitor Browser, import and call Browser.open({ url: uberUrlNative })
        // but we won't throw on failure (deep link not available is normal).
      } else {
        // Browser fallback - open Uber mobile web link
        const uberWeb = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}`;
        window.open(uberWeb, '_blank');
      }

      // Create an order record locally (or via API if desired)
      const order: Order = {
        id: Math.random().toString(36).substring(2, 15),
        status: 'placed',
        placedAt: Date.now(),
        etaMinutes: 15,
        fakeCourierName: 'Maya'
      };

      const currentOrders = this.orders$.value;
      this.orders$.next([order, ...currentOrders]);

      // If backend is enabled, optionally call API to persist order (omitted for simplicity)
      return order;
    } catch (error) {
      console.error('placeMockUberOrder error:', error);
      // still create order locally
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
  }

  /* ============================
     Pizza Code logic: get/save & execute
   ============================ */

  private loadPizzaCodes(): void {
    try {
      const raw = localStorage.getItem(this.PIZZA_CODES_KEY);
      if (raw) {
        this.pizzaCodes = JSON.parse(raw);
      } else {
        // ensure default persists if not present
        this.savePizzaCodes(this.pizzaCodes);
      }
    } catch (error) {
      console.error('Failed to load pizza codes from storage:', error);
    }
  }

  getPizzaCodes(): PizzaCodeAction[] {
    return [...this.pizzaCodes];
  }

  savePizzaCodes(codes: PizzaCodeAction[]): void {
    try {
      this.pizzaCodes = codes;
      localStorage.setItem(this.PIZZA_CODES_KEY, JSON.stringify(codes));
    } catch (error) {
      console.error('Failed to save pizza codes:', error);
    }
  }

  // Execute the mapped action for a topping
  async executePizzaAction(toppingIdOrName: string): Promise<any> {
    // support either passing the id or the display topping string
    const match = this.pizzaCodes.find(c => c.id === toppingIdOrName || c.topping === toppingIdOrName);

    if (!match) {
      return { success: false, message: 'No action mapped for that topping' };
    }

    switch (match.action) {
      case 'SEND_HELP_TEXT':
        // payload -> index into messages array (optional)
        return this.broadcastToContacts(typeof match.payload === 'number' ? match.payload : 0);

      case 'SHARE_LOCATION': {
        const loc = await this.getMockLocation();
        // Broadcast default message + location appended
        return this.broadcastToContacts(0, loc.address);
      }

      case 'ORDER_UBER_HOME': {
        // get user location and try to place uber
        const loc = await this.getMockLocation();
        return this.placeMockUberOrder(loc);
      }

      case 'CALL_PRIMARY': {
        // Optionally implement call primary: open tel: link to primary contact if exists
        const primary = this.contacts$.value.find(c => c.isPrimary) || this.contacts$.value[0];
        if (!primary) return { success: false, message: 'No contact available to call' };
        // open dialer
        window.location.href = `tel:${(primary.phone || '').replace(/[^\d+]/g, '')}`;
        return { success: true, called: primary.name };
      }

      default:
        return { success: false, message: 'Unknown pizza action' };
    }
  }

  /* ============================
     Messages persistence & helpers
   ============================ */

  private loadMessages(): void {
    try {
      const raw = localStorage.getItem(this.MESSAGES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messages = parsed;
        }
      } else {
        // ensure defaults are available if not stored
        localStorage.setItem(this.MESSAGES_STORAGE_KEY, JSON.stringify(this.messages));
      }
    } catch (error) {
      console.error('Failed to load messages from storage:', error);
    }
  }

  addCustomMessage(text: string): void {
    if (!text || !text.trim()) return;
    this.messages.push(text.trim());
    try {
      localStorage.setItem(this.MESSAGES_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (err) {
      console.error('Failed to save custom message:', err);
    }
  }

  saveMessages(): void {
    try {
      localStorage.setItem(this.MESSAGES_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  /* ============================
     PIN management
   ============================ */

  // setPin & verifyPin use the single PIN key above
  async setPin(pin: string): Promise<void> {
    try {
      if (!pin || pin.length < 4) return;
      localStorage.setItem(this.PIZZA_PIN_KEY, pin);
    } catch (err) {
      console.error('Failed to save pin:', err);
    }
  }

  async verifyPin(pin: string): Promise<boolean> {
    try {
      const saved = localStorage.getItem(this.PIZZA_PIN_KEY);
      // fallback to DEFAULT_PIN if nothing in storage (ensures 1234 works)
      return (saved ?? this.DEFAULT_PIN) === pin;
    } catch {
      return false;
    }
  }

  /* ============================
     Utility / debug helpers
   ============================ */

  // convenience wrapper if other code expects this name
  async broadcastToContactsWithIndex(index: number) {
    return this.broadcastToContacts(index);
  }
}
