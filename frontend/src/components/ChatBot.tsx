'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatBotPro() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis l\'assistant **ViteviteApp** propulsé par l\'IA Gemini.\n\nComment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ✅ CORRECTION: Auto-scroll optimisé
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ✅ AJOUT: Sauvegarde conversation dans sessionStorage
  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem('chatbot_messages', JSON.stringify(messages.slice(-10)));
      } catch (e) {
        console.warn('SessionStorage non disponible');
      }
    }
  }, [messages]);

  // ✅ AJOUT: Récupération conversation au chargement
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('chatbot_messages');
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        setMessages(parsedMessages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      }
    } catch (e) {
      console.warn('Impossible de charger l\'historique');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const streamMessage = async (fullText: string) => {
    const tempId = Date.now().toString();
    let currentText = '';
    
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }]);

    const words = fullText.split(' ');
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, content: currentText }
          : msg
      ));
      
      await new Promise(resolve => setTimeout(resolve, 30)); // ✅ Plus fluide
    }

    setMessages(prev => prev.map(msg => 
      msg.id === tempId 
        ? { ...msg, isStreaming: false }
        : msg
    ));

    if (audioEnabled) {
      await speakText(fullText);
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // ✅ CORRECTION: URL API dynamique
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: trimmedInput,
          context: { 
            previous_messages: messages.slice(-4).map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      await streamMessage(data.response);
      
    } catch (error) {
      console.error('Erreur chatbot:', error);
      const errorMsg = "Désolé, je rencontre un problème technique. 🔧\n\nPouvez-vous reformuler votre question ?";
      await streamMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch(`${API_URL}/api/ai/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur transcription');
      }

      const data = await response.json();
      setInputValue(data.text);
      setTimeout(() => handleSendMessage(), 100);
      
    } catch (error) {
      console.error('Erreur transcription:', error);
      alert('Transcription impossible. Service non configuré.');
    }
  };

  const speakText = async (text: string) => {
    if (!audioEnabled) return;

    try {
      setIsSpeaking(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/api/ai/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voice_id: 'hgZie8MSRBRgVn6w8BzP'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur TTS');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      
    } catch (error) {
      console.error('Erreur TTS:', error);
      setIsSpeaking(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
  };

  const quickQuestions = [
    "Comment prendre un ticket ?",
    "Quels sont les horaires ?",
    "Documents requis pour la mairie ?",
    "Comment fonctionne la marketplace ?"
  ];

  return (
    <div className="fixed z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center"
          aria-label="Ouvrir le chat"
        >
          <span className="text-3xl">💬</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </span>
        </button>
      )}

      {/* Chat Window - ✅ CORRECTION POSITIONNEMENT */}
      {isOpen && (
        <>
          {/* Backdrop mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* ✅ Container chat FIXÉ avec positionnement responsive */}
          <div className="fixed bottom-0 right-0 left-0 lg:bottom-4 lg:right-4 lg:left-auto lg:w-[420px] z-50">
            <div className="bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl h-[calc(100vh-60px)] lg:h-[700px] max-h-[700px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm truncate">Assistant ViteviteApp</h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"></span>
                        <span className="truncate">En ligne • Gemini Flash</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
                      title={audioEnabled ? 'Désactiver audio' : 'Activer audio'}
                    >
                      {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Fermer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages - ✅ CORRECTION OVERFLOW */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm">🤖</span>
                          <span className="text-xs font-semibold text-gray-500">Assistant IA</span>
                        </div>
                      )}
                      
                      {/* ✅ AJOUT: Rendu Markdown */}
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        {message.role === 'assistant' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">▋</span>
                      )}
                      
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

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 2 && (
                <div className="p-3 bg-white border-t shrink-0">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Questions rapides :</div>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickQuestion(q)}
                        className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1.5 rounded-full transition-colors font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t shrink-0">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-3 rounded-xl transition-all shrink-0 ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={isRecording ? 'Arrêter' : 'Parler'}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? 'Enregistrement...' : 'Tapez votre message...'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    disabled={isTyping || isRecording}
                  />
                  
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping || isRecording}
                    className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {isSpeaking && (
                  <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-purple-600">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>Lecture audio en cours...</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Propulsé par Gemini Flash ✨
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}