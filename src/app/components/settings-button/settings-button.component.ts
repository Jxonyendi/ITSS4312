import { Component } from '@angular/core';
import { IonButton, IonIcon, IonPopover, IonList, IonItem, IonLabel, IonButtons, IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { settingsOutline, notificationsOutline, optionsOutline, helpCircleOutline, informationCircleOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-button',
  templateUrl: './settings-button.component.html',
  styleUrls: ['./settings-button.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonPopover, IonList, IonItem, IonLabel, IonButtons, IonContent, CommonModule]
})
export class SettingsButtonComponent {
  // Generate unique ID for each component instance to avoid conflicts
  public triggerId = `settings-trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  constructor(
    private authService: AuthService,
    private toast: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({
      'settings-outline': settingsOutline,
      'notifications-outline': notificationsOutline,
      'options-outline': optionsOutline,
      'help-circle-outline': helpCircleOutline,
      'information-circle-outline': informationCircleOutline,
      'log-out-outline': logOutOutline,
      'trash-outline': trashOutline
    });
  }

  openNotifications() {
    this.router.navigate(['/tabs/settings']);
  }

  openPreferences() {
    this.router.navigate(['/tabs/settings']);
  }

  openHelp() {
    this.router.navigate(['/tabs/contact-us']);
  }

  openAbout() {
    const alert = this.alertController.create({
      header: 'About Pizza Time',
      message: 'Version 1.0.0\n\nOrder your favorite pizza, track delivery in real-time, and enjoy fast, fresh pizza delivered to your door.',
      buttons: ['OK']
    });
    alert.then(a => a.present());
  }

  async handleLogout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
            this.showToast('Logged out successfully');
          }
        }
      ]
    });

    await alert.present();
  }

  async handleDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone. Please type your password to confirm.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Enter your password',
          attributes: {
            required: true
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete Account',
          role: 'destructive',
          handler: async (data) => {
            if (!data.password || data.password.trim() === '') {
              this.showToast('Password is required');
              return false;
            }

            const result = await this.authService.deleteAccount(data.password);
            if (result.success) {
              this.showToast(result.message);
              return true;
            } else {
              this.showToast(result.message);
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {
    const t = await this.toast.create({ message, duration: 2000 });
    t.present();
  }
}

