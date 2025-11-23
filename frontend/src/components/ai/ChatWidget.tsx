'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, Zap, Clock, MapPin, FileText, AlertCircle } from 'lucide-react';
import { chatAPI, servicesAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface QuickReply {
    icon: React.ReactNode;
    text: string;
    prompt: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [services, setServices] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Quick reply suggestions
    const quickReplies: QuickReply[] = [
        { icon: <Clock className="w-4 h-4" />, text: "Temps d'attente", prompt: "Quels sont les temps d'attente actuels ?" },
        { icon: <MapPin className="w-4 h-4" />, text: "Services proches", prompt: "Quels services sont proches de moi ?" },
        { icon: <FileText className="w-4 h-4" />, text: "Documents requis", prompt: "Quels documents dois-je apporter ?" },
        { icon: <Zap className="w-4 h-4" />, text: "Meilleur moment", prompt: "Quel est le meilleur moment pour venir ?" },
    ];

    // Load services for context
    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await servicesAPI.getAll();
                setServices(response.data.services || []);
            } catch (error) {
                console.error('Error loading services:', error);
            }
        };
        loadServices();
    }, []);

    // Load chat history from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem('vitevite_chat_history');
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                setMessages(parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
                })));
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        } else {
            // Welcome message
            setMessages([{
                role: 'assistant',
                content: '👋 Bonjour ! Je suis votre assistant IA ViteVite.\n\nJe peux vous aider avec :\n• 📊 Prédictions de temps d\'attente\n• 🏥 Triage médical d\'urgence\n• 📄 Documents requis\n• 🗺️ Services à proximité\n• ⏰ Meilleurs moments pour visiter\n\nComment puis-je vous aider ?',
                timestamp: new Date()
            }]);
        }
    }, []);

    // Save chat history to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('vitevite_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent, customMessage?: string) => {
        e.preventDefault();
        const messageToSend = customMessage || input.trim();
        if (!messageToSend || isLoading) return;

        setInput('');
        setShowQuickReplies(false);

        const userMessage: Message = {
            role: 'user',
            content: messageToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Build enriched context
            const context: any = {
                services: services.slice(0, 5).map(s => ({
                    name: s.name,
                    category: s.category,
                    queue_size: s.current_queue_size,
                    wait_time: s.estimated_wait_time,
                    status: s.status
                })),
                timestamp: new Date().toISOString(),
                user_location: 'Abidjan' // Could be enhanced with real geolocation
            };

            const response = await chatAPI.sendMessage(messageToSend, messages, context);

            if (response.data.status === 'success') {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: response.data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                toast.error('Service IA indisponible');
                throw new Error('Service unavailable');
            }
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Erreur de connexion');
            const errorMessage: Message = {
                role: 'assistant',
                content: '😔 Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.\n\nEn attendant, vous pouvez :\n• Consulter la page Services\n• Prendre un ticket directement\n• Contacter le support',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickReply = (prompt: string) => {
        setInput(prompt);
        const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
        handleSubmit(fakeEvent, prompt);
    };

    const clearHistory = () => {
        if (confirm('Voulez-vous vraiment effacer l\'historique de conversation ?')) {
            localStorage.removeItem('vitevite_chat_history');
            setMessages([{
                role: 'assistant',
                content: '👋 Historique effacé ! Comment puis-je vous aider ?',
                timestamp: new Date()
            }]);
            setShowQuickReplies(true);
            toast.success('Historique effacé');
        }
    };

    return (
        <>
            {/* Toggle Button with notification badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen
                        ? 'bg-slate-800 rotate-90'
                        : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-pulse-glow'
                    } text-white group`}
                aria-label="Assistant IA"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    </>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-full max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[600px] max-h-[85vh]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">Assistant ViteVite IA</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-indigo-100">Gemini AI • En ligne</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={clearHistory}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Effacer l'historique"
                        >
                            <AlertCircle className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                                        : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm shadow-lg'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-md'
                                        }`}>
                                        {msg.content.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                        ))}
                                    </div>
                                    {msg.timestamp && (
                                        <span className="text-xs text-slate-400 px-1">
                                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {showQuickReplies && messages.length <= 2 && !isLoading && (
                        <div className="px-4 pb-3 space-y-2 bg-white border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggestions rapides</p>
                            <div className="grid grid-cols-2 gap-2">
                                {quickReplies.map((reply, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickReply(reply.prompt)}
                                        className="flex items-center gap-2 p-2.5 bg-gradient-to-br from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 border border-violet-200 rounded-xl text-xs font-medium text-slate-700 transition-all hover:shadow-md"
                                    >
                                        <span className="text-violet-600">{reply.icon}</span>
                                        <span className="truncate">{reply.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez votre question..."
                                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm placeholder:text-slate-400 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            Propulsé par <span className="font-semibold text-violet-600">Google Gemini AI</span>
                        </p>
                    </form>
                </div>
            )}
        </>
    );
}
