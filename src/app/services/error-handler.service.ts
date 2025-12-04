import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';

export interface ErrorInfo {
  message: string;
  userMessage: string;
  statusCode?: number;
  retryable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(
    private toast: ToastController,
    private alert: AlertController
  ) {}

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  handleHttpError(error: HttpErrorResponse): ErrorInfo {
    let userMessage = 'An error occurred. Please try again.';
    let retryable = false;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      userMessage = 'Network error. Please check your internet connection.';
      retryable = true;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          userMessage = 'Unable to connect to server. Please check your connection.';
          retryable = true;
          break;
        case 400:
          userMessage = error.error?.message || 'Invalid request. Please check your input.';
          retryable = false;
          break;
        case 401:
          userMessage = 'Please log in to continue.';
          retryable = false;
          break;
        case 403:
          userMessage = 'You do not have permission to perform this action.';
          retryable = false;
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          retryable = false;
          break;
        case 408:
          userMessage = 'Request timeout. Please try again.';
          retryable = true;
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again.';
          retryable = true;
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          retryable = true;
          break;
        case 502:
        case 503:
        case 504:
          userMessage = 'Service is temporarily unavailable. Please try again later.';
          retryable = true;
          break;
        default:
          userMessage = `Error ${error.status}: ${error.message || 'An unexpected error occurred'}`;
          retryable = error.status >= 500;
      }
    }

    return {
      message: error.message,
      userMessage,
      statusCode: error.status,
      retryable,
    };
  }

  /**
   * Show error toast
   */
  async showErrorToast(message: string, duration: number = 3000) {
    const toast = await this.toast.create({
      message,
      duration,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }

  /**
   * Show error alert with retry option
   */
  async showErrorAlert(
    message: string,
    retryCallback?: () => void
  ): Promise<boolean> {
    const buttons: any[] = [
      {
        text: 'OK',
        role: 'cancel',
      },
    ];

    if (retryCallback) {
      buttons.unshift({
        text: 'Retry',
        handler: () => {
          retryCallback();
        },
      });
    }

    const alert = await this.alert.create({
      header: 'Error',
      message,
      buttons,
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role !== 'cancel';
  }

  /**
   * Handle generic errors
   */
  handleError(error: any): ErrorInfo {
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }

    return {
      message: error?.message || 'Unknown error',
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: false,
    };
  }
}
