'use client';

import { useState, useRef, useEffect } from 'react';
// Assurez-vous que l'import de api est correct pour votre projet
import { api } from '@/lib/api'; 
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatBotProps {
  // 'position' est maintenant correctement défini dans la signature de la fonction
  position?: 'bottom-right' | 'bottom-left';
}

export default function ChatBot({ position = 'bottom-right' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis l\'assistant ViteviteApp. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // La logique de position est bien définie et utilise 'position' qui est maintenant une prop valide
  const positionClasses = position === 'bottom-right' 
    ? 'bottom-20 right-4 sm:bottom-6 sm:right-6'
    : 'bottom-20 left-4 sm:bottom-6 sm:left-6';

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateStreaming = async (text: string) => {
    setIsTyping(true);
    setStreamingMessage('');
    
    // Séparer par mot pour une simulation plus réaliste
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      // Ajoute un espace seulement si ce n'est pas le premier mot
      setStreamingMessage(prev => prev + (i > 0 ? ' ' : '') + words[i]);
    }
    
    return text;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.chatbot(inputValue);
      
      // Streaming simulation
      const fullText = await simulateStreaming(response.response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Erreur chatbot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage('');
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
    "Comment prendre un ticket ?",
    "Quels sont les horaires ?",
    "Documents requis ?",
    "Comment fonctionne la marketplace ?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    // Petit délai pour que la valeur de l'input soit bien mise à jour avant l'envoi
    setTimeout(() => handleSendMessage(), 100); 
  };

  // Fonction pour activer le vocal (préparé pour ElevenLabs)
  const handleVoiceInput = async () => {
    setIsRecording(true);
    // TODO: Intégrer ElevenLabs Speech-to-Text
    setTimeout(() => {
      setIsRecording(false);
      alert('Fonction vocale prête pour ElevenLabs. Ajoutez votre API Key.');
    }, 2000);
  };

  const handleTextToSpeech = async (text: string) => {
    setIsSpeaking(true);
    // TODO: Intégrer ElevenLabs Text-to-Speech
    setTimeout(() => {
      setIsSpeaking(false);
      alert('TTS ElevenLabs prêt. Ajoutez votre API Key.');
    }, 2000);
  };

  return (
    <>
      {/* Bulle de chat flottante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses} z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group`}
          aria-label="Ouvrir le chat"
        >
          <span className="text-2xl">💬</span>
          
          {/* Badge de notification */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            !
          </span>
        </button>
      )}

      {/* Fenêtre de chat - OPTIMISÉE MOBILE */}
      {isOpen && (
        <div className={`fixed ${positionClasses} z-50 w-full sm:w-96 h-[calc(100vh-5rem)] sm:h-[600px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideIn`}>
          {/* Header - COMPRESSÉ MOBILE */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl">🤖</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base truncate">ViteviteApp</h3>
                <div className="flex items-center space-x-1 text-xs text-purple-100">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                  <span className="truncate">Propulsé par Gemini AI</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition flex-shrink-0"
              aria-label="Fermer le chat"
            >
              <span className="text-lg">×</span>
            </button>
          </div>

          {/* Messages - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm">🤖</span>
                      <span className="text-xs font-semibold text-gray-500">Assistant IA</span>
                    </div>
                  )}
                  
                  {/* MARKDOWN SUPPORT */}
                  <div className="text-sm leading-relaxed markdown-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  <div className={`text-xs mt-2 flex items-center justify-between ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                    
                    {/* Bouton TTS pour messages assistant */}
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleTextToSpeech(message.content)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition"
                        title="Écouter"
                      >
                        {isSpeaking ? '🔊' : '🔈'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[80%] bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">🤖</span>
                    <span className="text-xs font-semibold text-gray-500">Assistant IA</span>
                  </div>
                  <div className="text-sm leading-relaxed markdown-content">
                    <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1"></span>
                  </div>
                </div>
              </div>
            )}

            {isTyping && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length <= 2 && (
            <div className="p-2 sm:p-3 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="text-xs font-semibold text-gray-500 mb-2">Questions rapides :</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 sm:px-3 py-1.5 rounded-full transition font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input - FIXÉ EN BAS */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2">
              {/* Bouton vocal */}
              <button
                onClick={handleVoiceInput}
                disabled={isTyping || isRecording}
                className={`w-10 h-10 flex-shrink-0 ${isRecording ? 'bg-red-500' : 'bg-gray-200'} hover:bg-gray-300 rounded-xl transition flex items-center justify-center`}
                aria-label="Enregistrement vocal"
              >
                {isRecording ? '🎤' : '🎙️'}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Votre question..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Envoyer"
              >
                <span className="text-lg sm:text-xl">🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}