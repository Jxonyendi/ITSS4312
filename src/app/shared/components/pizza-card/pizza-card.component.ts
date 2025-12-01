import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonButton,
} from '@ionic/angular/standalone';

export interface PizzaCardData {
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
  selector: 'app-pizza-card',
  templateUrl: './pizza-card.component.html',
  styleUrls: ['./pizza-card.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonButton,
    CommonModule,
  ],
})
export class PizzaCardComponent {
  @Input() pizza!: PizzaCardData;
  @Input() isSelected = false;
  @Input() showAddButton = false;
  @Output() cardClick = new EventEmitter<PizzaCardData>();
  @Output() addClick = new EventEmitter<PizzaCardData>();

  onCardClick() {
    this.cardClick.emit(this.pizza);
  }

  onAddClick(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.addClick.emit(this.pizza);
  }
}

