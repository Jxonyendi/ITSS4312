import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { CartService } from '../services/cart.service';
import { ToastController } from '@ionic/angular/standalone';
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
  IonNote,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircleOutline, 
  constructOutline,
} from 'ionicons/icons';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';

interface SpecialtyPizza {
  id: string;
  name: string;
  description: string;
  crust: string;
  calories: number;
  price: number;
  image: string;
  tag?: string;
  tagPosition?: 'left' | 'right';
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
    IonNote,
    IonIcon,
    IonButtons,
    CommonModule,
    FormsModule,
    CurrencyPipe,
    ChatWidgetComponent,
    CartButtonComponent,
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
      image: 'assets/images/pizza/ultimate-pepperoni.jpg',
      tag: 'Fan Favorite',
      tagPosition: 'left',
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
    {
      id: 'memphis-bbq',
      name: 'Memphis BBQ Chicken',
      description: 'Grilled chicken, smoky BBQ sauce, onions, provolone & cheddar.',
      crust: 'Handmade Pan',
      calories: 310,
      price: 15.49,
      image: 'assets/images/pizza/memphis-bbq.jpg',
      tag: 'Limited Time',
      tagPosition: 'right',
    },
    {
      id: 'pacific-veggie',
      name: 'Pacific Veggie',
      description: 'Roasted red peppers, onions, spinach, mushrooms, tomatoes & olives.',
      crust: 'Gluten Free',
      calories: 290,
      price: 15.09,
      image: 'assets/images/pizza/pacific-veggie.jpg',
    },
    {
      id: 'philly-steak',
      name: 'Philly Cheese Steak',
      description: 'Tender steak, onions, green peppers, mushrooms & provolone.',
      crust: 'Brooklyn Style',
      calories: 330,
      price: 17.29,
      image: 'assets/images/pizza/philly-steak.jpg',
    },
    {
      id: 'deluxe',
      name: 'Deluxe',
      description: 'Pepperoni, Italian sausage, green peppers, mushrooms & onions.',
      crust: 'Hand Tossed',
      calories: 305,
      price: 14.49,
      image: 'assets/images/pizza/deluxe.jpg',
    },
  ];
  selectedPizza: SpecialtyPizza = this.specialtyPizzas[0];
  alias = this.selectedPizza.name;
  note = '';
  maxNoteLength = 200;
  lastOrder: any = null;

  constructor(
    private svc: EmergencyService,
    private cartService: CartService,
    private toast: ToastController, 
    private router: Router
  ) {
    addIcons({
      'checkmark-circle-outline': checkmarkCircleOutline,
      'construct-outline': constructOutline,
    });
    
    const os = this.svc.getOrders();
    this.lastOrder = os.length ? os[0] : null;
    this.svc.orders$.subscribe(o => {
      this.lastOrder = o.length ? o[0] : null;
    });
  }

  selectPizza(pizza: SpecialtyPizza) {
    this.selectedPizza = pizza;
    this.alias = pizza.name;
    // Scroll to order panel
    setTimeout(() => {
      const panel = document.querySelector('.order-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Quick-add a pizza to cart.
   * We accept the DOM event to stop propagation so card click (select) doesn't also fire.
   */
  async addToOrders(pizza: SpecialtyPizza, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.cartService.addToCart({
      pizzaId: pizza.id,
      pizzaName: pizza.name,
      pizzaImage: pizza.image,
      pizzaPrice: pizza.price,
      note: ''
    });
    this.showToast(`${pizza.name} added to cart`);
  }

  async placeOrder() {
    if (!this.selectedPizza) {
      this.showToast('Pick a specialty pizza to continue.');
      return;
    }
    
    // Validate note length
    if (this.note && this.note.length > this.maxNoteLength) {
      this.showToast(`Delivery note must be ${this.maxNoteLength} characters or less.`);
      return;
    }
    
    // Add pizza to cart
    this.cartService.addToCart({
      pizzaId: this.selectedPizza.id,
      pizzaName: this.selectedPizza.name,
      pizzaImage: this.selectedPizza.image,
      pizzaPrice: this.selectedPizza.price,
      note: (this.note || '').trim()
    });
    this.showToast(`${this.selectedPizza.name} added to cart`);
    this.note = '';
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }

  openBuildPizzaModal() {
    this.router.navigate(['/tabs/order/build-pizza']);
  }
}

