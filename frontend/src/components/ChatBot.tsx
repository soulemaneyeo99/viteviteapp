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
      content: 'Bonjour ! 👋 Je suis l\'assistant **ViteviteApp** propulsé par l\'IA.\n\nComment puis-je vous aider aujourd\'hui ?',
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

  // Streaming text simulation (à remplacer par vraie API streaming)
  const streamMessage = async (fullText: string) => {
    const tempId = Date.now().toString();
    let currentText = '';
    
    // Ajoute message vide avec flag streaming
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }]);

    // Simule streaming caractère par caractère
    const words = fullText.split(' ');
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, content: currentText }
          : msg
      ));
      
      // Délai entre mots (ajustable)
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Marque comme fini
    setMessages(prev => prev.map(msg => 
      msg.id === tempId 
        ? { ...msg, isStreaming: false }
        : msg
    ));

    // TTS si activé
    if (audioEnabled) {
      await speakText(fullText);
    }
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
      // Appel API
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputValue,
          context: { previous_messages: messages.slice(-4) }
        })
      });

      if (!response.ok) throw new Error('Erreur API');

      const data = await response.json();
      
      // Stream la réponse
      await streamMessage(data.response);
      
    } catch (error) {
      console.error('Erreur chatbot:', error);
      const errorMsg = "Désolé, je rencontre un problème technique. 🔧\n\nPouvez-vous **reformuler** votre question ?";
      await streamMessage(errorMsg);
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

  // Voice Recognition (STT)
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
      alert('Impossible d\'accéder au microphone');
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
      // Envoi à ElevenLabs ou autre service STT
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('http://localhost:8000/api/ai/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Erreur transcription');

      const data = await response.json();
      setInputValue(data.text);
      
      // Envoie automatiquement le message
      setTimeout(() => handleSendMessage(), 100);
      
    } catch (error) {
      console.error('Erreur transcription:', error);
    }
  };

  // Text-to-Speech (TTS) avec ElevenLabs
  const speakText = async (text: string) => {
    if (!audioEnabled) return;

    try {
      setIsSpeaking(true);

      const response = await fetch('http://localhost:8000/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voice_id: 'hgZie8MSRBRgVn6w8BzP' // Anicet
        })
      });

      if (!response.ok) throw new Error('Erreur TTS');

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

  const quickQuestions = [
    "Comment prendre un ticket ?",
    "Quels sont les horaires ?",
    "Documents requis pour la mairie ?",
    "Comment fonctionne la marketplace ?"
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center group"
        >
          <span className="text-3xl">💬</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </span>
        </button>
      )}

      {/* Chat Window - Responsive */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed inset-x-4 bottom-4 lg:right-6 lg:bottom-6 lg:left-auto lg:w-[420px] z-50 max-h-[85vh] lg:max-h-[700px] animate-slideIn">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Assistant ViteviteApp</h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span>En ligne • Gemini Pro</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                      title={audioEnabled ? 'Désactiver audio' : 'Activer audio'}
                    >
                      {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
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
                      
                      {/* Markdown Rendering */}
                      <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${
                        message.role === 'user' ? 'prose-invert' : ''
                      }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
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
                <div className="p-3 bg-white border-t">
                  <div className="text-xs font-semibold text-gray-500 mb-2">Questions rapides :</div>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(q);
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1.5 rounded-full transition font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center space-x-2">
                  {/* Voice Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-xl transition-all ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={isRecording ? 'Arrêter l\'enregistrement' : 'Parler'}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isRecording ? 'Enregistrement en cours...' : 'Tapez ou parlez...'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isTyping || isRecording}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping || isRecording}
                    className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  viteviteapp ✨
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}