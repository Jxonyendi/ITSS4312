import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  pizzaOutline, 
  locateOutline, 
  personCircleOutline, 
  helpCircleOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ 
      'home-outline': homeOutline,
      'pizza-outline': pizzaOutline,
      'locate-outline': locateOutline,
      'person-circle-outline': personCircleOutline,
      'help-circle-outline': helpCircleOutline
    });
  }
}
