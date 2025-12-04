import { Injectable } from '@angular/core';

/**
 * Database service for managing local storage
 * In production, this could be replaced with IndexedDB or a backend API
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly DB_PREFIX = 'pizza_time_db_';

  /**
   * Save data to localStorage
   */
  save<T>(key: string, data: T): void {
    try {
      const storageKey = `${this.DB_PREFIX}${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const storageKey = `${this.DB_PREFIX}${key}`;
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): void {
    try {
      const storageKey = `${this.DB_PREFIX}${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      // Silently fail if removal fails
    }
  }

  /**
   * Clear all app data
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.DB_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Silently fail if clearing fails
    }
  }

  /**
   * Check if key exists
   */
  exists(key: string): boolean {
    const storageKey = `${this.DB_PREFIX}${key}`;
    return localStorage.getItem(storageKey) !== null;
  }
}

