// app/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User,
  Loader2,
  RefreshCw,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Users, 
  Sparkles
} from 'lucide-react';
import { ChatService, ChatMessage, ChatSession } from '@/services/chatService';
import SharedLayout from '@/app/components/layout/SharedLayout';

export default function ChatPage() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Load sessions and initialize chat on mount
  useEffect(() => {
    // Migrate old sessions to user-specific format
    ChatService.migrateToUserSpecificSessions();
    loadSessions();
    initializeChat();
  }, []);

  // Reset chat when user changes
  useEffect(() => {
    const handleUserChange = () => {
      // Clear current state
      setCurrentSession(null);
      setMessages([]);
      setCurrentResponse('');
      setError(null);
      setSessions([]);
      
      // Reload for new user
      ChatService.migrateToUserSpecificSessions();
      loadSessions();
      initializeChat();
    };

    // Listen for storage changes (when user logs in/out)
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') {
        handleUserChange();
      }
    });

    // Check for user changes periodically
    const checkUserChange = () => {
      const currentUser = localStorage.getItem('user');
      const userId = currentUser ? JSON.parse(currentUser).id || JSON.parse(currentUser).username : null;
      
      // Store last known user to detect changes
      if (ChatService.getLastKnownUserId() !== userId) {
        ChatService.setLastKnownUserId(userId);
        handleUserChange();
      }
    };

    const interval = setInterval(checkUserChange, 1000);

    return () => {
      window.removeEventListener('storage', handleUserChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const loadSessions = () => {
    const localSessions = ChatService.getLocalSessions();
    setSessions(localSessions);
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load last session from local storage
      const localSessions = ChatService.getLocalSessions();
      const lastSession = localSessions[localSessions.length - 1];
      
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
        content: `Xin chào! Tôi là trợ lý du lịch AI của TravelSense. 🌟

Tôi có thể giúp bạn:

**🗺️ Lên kế hoạch chuyến đi**
- Gợi ý lịch trình chi tiết
- Tìm kiếm địa điểm du lịch
- Đặt lịch theo sở thích

**💰 Quản lý ngân sách**
- Ước tính chi phí chuyến đi
- Gợi ý tiết kiệm chi phí
- So sánh giá cả

**🌤️ Thông tin hữu ích**
- Thời tiết địa phương
- Văn hóa và phong tục
- Giao thông và di chuyển

**👥 Tùy chỉnh theo nhóm**
- Du lịch gia đình
- Du lịch cặp đôi
- Du lịch một mình

Hãy bắt đầu bằng cách cho tôi biết bạn muốn đi đâu nhé! 🚀`,
        timestamp: new Date()
      };
      
      const updatedMessages = [welcomeMessage];
      setMessages(updatedMessages);
      
      // Save to local storage
      const updatedSession = { ...newSession, messages: updatedMessages };
      ChatService.saveSessionToLocal(updatedSession);
      setCurrentSession(updatedSession);
      loadSessions();
      
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
    loadSessions();

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
          loadSessions();
          
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

  const switchSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setCurrentResponse('');
    setError(null);
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentResponse('');
    setError(null);
    if (currentSession) {
      const clearedSession = { ...currentSession, messages: [] };
      setCurrentSession(clearedSession);
      ChatService.saveSessionToLocal(clearedSession);
      loadSessions();
    }
  };

  const clearAllSessions = () => {
    ChatService.clearLocalSessions();
    setSessions([]);
    createNewSession();
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/🌟|⭐|✨|🚀|🗺️|💰|🌤️|👥/g, '<span class="text-lg">$&</span>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/• (.*?)(<br\/>|$)/g, '<div class="ml-4 mb-1">• $1</div>');
  };

  const getQuickActions = () => [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Tìm địa điểm nổi tiếng",
      message: "Gợi ý cho tôi những địa điểm du lịch nổi tiếng nhất ở Việt Nam"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Lập lịch trình 3 ngày",
      message: "Giúp tôi lập lịch trình du lịch 3 ngày 2 đêm ở Đà Nẵng"
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Ước tính chi phí",
      message: "Ước tính chi phí cho chuyến đi du lịch Phú Quốc 4 ngày cho 2 người"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Du lịch gia đình",
      message: "Gợi ý địa điểm và hoạt động phù hợp cho gia đình có trẻ em ở Hà Nội"
    }
  ];

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Trợ lý Du lịch AI</h1>
                    <p className="text-sm text-gray-500">
                      {isTyping ? 'Đang trả lời...' : 'Sẵn sàng hỗ trợ bạn'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={createNewSession}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Chat mới</span>
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Xóa chat hiện tại"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex h-[calc(100vh-8rem)]">
          {/* Sidebar - Chat History */}
          <div className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Lịch sử chat</h2>
                <button
                  onClick={clearAllSessions}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-2">
                {sessions.map((session, index) => (
                  <button
                    key={session.session_id}
                    onClick={() => switchSession(session)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentSession?.session_id === session.session_id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      Chat #{sessions.length - index}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {session.messages.length} tin nhắn
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Đang khởi tạo chat...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-4xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-4`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-blue-600 ml-4' 
                            : 'bg-gradient-to-br from-purple-500 to-blue-600 mr-4'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div
                          className={`px-6 py-4 rounded-2xl shadow-sm ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-800 border border-gray-200'
                          }`}
                        >
                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                          />
                          <div className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
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
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gray-50 px-6 py-4 rounded-2xl shadow-sm border border-gray-200 max-w-4xl">
                          {currentResponse ? (
                            <div 
                              className="text-sm text-gray-800 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: formatMessage(currentResponse) }}
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-gray-500 ml-2">AI đang suy nghĩ...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-xs">!</span>
                        </div>
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  {messages.length <= 1 && !isTyping && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Gợi ý câu hỏi</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getQuickActions().map((action, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(action.message)}
                            className="flex items-center space-x-3 p-4 bg-white hover:bg-gray-50 rounded-lg text-left border border-gray-200 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              {action.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-4">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Hỏi về địa điểm du lịch, lịch trình, ngân sách..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm bg-white"
                      disabled={isTyping || isLoading}
                      rows={1}
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping || isLoading}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Nhấn Enter để gửi, Shift + Enter để xuống dòng
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}