import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatHistory: ChatMessage[] = [];

  constructor(private apiService: ApiService) {
    // Initialize with a welcome message
    this.chatHistory = [{
      role: 'assistant',
      content: 'Hello! I\'m here to help you with Pizza Time. How can I assist you today?',
      timestamp: Date.now()
    }];
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      });

      // Build conversation history for backend (last 10 messages for context)
      const recentHistory = this.chatHistory.slice(-10);

      // Call backend API which proxies to Gemini
      const response = await firstValueFrom(
        this.apiService.post<any>('chat/message', {
          message: userMessage,
          history: recentHistory.map(msg => ({ role: msg.role, content: msg.content }))
        })
      );

      console.log('Chat API Response:', response);

      if (response.success) {
        // Backend returns { success: true, data: { message: "..." }, message: "..." }
        // But ApiService wraps it, so check both locations
        const assistantMessage = (response.data as any)?.message || (response as any).message || response.data;
        
        if (!assistantMessage || typeof assistantMessage !== 'string') {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format from chat API');
        }

        // Add assistant response to history
        this.chatHistory.push({
          role: 'assistant',
          content: assistantMessage,
          timestamp: Date.now()
        });

        return assistantMessage;
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat API error:', error);
      const errorMessage = error?.error?.message || error?.message || 'Sorry, I encountered an error. Please try again or contact support via email.';
      
      // Add error message to history
      this.chatHistory.push({
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      });

      return errorMessage;
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory(): void {
    this.chatHistory = [{
      role: 'assistant',
      content: 'Hello! I\'m here to help you with Pizza Time. How can I assist you today?',
      timestamp: Date.now()
    }];
  }
}

