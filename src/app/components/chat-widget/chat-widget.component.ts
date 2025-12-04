import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonTextarea,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  chatbubbleOutline,
  closeOutline,
  sendOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonItem,
    IonTextarea,
    CommonModule,
    FormsModule,
  ],
})
export class ChatWidgetComponent implements OnInit {
  isChatOpen = false;
  chatMessages: ChatMessage[] = [];
  currentMessage = '';
  isSendingMessage = false;

  constructor(private chatService: ChatService) {
    addIcons({
      'chatbubble-outline': chatbubbleOutline,
      'close-outline': closeOutline,
      'send-outline': sendOutline,
    });
  }

  ngOnInit() {
    this.chatMessages = this.chatService.getChatHistory();
  }

  openChat() {
    this.isChatOpen = true;
    this.chatMessages = this.chatService.getChatHistory();
    setTimeout(() => {
      this.scrollChatToBottom();
    }, 100);
  }

  closeChat() {
    this.isChatOpen = false;
  }

  async sendChatMessage() {
    if (!this.currentMessage.trim() || this.isSendingMessage) {
      return;
    }
    const userMessage = this.currentMessage.trim();
    this.currentMessage = '';
    this.isSendingMessage = true;

    this.scrollChatToBottom();

    try {
      await this.chatService.sendMessage(userMessage);
      this.chatMessages = this.chatService.getChatHistory();
      setTimeout(() => {
        this.scrollChatToBottom();
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      this.chatMessages = this.chatService.getChatHistory();
    } finally {
      this.isSendingMessage = false;
    }
  }

  scrollChatToBottom() {
    const chatMessagesEl = document.querySelector('.chat-messages');
    if (chatMessagesEl) {
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
  }

  formatMessageContent(content: string): string {
    // Convert bold markdown to HTML
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert numbered lists
    formattedContent = formattedContent.replace(/(\d+\.\s.*?(?:\n(?!\d+\.).*?)*)/g, (match) => {
      const items = match.split('\n').map(item => item.trim()).filter(item => item.length > 0);
      return '<ul>' + items.map(item => `<li>${item.replace(/^\d+\.\s/, '')}</li>`).join('') + '</ul>';
    });
    // Convert newlines to <br> for basic line breaks
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    return formattedContent;
  }

  formatChatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

