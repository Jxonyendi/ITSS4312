import { Component } from '@angular/core';
import { EmergencyService } from '../services/emergency.services';
import { ToastController } from '@ionic/angular';
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
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  chatbubbleOutline,
  callOutline,
  mailOutline,
  helpCircleOutline,
  documentTextOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
} from 'ionicons/icons';

interface SupportOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  actionText: string;
}

interface ContactMethod {
  id: string;
  title: string;
  info: string;
  hours?: string;
  icon: string;
  color: string;
  buttonText: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface SupportRequest {
  ticketId: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'pending';
  date: number;
}

@Component({
  selector: 'app-contact-us',
  templateUrl: 'contact-us.page.html',
  styleUrls: ['contact-us.page.scss'],
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
    IonIcon,
    IonAccordion,
    IonAccordionGroup,
    CommonModule,
    FormsModule,
  ],
})
export class ContactUsPage {
  supportOptions: SupportOption[] = [
    {
      id: 'order-help',
      title: 'Order Support',
      subtitle: 'Track & Manage Orders',
      description: 'Get help with your pizza orders, delivery status, or order modifications.',
      icon: 'document-text-outline',
      actionText: 'Get Help',
    },
    {
      id: 'account-help',
      title: 'Account Issues',
      subtitle: 'Profile & Settings',
      description: 'Need help with your account, payment methods, or profile settings?',
      icon: 'help-circle-outline',
      actionText: 'Contact Us',
    },
    {
      id: 'technical',
      title: 'Technical Support',
      subtitle: 'App & Website',
      description: 'Experiencing technical issues? Our team can help troubleshoot problems.',
      icon: 'chatbubble-outline',
      actionText: 'Report Issue',
    },
  ];

  contactMethods: ContactMethod[] = [
    {
      id: 'phone',
      title: 'Phone Support',
      info: '1-800-PIZZA-01',
      hours: 'Available 24/7',
      icon: 'call-outline',
      color: 'success',
      buttonText: 'Call Now',
    },
    {
      id: 'email',
      title: 'Email Support',
      info: 'support@pizzatime.com',
      hours: 'Response within 2 hours',
      icon: 'mail-outline',
      color: 'primary',
      buttonText: 'Send Email',
    },
    {
      id: 'chat',
      title: 'Live Chat',
      info: 'Instant messaging support',
      hours: 'Mon-Fri: 8AM-10PM EST',
      icon: 'chatbubble-outline',
      color: 'tertiary',
      buttonText: 'Start Chat',
    },
  ];

  faqs: FAQ[] = [
    {
      id: 'faq1',
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time using the Tracker tab. Once your order is placed, you\'ll see live updates on the delivery status and estimated arrival time.',
    },
    {
      id: 'faq2',
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order from the Tracker page as long as it hasn\'t been delivered yet. Simply select your active order and click the cancel button.',
    },
    {
      id: 'faq3',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, PayPal, and Apple Pay. You can manage your payment methods in the Account section.',
    },
    {
      id: 'faq4',
      question: 'How long does delivery take?',
      answer: 'Our standard delivery time is 30-45 minutes. You can see real-time tracking updates in the Tracker tab once your order is on the way.',
    },
    {
      id: 'faq5',
      question: 'What if I have a food allergy?',
      answer: 'Please mention any allergies in the delivery notes when placing your order. You can also contact us directly for detailed ingredient information.',
    },
  ];

  supportHistory: SupportRequest[] = [
    {
      ticketId: 'TKT-2024-001',
      subject: 'Order Delivery Delay',
      message: 'My order was supposed to arrive 30 minutes ago. Can you check the status?',
      status: 'resolved',
      date: Date.now() - 86400000, // 1 day ago
    },
    {
      ticketId: 'TKT-2024-002',
      subject: 'Payment Method Update',
      message: 'I need to update my credit card information on file.',
      status: 'resolved',
      date: Date.now() - 172800000, // 2 days ago
    },
    {
      ticketId: 'TKT-2024-003',
      subject: 'App Not Loading',
      message: 'The app crashes when I try to view my order history.',
      status: 'pending',
      date: Date.now() - 3600000, // 1 hour ago
    },
  ];

  selectedOption: SupportOption | null = null;
  supportMessage: string = '';

  constructor(private svc: EmergencyService, private toast: ToastController) {
    addIcons({
      'chatbubble-outline': chatbubbleOutline,
      'call-outline': callOutline,
      'mail-outline': mailOutline,
      'help-circle-outline': helpCircleOutline,
      'document-text-outline': documentTextOutline,
      'time-outline': timeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'hourglass-outline': hourglassOutline,
    });
  }

  selectSupportOption(option: SupportOption) {
    this.selectedOption = option;
    if (!this.supportMessage) {
      this.supportMessage = `I need help with: ${option.title}. `;
    }
  }

  handleSupportAction(option: SupportOption, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectSupportOption(option);
  }

  handleContactMethod(method: ContactMethod) {
    let message = '';
    switch (method.id) {
      case 'phone':
        message = `Calling ${method.info}... (Mock)`;
        break;
      case 'email':
        message = `Opening email client for ${method.info}... (Mock)`;
        break;
      case 'chat':
        message = 'Starting live chat... (Mock)';
        break;
    }
    this.showToast(message);
  }

  async sendSupport() {
    if (!this.selectedOption) {
      this.showToast('Please select a support option first.');
      return;
    }

    const cs = this.svc.contacts$.value;
    if (!cs.length) {
      this.showToast('No contacts saved yet. Add one in Account.');
      return;
    }

    const message = this.supportMessage || `Support request: ${this.selectedOption.title} - This is a test from Pizza Time (mock).`;
    await this.svc.sendMockSms(cs[0].phone, message);

    // Add to support history
    const newRequest: SupportRequest = {
      ticketId: `TKT-2024-${String(this.supportHistory.length + 1).padStart(3, '0')}`,
      subject: this.selectedOption.title,
      message: this.supportMessage || 'Support request sent',
      status: 'pending',
      date: Date.now(),
    };
    this.supportHistory.unshift(newRequest);

    this.showToast('Support message sent successfully! (Mock)');
    this.supportMessage = '';
    this.selectedOption = null;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'open':
        return 'primary';
      default:
        return 'medium';
    }
  }

  async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 2000 });
    t.present();
  }
}
