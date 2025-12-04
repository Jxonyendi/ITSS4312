import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule,
    FormsModule,
    ChatWidgetComponent
  ],
  standalone: true
})
export class SettingsPage {
  notificationsEnabled = true;
  darkModeEnabled = false;
  locationEnabled = true;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private toast: ToastController
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    // Load saved settings
    this.loadSettings();
  }

  loadSettings() {
    const settings = localStorage.getItem('app_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.notificationsEnabled = parsed.notificationsEnabled ?? true;
      this.darkModeEnabled = parsed.darkModeEnabled ?? false;
      this.locationEnabled = parsed.locationEnabled ?? true;
    }
  }

  saveSettings() {
    const settings = {
      notificationsEnabled: this.notificationsEnabled,
      darkModeEnabled: this.darkModeEnabled,
      locationEnabled: this.locationEnabled
    };
    localStorage.setItem('app_settings', JSON.stringify(settings));
    this.showToast('Settings saved');
  }

  onNotificationToggle() {
    this.saveSettings();
  }

  onDarkModeToggle() {
    this.saveSettings();
    // In a real app, you would apply dark mode theme here
    document.body.classList.toggle('dark', this.darkModeEnabled);
  }

  onLocationToggle() {
    this.saveSettings();
  }

  clearData() {
    // Clear all app data except auth
    localStorage.removeItem('app_settings');
    this.showToast('App data cleared');
  }

  async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    t.present();
  }
}

