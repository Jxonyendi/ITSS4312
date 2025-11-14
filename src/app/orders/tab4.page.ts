import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonItem,
  IonLabel,
  IonTextarea,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SpecialtyPizza {
  id: string;
  name: string;
  description: string;
  crust: string;
  calories: number;
  price: number;
  image: string;
  tag?: string;
}

@Component({
  selector: 'app-order',
  templateUrl: 'tab4.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonItem,
    IonLabel,
    IonTextarea,
    CommonModule,
    FormsModule,
  ],
})
export class OrderPage {
  specialtyPizzas: SpecialtyPizza[] = [
    {
      id: 'ultimate-pepperoni',
      name: 'Ultimate Pepperoni',
      description: 'Double pepperoni layered edge-to-edge with extra mozzarella.',
      crust: 'Hand Tossed',
      calories: 320,
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1548365328-9f547b5746ef?auto=format&fit=crop&w=800&q=80',
      tag: 'Fan Favorite',
    },
    {
      id: 'extravaganza',
      name: 'ExtravaganZZa',
      description: 'Premium pepperoni, ham, Italian sausage, beef, onions & peppers.',
      crust: 'Crunchy Thin',
      calories: 340,
      price: 16.79,
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'memphis-bbq',
      name: 'Memphis BBQ Chicken',
      description: 'Grilled chicken, smoky BBQ sauce, onions, provolone & cheddar.',
      crust: 'Handmade Pan',
      calories: 310,
      price: 15.49,
      image: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=800&q=80',
      tag: 'Limited Time',
    },
    {
      id: 'pacific-veggie',
      name: 'Pacific Veggie',
      description: 'Roasted red peppers, onions, spinach, mushrooms, tomatoes & olives.',
      crust: 'Gluten Free',
      calories: 290,
      price: 15.09,
      image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'philly-steak',
      name: 'Philly Cheese Steak',
      description: 'Tender steak, onions, green peppers, mushrooms & provolone.',
      crust: 'Brooklyn Style',
      calories: 330,
      price: 17.29,
      // Use Unsplash source with query to better match a cheesesteak-pizza image
      image: 'https://source.unsplash.com/800x600/?cheesesteak,pizza',
    },
    {
      id: 'deluxe',
      name: 'Deluxe',
      description: 'Pepperoni, Italian sausage, green peppers, mushrooms & onions.',
      crust: 'Hand Tossed',
      calories: 305,
      price: 14.49,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    },
  ];
  selectedPizza: SpecialtyPizza = this.specialtyPizzas[0];
  alias = this.selectedPizza.name;
  note = '';
  lastOrder: any = null;

  constructor(private svc: EmergencyService, private toast: ToastController, private router: Router) {
    const os = this.svc.getOrders();
    this.lastOrder = os.length ? os[0] : null;
    this.svc.orders$.subscribe(o => {
      this.lastOrder = o.length ? o[0] : null;
    });
  }

  selectPizza(pizza: SpecialtyPizza) {
    this.selectedPizza = pizza;
    this.alias = pizza.name;
  }

  /**
   * Quick-add a pizza directly to orders and open the tracker.
   * We accept the DOM event to stop propagation so card click (select) doesn't also fire.
   */
  async addToOrders(pizza: SpecialtyPizza, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const payload = {
      pizzaId: pizza.id,
      pizzaName: pizza.name,
      pizzaImage: pizza.image,
      pizzaPrice: pizza.price,
      note: ''
    };
    const order = await this.svc.placePizzaOrder(payload);
    this.showToast(`${pizza.name} added to orders. Opening tracker...`);
    console.log('Quick-placed pizza order', order);
    this.router.navigate(['/tabs/tracker']);
  }

  async placeOrder() {
    if (!this.selectedPizza) {
      this.showToast('Pick a specialty pizza to continue.');
      return;
    }
    // Place a pizza order with metadata so it appears in the tracker
    const payload = {
      pizzaId: this.selectedPizza.id,
      pizzaName: this.selectedPizza.name,
      pizzaImage: this.selectedPizza.image,
      pizzaPrice: this.selectedPizza.price,
      note: this.note || ''
    };
    const order = await this.svc.placePizzaOrder(payload);
    this.showToast(`${this.selectedPizza.name} added to orders. Opening tracker...`);
    console.log('Placed pizza order', order, 'note:', this.note, 'alias:', this.alias);
    this.note = '';
    // Navigate to tracker tab so user can see the order
    this.router.navigate(['/tabs/tracker']);
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }
}

