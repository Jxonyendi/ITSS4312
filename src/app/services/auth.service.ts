import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: number;
}

export interface UserCredentials {
  username: string;
  email?: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'pizza_time_users';
  private readonly SESSION_KEY = 'pizza_time_session';
  private currentUser$ = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUser$.asObservable();

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    // Check for existing session on initialization
    this.checkSession();
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser$.value;
  }

  /**
   * Register a new user
   */
  async register(credentials: UserCredentials): Promise<{ success: boolean; message: string }> {
    try {
      if (environment.useBackend) {
        // Use REST API
        const response = await firstValueFrom(
          this.apiService.post<any>('auth/register', {
            username: credentials.username,
            email: credentials.email,
            password: credentials.password
          })
        );

        // Backend returns { success, token, user, message } at top level
        const token = response.token || (response.data as any)?.token;
        const userData = response.user || (response.data as any)?.user;

        if (response.success && token && userData) {
          // Store token
          this.apiService.setAuthToken(token);
          
          // Convert API user to app User format
          const user: User = {
            id: userData.id || userData._id,
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt ? new Date(userData.createdAt).getTime() : Date.now()
          };

          // Set current user
          this.currentUser$.next(user);
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));

          return { success: true, message: response.message || 'Registration successful' };
        } else {
          return { success: false, message: response.message || 'Registration failed' };
        }
      } else {
        // Fallback to localStorage
        const users = this.getUsers();
        
        // Check if username already exists
        if (users.find(u => u.username.toLowerCase() === credentials.username.toLowerCase())) {
          return { success: false, message: 'Username already exists' };
        }

        // Create new user
        const newUser: User = {
          id: this.generateId(),
          username: credentials.username,
          email: credentials.email,
          createdAt: Date.now()
        };

        // Store user and password (in production, password should be hashed)
        users.push(newUser);
        this.saveUsers(users);
        this.savePassword(credentials.username, credentials.password);

        // Auto-login after registration
        await this.login(credentials);
        
        return { success: true, message: 'Registration successful' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  async login(credentials: UserCredentials): Promise<{ success: boolean; message: string }> {
    try {
      if (environment.useBackend) {
        // Use REST API
        const response = await firstValueFrom(
          this.apiService.post<any>('auth/login', {
            username: credentials.username,
            password: credentials.password
          })
        );

        // Backend returns { success, token, user, message } at top level
        const token = response.token || (response.data as any)?.token;
        const userData = response.user || (response.data as any)?.user;

        if (response.success && token && userData) {
          // Store token
          this.apiService.setAuthToken(token);
          
          // Convert API user to app User format
          const user: User = {
            id: userData.id || userData._id,
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt ? new Date(userData.createdAt).getTime() : Date.now()
          };

          // Set current user
          this.currentUser$.next(user);
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));

          return { success: true, message: response.message || 'Login successful' };
        } else {
          return { success: false, message: response.message || 'Invalid username or password' };
        }
      } else {
        // Fallback to localStorage
        const users = this.getUsers();
        const user = users.find(u => u.username.toLowerCase() === credentials.username.toLowerCase());
        
        if (!user) {
          return { success: false, message: 'Invalid username or password' };
        }

        // Verify password (in production, use proper hashing)
        const storedPassword = this.getPassword(credentials.username);
        if (storedPassword !== credentials.password) {
          return { success: false, message: 'Invalid username or password' };
        }

        // Set session
        this.currentUser$.next(user);
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));

        return { success: true, message: 'Login successful' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.currentUser$.next(null);
    localStorage.removeItem(this.SESSION_KEY);
    this.apiService.clearAuthToken();
    this.router.navigate(['/login']);
  }

  /**
   * Check for existing session
   */
  private async checkSession(): Promise<void> {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      const token = this.apiService.getAuthToken();
      
      if (environment.useBackend && token) {
        // Verify token with API
        try {
          const response = await firstValueFrom(
            this.apiService.get<{ user: any }>('auth/me')
          );
          
          if (response.success && response.data && response.data.user) {
            const apiUser = response.data.user;
            const user: User = {
              id: apiUser.id || apiUser._id,
              username: apiUser.username,
              email: apiUser.email,
              createdAt: apiUser.createdAt ? new Date(apiUser.createdAt).getTime() : Date.now()
            };
            this.currentUser$.next(user);
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
          } else {
            // Token invalid, clear session
            this.apiService.clearAuthToken();
            localStorage.removeItem(this.SESSION_KEY);
          }
        } catch (error) {
          // API call failed, clear session
          this.apiService.clearAuthToken();
          localStorage.removeItem(this.SESSION_KEY);
        }
      } else if (sessionData) {
        // Fallback to localStorage
        const user = JSON.parse(sessionData);
        // Verify user still exists
        const users = this.getUsers();
        if (users.find(u => u.id === user.id)) {
          this.currentUser$.next(user);
        } else {
          localStorage.removeItem(this.SESSION_KEY);
        }
      }
    } catch (error) {
      localStorage.removeItem(this.SESSION_KEY);
      this.apiService.clearAuthToken();
    }
  }

  /**
   * Get all users from storage
   */
  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save users to storage
   */
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  /**
   * Save password (in production, use proper hashing)
   */
  private savePassword(username: string, password: string): void {
    const passwordKey = `pizza_time_pwd_${username.toLowerCase()}`;
    // In production, hash the password before storing
    localStorage.setItem(passwordKey, password);
  }

  /**
   * Get password (in production, compare hashes)
   */
  private getPassword(username: string): string | null {
    const passwordKey = `pizza_time_pwd_${username.toLowerCase()}`;
    return localStorage.getItem(passwordKey);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

