// services/chatService.ts
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'travel';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
}

export class ChatService {
  private static readonly BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8089';
  private static lastKnownUserId: string | null = null;
  
  // Tạo session chat mới
  static async createNewSession(): Promise<string> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/v1/chat/_new_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create chat session: ${response.status}`);
      }

      const data = await response.json();
      return data.data.session_id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  // Gửi message và nhận streaming response từ Gemini
  static async sendMessage(
    sessionId: string, 
    content: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/v1/chat/_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          content: content
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      // Handle streaming response từ Gemini
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Xử lý từng data chunk
        const dataChunks = buffer.split('data:');
        
        // Giữ lại phần cuối chưa hoàn chỉnh
        buffer = dataChunks.pop() || '';
        
        // Xử lý các chunk hoàn chỉnh
        for (const dataChunk of dataChunks) {
          if (dataChunk.trim()) {
            this.processGeminiChunk(dataChunk.trim(), onChunk);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  // Xử lý chunk response từ Gemini
  private static processGeminiChunk(dataStr: string, onChunk: (chunk: string) => void): void {
    // Remove any leading/trailing data: prefixes
    const cleanedData = dataStr.replace(/^data:\s*/, '').replace(/data:\s*$/, '').trim();
    
    if (!cleanedData || cleanedData === 'data:' || cleanedData === '') {
      return;
    }

    try {
      const parsed = JSON.parse(cleanedData);
      
      // Kiểm tra format response từ backend của bạn
      if (parsed.data && typeof parsed.data === 'string') {
        // Format: {"message": "", "code": 0, "data": "content"}
        onChunk(parsed.data);
      } else if (parsed.content) {
        // Format backup: {"content": "..."}
        onChunk(parsed.content);
      } else if (parsed.text) {
        // Format backup: {"text": "..."}
        onChunk(parsed.text);
      } else if (typeof parsed === 'string') {
        // Nếu parsed result là string
        onChunk(parsed);
      } else {
        console.log('Unknown Gemini chunk format:', parsed);
      }
    } catch (e) {
      // Nếu không parse được JSON, có thể là plain text
      if (cleanedData && cleanedData !== 'null' && cleanedData !== 'undefined') {
        console.log('Non-JSON chunk, treating as text:', cleanedData);
        onChunk(cleanedData);
      }
    }
  }

  // Lưu message history
  static async saveMessage(sessionId: string, role: string, content: string): Promise<void> {
    try {
      await fetch(`${this.BACKEND_URL}/api/v1/chat/_save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          role: role,
          content: content
        }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't throw here as this is not critical
    }
  }

  // Local storage helpers với user-specific keys
  static saveSessionToLocal(session: ChatSession): void {
    try {
      const userId = this.getCurrentUserId();
      const sessions = this.getLocalSessions();
      const existingIndex = sessions.findIndex(s => s.session_id === session.session_id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      // Keep only last 10 sessions per user
      if (sessions.length > 10) {
        sessions.splice(0, sessions.length - 10);
      }
      
      const storageKey = userId ? `chat_sessions_${userId}` : 'chat_sessions';
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session to local storage:', error);
    }
  }

  static getLocalSessions(): ChatSession[] {
    try {
      const userId = this.getCurrentUserId();
      const storageKey = userId ? `chat_sessions_${userId}` : 'chat_sessions';
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: ChatSession) => ({
        ...session,
        messages: session.messages.map((message: ChatMessage) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading sessions from local storage:', error);
      return [];
    }
  }

  static getLocalSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getLocalSessions();
      const session = sessions.find(s => s.session_id === sessionId);
      if (!session) return null;
      
      return {
        ...session,
        messages: session.messages.map((message: ChatMessage) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error getting session from local storage:', error);
      return null;
    }
  }

  static clearLocalSessions(): void {
    try {
      const userId = this.getCurrentUserId();
      const storageKey = userId ? `chat_sessions_${userId}` : 'chat_sessions';
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing local sessions:', error);
    }
  }

  // Helper method để lấy current user ID
  private static getCurrentUserId(): string | null {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData.username || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  // Method để clear sessions khi logout
  static clearAllUserSessions(): void {
    try {
      // Clear current user sessions
      this.clearLocalSessions();
      
      // Optionally clean up orphaned sessions
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chat_sessions_')) {
          // You might want to keep these or implement a cleanup strategy
          // localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all user sessions:', error);
    }
  }

  // Method để migrate từ old format sang user-specific format
  static migrateToUserSpecificSessions(): void {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return;

      const oldSessions = localStorage.getItem('chat_sessions');
      const newStorageKey = `chat_sessions_${userId}`;
      
      if (oldSessions && !localStorage.getItem(newStorageKey)) {
        // Migrate old sessions to current user
        localStorage.setItem(newStorageKey, oldSessions);
        localStorage.removeItem('chat_sessions');
      }
    } catch (error) {
      console.error('Error migrating sessions:', error);
    }
  }

  // Getter và setter cho lastKnownUserId
  static getLastKnownUserId(): string | null {
    return this.lastKnownUserId;
  }

  static setLastKnownUserId(userId: string | null): void {
    this.lastKnownUserId = userId;
  }
}