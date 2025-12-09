import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string; // Unique ID for cart item
  pizzaId: string;
  pizzaName: string;
  pizzaImage?: string;
  pizzaPrice: number;
  customization?: {
    size?: string;
    crust?: string;
    sauce?: string;
    cheese?: string;
    toppings?: string[];
  };
  note?: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'pizza_time_cart';
  private readonly DELIVERY_TYPE_KEY = 'pizza_time_delivery_type';
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Load cart from localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        this.cartItems$.next(items);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      this.cartItems$.next([]);
    }
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems$.value));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }

  /**
   * Generate unique ID for cart item based on pizza data
   */
  private generateItemId(pizzaData: {
    pizzaId: string;
    customization?: any;
  }): string {
    const base = pizzaData.pizzaId;
    if (pizzaData.customization) {
      const customHash = JSON.stringify(pizzaData.customization);
      return `${base}_${this.hashCode(customHash)}`;
    }
    return base;
  }

  /**
   * Simple hash function for customization
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Add pizza to cart
   * If same pizza with same customization exists, increment quantity
   */
  addToCart(pizzaData: {
    pizzaId: string;
    pizzaName: string;
    pizzaImage?: string;
    pizzaPrice: number;
    customization?: {
      size?: string;
      crust?: string;
      sauce?: string;
      cheese?: string;
      toppings?: string[];
    };
    note?: string;
  }): void {
    const itemId = this.generateItemId(pizzaData);
    const currentItems = this.cartItems$.value;
    const existingItem = currentItems.find(item => item.id === itemId);

    if (existingItem) {
      // Increment quantity
      existingItem.quantity += 1;
      this.cartItems$.next([...currentItems]);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        pizzaId: pizzaData.pizzaId,
        pizzaName: pizzaData.pizzaName,
        pizzaImage: pizzaData.pizzaImage,
        pizzaPrice: pizzaData.pizzaPrice,
        customization: pizzaData.customization,
        note: pizzaData.note,
        quantity: 1
      };
      this.cartItems$.next([...currentItems, newItem]);
    }

    this.saveCartToStorage();
  }

  /**
   * Remove item from cart
   */
  removeFromCart(itemId: string): void {
    const currentItems = this.cartItems$.value;
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    this.cartItems$.next(updatedItems);
    this.saveCartToStorage();
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentItems = this.cartItems$.value;
    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    this.cartItems$.next(updatedItems);
    this.saveCartToStorage();
  }

  /**
   * Get current cart items
   */
  getCartItems(): CartItem[] {
    return this.cartItems$.value;
  }

  /**
   * Get cart items as observable
   */
  getCartItems$() {
    return this.cartItems$.asObservable();
  }

  /**
   * Calculate total price of all items in cart
   */
  getCartTotal(): number {
    return this.cartItems$.value.reduce((total, item) => {
      return total + (item.pizzaPrice * item.quantity);
    }, 0);
  }

  /**
   * Get total number of items in cart (sum of quantities)
   */
  getCartItemCount(): number {
    return this.cartItems$.value.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.cartItems$.next([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  /**
   * Get delivery type preference
   */
  getDeliveryType(): 'carry' | 'delivery' | null {
    try {
      const saved = localStorage.getItem(this.DELIVERY_TYPE_KEY);
      if (saved === 'carry' || saved === 'delivery') {
        return saved;
      }
    } catch (error) {
      console.error('Failed to load delivery type:', error);
    }
    return null;
  }

  /**
   * Set delivery type preference
   */
  setDeliveryType(type: 'carry' | 'delivery'): void {
    try {
      localStorage.setItem(this.DELIVERY_TYPE_KEY, type);
    } catch (error) {
      console.error('Failed to save delivery type:', error);
    }
  }

  /**
   * Get saved address
   */
  getAddress(): {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    apt?: string;
    instructions?: string;
  } | null {
    try {
      const saved = localStorage.getItem('pizza_time_address');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load address:', error);
    }
    return null;
  }

  /**
   * Set saved address
   */
  setAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    apt?: string;
    instructions?: string;
  }): void {
    try {
      localStorage.setItem('pizza_time_address', JSON.stringify(address));
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  }
}

