import { Component, OnInit } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { CartService } from '../services/cart.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonButtons, IonModal, IonInput } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { bagOutline, carOutline } from 'ionicons/icons';
import { ChatWidgetComponent } from '../components/chat-widget/chat-widget.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';
import { SettingsButtonComponent } from '../components/settings-button/settings-button.component';
import { AddressDisplayComponent } from '../components/address-display/address-display.component';

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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonTextarea, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonButtons, IonModal, IonInput, CommonModule, FormsModule, CurrencyPipe, ChatWidgetComponent, CartButtonComponent, SettingsButtonComponent, AddressDisplayComponent]
})
export class HomePage implements OnInit {
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
    private cartService: CartService,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    addIcons({
      'bag-outline': bagOutline,
      'car-outline': carOutline,
    });
  }

  deliveryType: 'carry' | 'delivery' | null = null;
  isAddressModalOpen = false;
  selectedDeliveryType: 'carry' | 'delivery' | null = null;
  addressForm = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    apt: '',
    instructions: ''
  };

  ngOnInit() {
    this.loadDeliveryType();
    this.loadAddress();
  }

  loadDeliveryType() {
    this.deliveryType = this.cartService.getDeliveryType();
  }

  loadAddress() {
    const savedAddress = this.cartService.getAddress();
    if (savedAddress) {
      this.addressForm = {
        street: savedAddress.street || '',
        city: savedAddress.city || '',
        state: savedAddress.state || '',
        zipCode: savedAddress.zipCode || '',
        apt: savedAddress.apt || '',
        instructions: savedAddress.instructions || ''
      };
    }
  }

  saveDeliveryType(type: 'carry' | 'delivery') {
    this.cartService.setDeliveryType(type);
    this.deliveryType = type;
  }

  viewPizza(pizza: FeaturedPizza) {
    // Navigate to order page with this pizza selected
    this.router.navigate(['/tabs/order']);
  }

  addFeaturedPizzaToCart(pizza: FeaturedPizza, event?: Event) {
    if (event) {
      event.stopPropagation(); // Prevent card click from firing
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

  selectCarry() {
    this.selectedDeliveryType = 'carry';
    this.isAddressModalOpen = true;
  }

  selectDelivery() {
    this.selectedDeliveryType = 'delivery';
    this.isAddressModalOpen = true;
  }

  closeAddressModal() {
    this.isAddressModalOpen = false;
    // Reset form if cancelled
    if (!this.deliveryType) {
      this.addressForm = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        apt: '',
        instructions: ''
      };
    }
  }

  isAddressFormValid(): boolean {
    return !!(
      this.addressForm.street?.trim() &&
      this.addressForm.city?.trim() &&
      this.addressForm.state?.trim() &&
      this.addressForm.zipCode?.trim()
    );
  }

  continueToOrder() {
    if (!this.isAddressFormValid()) {
      this.showToast('Please fill in all required fields');
      return;
    }

    if (!this.selectedDeliveryType) {
      this.showToast('Please select a delivery type');
      return;
    }

    // Save delivery type and address
    this.saveDeliveryType(this.selectedDeliveryType);
    this.cartService.setAddress(this.addressForm);

    // Close modal and navigate to order page
    this.isAddressModalOpen = false;
    this.router.navigate(['/tabs/order']);
    
    const typeText = this.selectedDeliveryType === 'carry' ? 'Carry-out' : 'Delivery';
    this.showToast(`${typeText} address saved!`);
  }

  addDealToCart(deal: Deal) {
    this.cartService.addToCart({
        pizzaId: deal.id,
        pizzaName: deal.name,
        pizzaPrice: deal.price,
        note: deal.description,
    });
    this.showToast(`${deal.name} added to cart`);
  }

  async showToast(msg:string) {
    const t = await this.toast.create({message: msg, duration: 2000});
    t.present();
  }
}
