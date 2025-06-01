// components/chat/TravelChat.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  Loader2,
  RefreshCw,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import { ChatService, ChatMessage, ChatSession } from '@/services/chatService';

interface TravelChatProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const TravelChat: React.FC<TravelChatProps> = ({ 
  isOpen: externalIsOpen, 
  onToggle,
  className = ""
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine if chat is open based on external prop or internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleChat = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Load session on mount
  useEffect(() => {
    if (isOpen && !currentSession) {
      // Migrate old sessions to user-specific format
      ChatService.migrateToUserSpecificSessions();
      initializeChat();
    }
  }, [isOpen]);

  // Reset chat when user changes
  useEffect(() => {
    const handleUserChange = () => {
      // Clear current session and reload
      setCurrentSession(null);
      setMessages([]);
      setCurrentResponse('');
      setError(null);
      
      if (isOpen) {
        ChatService.migrateToUserSpecificSessions();
        initializeChat();
      }
    };

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') {
        handleUserChange();
      }
    });

    // Check for user changes on component mount/update
    const checkUserChange = () => {
      const currentUser = localStorage.getItem('user');
      const userId = currentUser ? JSON.parse(currentUser).id || JSON.parse(currentUser).username : null;
      
      // Store last known user to detect changes
      if (ChatService.getLastKnownUserId() !== userId) {
        ChatService.setLastKnownUserId(userId);
        handleUserChange();
      }
    };

    checkUserChange();
    const interval = setInterval(checkUserChange, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleUserChange);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load last session from local storage
      const sessions = ChatService.getLocalSessions();
      const lastSession = sessions[sessions.length - 1];
      
      if (lastSession && lastSession.messages.length > 0) {
        setCurrentSession(lastSession);
        setMessages(lastSession.messages);
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Không thể khởi tạo chat. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = await ChatService.createNewSession();
      const newSession: ChatSession = {
        session_id: sessionId,
        messages: []
      };
      
      setCurrentSession(newSession);
      setMessages([]);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý du lịch AI của TravelSense. Tôi có thể giúp bạn:\n\n• Lên kế hoạch chuyến đi\n• Tìm kiếm địa điểm du lịch\n• Gợi ý lịch trình\n• Ước tính chi phí\n• Thông tin về thời tiết\n\nBạn muốn đi du lịch ở đâu?',
        timestamp: new Date()
      };
      
      const updatedMessages = [welcomeMessage];
      setMessages(updatedMessages);
      
      // Save to local storage
      const updatedSession = { ...newSession, messages: updatedMessages };
      ChatService.saveSessionToLocal(updatedSession);
      setCurrentSession(updatedSession);
      
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Không thể tạo phiên chat mới. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);
    setCurrentResponse('');
    setError(null);

    // Save user message
    const updatedSession = { ...currentSession, messages: updatedMessages };
    setCurrentSession(updatedSession);
    ChatService.saveSessionToLocal(updatedSession);

    try {
      let fullResponse = '';
      const assistantMessageId = `msg_${Date.now() + 1}`;

      await ChatService.sendMessage(
        currentSession.session_id,
        userMessage.content,
        // onChunk
        (chunk: string) => {
          fullResponse += chunk;
          setCurrentResponse(fullResponse);
        },
        // onComplete
        () => {
          setIsTyping(false);
          setCurrentResponse('');
          
          // Add assistant message
          const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date()
          };
          
          const finalMessages = [...updatedMessages, assistantMessage];
          setMessages(finalMessages);
          
          // Save complete session
          const finalSession = { ...currentSession, messages: finalMessages };
          setCurrentSession(finalSession);
          ChatService.saveSessionToLocal(finalSession);
          
          // Save assistant message to backend
          ChatService.saveMessage(currentSession.session_id, 'assistant', fullResponse);
        },
        // onError
        (error: Error) => {
          setIsTyping(false);
          setCurrentResponse('');
          setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
          console.error('Error in sendMessage:', error);
        }
      );
    } catch (error) {
      setIsTyping(false);
      setCurrentResponse('');
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
      console.error('Error in sendMessage:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentResponse('');
    setError(null);
    if (currentSession) {
      const clearedSession = { ...currentSession, messages: [] };
      setCurrentSession(clearedSession);
      ChatService.saveSessionToLocal(clearedSession);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/• (.*?)(<br\/|$)/g, '<span class="ml-2">• $1</span>$2');
  };

  const getQuickActions = () => [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: "Tìm địa điểm",
      action: () => setInputMessage("Gợi ý cho tôi những địa điểm du lịch nổi tiếng ở Việt Nam")
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Lập lịch trình",
      action: () => setInputMessage("Giúp tôi lập lịch trình du lịch 3 ngày 2 đêm")
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: "Ước tính chi phí",
      action: () => setInputMessage("Ước tính chi phí cho chuyến đi du lịch")
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Du lịch gia đình",
      action: () => setInputMessage("Gợi ý địa điểm phù hợp cho gia đình có trẻ em")
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${className}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96 md:h-[500px]'} w-80 md:w-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Trợ lý Du lịch AI</h3>
            <p className="text-xs opacity-90">
              {isTyping ? 'Đang trả lời...' : 'Sẵn sàng hỗ trợ'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={createNewSession}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={clearChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80 md:h-96">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-600 ml-2' : 'bg-gray-200 mr-2'}`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                        <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-[80%]">
                        {currentResponse ? (
                          <div 
                            className="text-sm text-gray-800 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatMessage(currentResponse) }}
                          />
                        ) : (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Quick actions */}
                {messages.length <= 1 && !isTyping && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {getQuickActions().map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="flex items-center space-x-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        {action.icon}
                        <span className="text-xs">{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về địa điểm du lịch, lịch trình..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isTyping || isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping || isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};