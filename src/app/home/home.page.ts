import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';

interface FeaturedPizza {
  id: string;
  name: string;
  description: string;
  crust: string;
  calories: number;
  price: number;
  image: string;
  tag?: string;
}

interface Deal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  badge: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonButtons, CommonModule, CurrencyPipe, ChatWidgetComponent, CartButtonComponent]
})
export class HomePage {
  preview = '';
  
  featuredPizzas: FeaturedPizza[] = [
    {
      id: 'ultimate-pepperoni',
      name: 'Ultimate Pepperoni',
      description: 'Double pepperoni layered edge-to-edge with extra mozzarella.',
      crust: 'Hand Tossed',
      calories: 320,
      price: 14.99,
      image: 'assets/images/pizza/ultimate-pepperoni.jpg',
      tag: 'Fan Favorite',
    },
    {
      id: 'memphis-bbq',
      name: 'Memphis BBQ Chicken',
      description: 'Grilled chicken, smoky BBQ sauce, onions, provolone & cheddar.',
      crust: 'Handmade Pan',
      calories: 310,
      price: 15.49,
      image: 'assets/images/pizza/memphis-bbq.jpg',
      tag: 'Limited Time',
    },
    {
      id: 'extravaganza',
      name: 'ExtravaganZZa',
      description: 'Premium pepperoni, ham, Italian sausage, beef, onions & peppers.',
      crust: 'Crunchy Thin',
      calories: 340,
      price: 16.79,
      image: 'assets/images/pizza/extravaganza.jpg',
    },
  ];

  deals: Deal[] = [
    {
      id: 'family-feast',
      name: 'Family Feast',
      description: '2 Large Pizzas + 2 Sides',
      price: 24.99,
      originalPrice: 32.99,
      badge: 'Limited Time',
    },
    {
      id: 'pizza-wings-combo',
      name: 'Pizza & Wings Combo',
      description: '1 Large Pizza + 10 Wings',
      price: 18.99,
      originalPrice: 24.99,
      badge: 'Popular',
    },
  ];

  constructor(
    private svc: EmergencyService,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    addIcons({
      'checkmark-circle-outline': checkmarkCircleOutline,
      'alert-circle-outline': alertCircleOutline,
    });
  }

  viewPizza(pizza: FeaturedPizza) {
    // Navigate to order page with this pizza selected
    this.router.navigate(['/tabs/order']);
  }

  async sendHelp() {
    const loading = await this.loadingCtrl.create({
      message: 'Placing emergency order...',
    });
    await loading.present();

    try {
      this.preview = 'I need help. Please call me.';
      const result = await this.svc.broadcastToContacts(0);
      await loading.dismiss();
      
      if (result.success) {
        this.showToast(`Emergency order placed! Contacting ${result.sentTo} contact(s).`);
      } else {
        this.showToast(result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      await loading.dismiss();
      this.showToast('Failed to place order. Please try again.');
    }
  }

  async sendOk() {
    const loading = await this.loadingCtrl.create({
      message: 'Placing quick order...',
    });
    await loading.present();

    try {
      this.preview = 'I am okay. No help needed.';
      const result = await this.svc.broadcastToContacts(1);
      await loading.dismiss();
      
      if (result.success) {
        this.showToast(`Quick order sent to ${result.sentTo} contact(s)!`);
      } else {
        this.showToast(result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      await loading.dismiss();
      this.showToast('Failed to place order. Please try again.');
    }
  }

  async orderDeal(deal: Deal) {
    const loading = await this.loadingCtrl.create({
      message: 'Placing order...',
    });
    await loading.present();

    try {
      // Create order with deal information
      const payload = {
        pizzaId: deal.id,
        pizzaName: deal.name,
        pizzaPrice: deal.price,
        note: deal.description,
      };

      await this.svc.placePizzaOrder(payload);
      await loading.dismiss();
      
      this.showToast(`${deal.name} order placed! View in Tracker.`);
      
      // Navigate to tracker to show the order
      this.router.navigate(['/tabs/tracker']);
    } catch (error) {
      await loading.dismiss();
      this.showToast('Failed to place order. Please try again.');
    }
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }
}
