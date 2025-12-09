import { Component } from '@angular/core';
import { EmergencyService } from '../../services/emergency.services';
import { CartService } from '../../services/cart.service';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircleOutline,
  resizeOutline,
  restaurantOutline,
  waterOutline,
  layersOutline,
  nutritionOutline,
  leafOutline,
  starOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { CartButtonComponent } from '../../components/cart-button/cart-button.component';
import { SettingsButtonComponent } from '../../components/settings-button/settings-button.component';
import { AddressDisplayComponent } from '../../components/address-display/address-display.component';

interface PizzaOption {
  id: string;
  name: string;
  price?: number;
}

interface PizzaCustomization {
  crust: string;
  size: string;
  sauce: string;
  cheese: string;
  toppings: string[];
}

@Component({
  selector: 'app-build-pizza',
  templateUrl: 'build-pizza.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    CurrencyPipe,
    CartButtonComponent,
    SettingsButtonComponent,
    AddressDisplayComponent,
  ],
})
export class BuildPizzaPage {
  // Pizza customization options
  sizes: PizzaOption[] = [
    { id: 'small', name: 'Small (10")', price: 8.99 },
    { id: 'medium', name: 'Medium (12")', price: 11.99 },
    { id: 'large', name: 'Large (14")', price: 14.99 },
    { id: 'xlarge', name: 'X-Large (16")', price: 17.99 },
  ];

  crusts: PizzaOption[] = [
    { id: 'hand-tossed', name: 'Hand Tossed' },
    { id: 'thin-crust', name: 'Thin Crust' },
    { id: 'pan', name: 'Pan' },
    { id: 'gluten-free', name: 'Gluten Free' },
    { id: 'brooklyn', name: 'Brooklyn Style' },
  ];

  sauces: PizzaOption[] = [
    { id: 'marinara', name: 'Classic Marinara' },
    { id: 'white', name: 'White Sauce' },
    { id: 'bbq', name: 'BBQ Sauce' },
    { id: 'none', name: 'No Sauce' },
  ];

  cheeses: PizzaOption[] = [
    { id: 'regular', name: 'Regular Mozzarella' },
    { id: 'extra', name: 'Extra Cheese' },
    { id: 'light', name: 'Light Cheese' },
    { id: 'none', name: 'No Cheese' },
  ];

  meatToppings: PizzaOption[] = [
    { id: 'pepperoni', name: 'Pepperoni', price: 1.50 },
    { id: 'italian-sausage', name: 'Italian Sausage', price: 1.75 },
    { id: 'ham', name: 'Ham', price: 1.50 },
    { id: 'bacon', name: 'Bacon', price: 1.75 },
    { id: 'chicken', name: 'Chicken', price: 2.00 },
    { id: 'beef', name: 'Beef', price: 1.75 },
  ];

  veggieToppings: PizzaOption[] = [
    { id: 'mushrooms', name: 'Mushrooms', price: 1.00 },
    { id: 'onions', name: 'Onions', price: 0.75 },
    { id: 'green-peppers', name: 'Green Peppers', price: 0.75 },
    { id: 'black-olives', name: 'Black Olives', price: 1.00 },
    { id: 'tomatoes', name: 'Tomatoes', price: 0.75 },
    { id: 'spinach', name: 'Spinach', price: 1.00 },
    { id: 'jalapenos', name: 'Jalapeños', price: 0.75 },
  ];

  premiumToppings: PizzaOption[] = [
    { id: 'extra-cheese', name: 'Extra Cheese', price: 1.50 },
    { id: 'feta', name: 'Feta', price: 1.75 },
    { id: 'provolone', name: 'Provolone', price: 1.50 },
  ];

  // Selected customization
  selectedSize: string = 'medium';
  selectedCrust: string = 'hand-tossed';
  selectedSauce: string = 'marinara';
  selectedCheese: string = 'regular';
  selectedToppings: string[] = [];

  constructor(
    private svc: EmergencyService,
    private cartService: CartService,
    private toast: ToastController,
    private router: Router
  ) {
    addIcons({
      'checkmark-circle-outline': checkmarkCircleOutline,
      'resize-outline': resizeOutline,
      'restaurant-outline': restaurantOutline,
      'water-outline': waterOutline,
      'layers-outline': layersOutline,
      'nutrition-outline': nutritionOutline,
      'leaf-outline': leafOutline,
      'star-outline': starOutline,
      'arrow-back-outline': arrowBackOutline,
    });
  }

  // Get base price for selected size
  getBasePrice(): number {
    const size = this.sizes.find(s => s.id === this.selectedSize);
    return size?.price || 11.99;
  }

  // Get total price including toppings
  getTotalPrice(): number {
    let total = this.getBasePrice();
    
    // Add topping prices
    const allToppings = this.getAllToppings();
    this.selectedToppings.forEach(toppingId => {
      const topping = allToppings.find(t => t.id === toppingId);
      if (topping?.price) {
        total += topping.price;
      }
    });

    return total;
  }


  // Get all toppings combined
  getAllToppings(): PizzaOption[] {
    return [...this.meatToppings, ...this.veggieToppings, ...this.premiumToppings];
  }

  // Get topping name by ID
  getToppingName(toppingId: string): string {
    const allToppings = this.getAllToppings();
    return allToppings.find(t => t.id === toppingId)?.name || toppingId;
  }

  // Get all selected toppings as formatted string
  getSelectedToppingsString(): string {
    if (this.selectedToppings.length === 0) {
      return 'None';
    }
    return this.selectedToppings.map(id => this.getToppingName(id)).join(', ');
  }

  // Helper methods for template
  getSelectedSizeName(): string {
    return this.sizes.find(s => s.id === this.selectedSize)?.name || '';
  }

  getSelectedCrustName(): string {
    return this.crusts.find(c => c.id === this.selectedCrust)?.name || '';
  }

  getSelectedSauceName(): string {
    return this.sauces.find(s => s.id === this.selectedSauce)?.name || '';
  }

  getSelectedCheeseName(): string {
    return this.cheeses.find(c => c.id === this.selectedCheese)?.name || '';
  }

  // Add custom pizza to cart
  async addCustomPizzaToOrder() {
    const customization = {
      size: this.sizes.find(s => s.id === this.selectedSize)?.name || this.selectedSize,
      crust: this.crusts.find(c => c.id === this.selectedCrust)?.name || this.selectedCrust,
      sauce: this.sauces.find(s => s.id === this.selectedSauce)?.name || this.selectedSauce,
      cheese: this.cheeses.find(c => c.id === this.selectedCheese)?.name || this.selectedCheese,
      toppings: this.selectedToppings.map(id => this.getToppingName(id)),
    };

    // Format customization details for display
    const customizationNote = `Custom Pizza: ${customization.size}, ${customization.crust}, ${customization.sauce}, ${customization.cheese}${customization.toppings.length > 0 ? ', Toppings: ' + customization.toppings.join(', ') : ''}`;

    this.cartService.addToCart({
      pizzaId: 'custom',
      pizzaName: 'Custom Pizza',
      pizzaImage: 'assets/images/pizza/deluxe.jpg',
      pizzaPrice: this.getTotalPrice(),
      customization: customization,
      note: customizationNote,
    });

    this.showToast('Custom pizza added to cart');
  }

  async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 2000 });
    t.present();
  }
}

