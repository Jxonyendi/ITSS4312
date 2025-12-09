import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { isPlatform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, CartSidebarComponent],
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Check authentication status on app startup
    this.authService.currentUser.subscribe(user => {
      if (!user && this.router.url !== '/login') {
        // Only redirect if not already on login page
        const currentUrl = this.router.url;
        if (currentUrl && !currentUrl.includes('login')) {
          this.router.navigate(['/login']);
        }
      }
    });

    // Handle keyboard events for better UX
    if (isPlatform('mobile') || Capacitor.isNativePlatform()) {
      this.setupKeyboardHandling();
    }

    // Handle orientation changes
    this.setupOrientationHandling();
  }

  private setupKeyboardHandling() {
    // Scroll to focused input when keyboard appears
    // Ionic handles keyboard offset automatically, but we add custom scroll behavior
    window.addEventListener('resize', () => {
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'ION-INPUT' || activeElement.tagName === 'ION-TEXTAREA')) {
          const input = activeElement.closest('ion-item') || activeElement;
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    });
  }

  private setupOrientationHandling() {
    // Add class to body based on orientation
    const updateOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        document.body.classList.remove('landscape');
        document.body.classList.add('portrait');
      } else {
        document.body.classList.remove('portrait');
        document.body.classList.add('landscape');
      }
    };

    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
    updateOrientation(); // Initial call
  }
}
