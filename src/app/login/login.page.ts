import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { pizza, lockClosed, person } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class LoginPage {
  username = '';
  password = '';
  isLoginMode = true;
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ pizza, lockClosed, person });
  }

  async onSubmit() {
    if (!this.username || !this.password) {
      this.showToast('Please fill in all fields');
      return;
    }

    if (!this.isLoginMode && this.password !== this.confirmPassword) {
      this.showToast('Passwords do not match');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.isLoginMode ? 'Logging in...' : 'Registering...',
    });
    await loading.present();

    try {
      let result;
      if (this.isLoginMode) {
        result = await this.authService.login({
          username: this.username,
          password: this.password,
        });
      } else {
        result = await this.authService.register({
          username: this.username,
          password: this.password,
        });
      }

      await loading.dismiss();

      if (result.success) {
        this.showToast(result.message);
        // Redirect to return URL or default to tabs
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs/home';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.showToast(result.message);
      }
    } catch (error) {
      await loading.dismiss();
      this.showToast('An error occurred. Please try again.');
      console.error('Auth error:', error);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.password = '';
    this.confirmPassword = '';
  }

  async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    t.present();
  }
}

