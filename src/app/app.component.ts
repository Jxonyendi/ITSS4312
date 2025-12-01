import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
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
  }
}
