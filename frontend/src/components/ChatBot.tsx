'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  position?: 'bottom-right' | 'bottom-left';
}

export default function ChatBot({ position = 'bottom-right' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis l\'assistant IA de ViteviteApp. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-6 right-6'
    : 'bottom-6 left-6';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          context: {
            timestamp: new Date().toISOString(),
            previous_messages: messages.slice(-3).map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Je n\'ai pas pu générer une réponse.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erreur chatbot:', error);
      setError('Désolé, une erreur est survenue. Veuillez réessayer.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Je rencontre un problème technique. Pouvez-vous reformuler votre question ou réessayer plus tard ?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { text: "📋 Comment prendre un ticket ?", icon: "🎫" },
    { text: "⏰ Quels sont les horaires ?", icon: "🕐" },
    { text: "📄 Documents nécessaires ?", icon: "📝" },
    { text: "🛍️ Comment acheter sur la marketplace ?", icon: "🛒" }
  ];

  const handleQuickQuestion = async (question: string) => {
    setInputValue(question);
    await handleSendMessage();
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Conversation effacée. Comment puis-je vous aider ?',
      timestamp: new Date()
    }]);
    setError(null);
  };

  return (
    <>
      {/* Bulle de chat flottante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses} z-50 group`}
          aria-label="Ouvrir le chat"
        >
          {/* Main button */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-pulse">
              <MessageCircle className="w-8 h-8" />
            </div>
            
            {/* Badge de notification */}
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
              <Sparkles className="w-3 h-3" />
            </span>

            {/* Pulse effect */}
            <div className="absolute inset-0 w-16 h-16 bg-purple-600 rounded-full animate-ping opacity-20"></div>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            <div className="font-semibold mb-1">💬 Besoin d'aide ?</div>
            <div className="text-xs text-gray-300">Powered by Gemini AI</div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className={`fixed ${positionClasses} z-50 w-full max-w-md h-[700px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-purple-200 animate-slideIn`}>
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-2 border-white/30">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Assistant ViteviteApp</h3>
                  <div className="flex items-center space-x-2 text-xs text-purple-100">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Propulsé par Gemini AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  aria-label="Effacer la conversation"
                  title="Effacer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  aria-label="Fermer le chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-around bg-white/10 backdrop-blur-sm rounded-xl py-2 px-3 text-xs">
              <div className="text-center">
                <div className="font-bold">{messages.length}</div>
                <div className="text-purple-100">Messages</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="font-bold">100%</div>
                <div className="text-purple-100">Disponible</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="font-bold">&lt;1s</div>
                <div className="text-purple-100">Réponse</div>
              </div>
            </div>
          </div>

          {/* Messages - avec scroll optimisé */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-purple-50/50 to-pink-50/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                    : 'bg-white border-2 border-purple-100 text-gray-900'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-purple-600">Assistant IA</span>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="flex items-center space-x-2 mb-2 justify-end">
                      <span className="text-xs font-bold text-purple-100">Vous</span>
                      <User className="w-4 h-4 text-purple-100" />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator amélioré */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white border-2 border-purple-100 rounded-2xl px-5 py-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">Gemini réfléchit...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm text-red-800 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length <= 2 && !isTyping && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-100">
              <div className="text-xs font-bold text-purple-900 mb-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Questions rapides
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q.text)}
                    className="text-xs bg-white hover:bg-purple-100 text-purple-900 px-3 py-2 rounded-lg transition font-medium shadow-sm border border-purple-200 hover:border-purple-400 text-left flex items-center space-x-1"
                    disabled={isTyping}
                  >
                    <span>{q.icon}</span>
                    <span className="truncate">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input amélioré */}
          <div className="p-4 bg-white border-t-2 border-purple-100">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="w-full px-4 py-3 pr-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  disabled={isTyping}
                />
                {inputValue && (
                  <button
                    onClick={() => setInputValue('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                aria-label="Envoyer"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Footer info */}
            <div className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Propulsé par</span>
              <span className="font-bold text-purple-600">Google Gemini Pro</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}