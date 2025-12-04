import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  token?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly TOKEN_KEY = 'pizza_time_auth_token';

  constructor(
    private http: HttpClient,
    private toast: ToastController
  ) {}

  /**
   * Generic GET request
   */
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    return this.http.get<T>(url, this.getHeaders()).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(2),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<T>(error, 'GET', endpoint);
      })
    ) as Observable<ApiResponse<T>>;
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    return this.http.post<ApiResponse<T>>(url, body, this.getHeaders()).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<T>(error, 'POST', endpoint);
      })
    );
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    return this.http.put<T>(url, body, this.getHeaders()).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<T>(error, 'PUT', endpoint);
      })
    ) as Observable<ApiResponse<T>>;
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    return this.http.delete<T>(url, this.getHeaders()).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<T>(error, 'DELETE', endpoint);
      })
    ) as Observable<ApiResponse<T>>;
  }

  /**
   * Get HTTP headers with authentication
   */
  private getHeaders(): { headers: HttpHeaders } {
    const token = this.getAuthToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return { headers };
  }

  /**
   * Get authentication token from storage
   */
  getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Handle HTTP errors
   */
  private handleError<T>(error: HttpErrorResponse, method: string, endpoint: string): Observable<ApiResponse<T>> {
    let errorMessage = 'An unknown error occurred';
    let userMessage = 'Something went wrong. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      userMessage = 'Network error. Please check your connection.';
    } else {
      // Server-side error - try to extract message from error body
      const errorBody = error.error;
      if (errorBody && typeof errorBody === 'object') {
        if (errorBody.message) {
          userMessage = errorBody.message;
          errorMessage = errorBody.error || errorBody.message;
        } else if (errorBody.error) {
          userMessage = errorBody.error;
          errorMessage = errorBody.error;
        }
      }
      
      // Server-side error
      switch (error.status) {
        case 200:
          // Sometimes 200 with error in body
          return of({
            success: true,
            data: error.error as T,
          } as ApiResponse<T>);
        case 400:
          errorMessage = `Bad Request: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = 'Invalid request. Please check your input.';
          }
          break;
        case 401:
          errorMessage = `Unauthorized: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = 'Please log in to continue.';
          }
          break;
        case 403:
          errorMessage = `Forbidden: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = 'You do not have permission to perform this action.';
          }
          break;
        case 404:
          errorMessage = `Not Found: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = 'The requested resource was not found.';
          }
          break;
        case 500:
          errorMessage = `Server Error: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = errorBody?.message || 'Server error. Please try again later.';
          }
          break;
        case 503:
          errorMessage = `Service Unavailable: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = 'Service is temporarily unavailable. Please try again later.';
          }
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          if (!userMessage || userMessage === 'Something went wrong. Please try again.') {
            userMessage = errorBody?.message || 'An error occurred. Please try again.';
          }
      }
    }

    // Show user-friendly error message
    this.showErrorToast(userMessage);

    // Return error response
    return of({
      success: false,
      error: errorMessage,
      message: userMessage,
    } as ApiResponse<T>);
  }

  /**
   * Show error toast to user
   */
  private async showErrorToast(message: string) {
    const toast = await this.toast.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  /**
   * Check if API is available (for mock mode detection)
   */
  isApiAvailable(): boolean {
    return environment.useBackend;
  }
}
