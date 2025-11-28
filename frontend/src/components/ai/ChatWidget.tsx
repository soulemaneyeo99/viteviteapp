'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, Zap, Clock, MapPin, FileText, AlertCircle, Trash2 } from 'lucide-react';
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
        { icon: <Clock className="w-3.5 h-3.5" />, text: "Temps d'attente", prompt: "Quels sont les temps d'attente actuels ?" },
        { icon: <MapPin className="w-3.5 h-3.5" />, text: "Services proches", prompt: "Quels services sont proches de moi ?" },
        { icon: <FileText className="w-3.5 h-3.5" />, text: "Documents", prompt: "Quels documents dois-je apporter ?" },
        { icon: <Zap className="w-3.5 h-3.5" />, text: "Meilleur moment", prompt: "Quel est le meilleur moment pour venir ?" },
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
                content: '👋 Bonjour ! Je suis votre assistant IA ViteVite.\n\nJe peux vous aider avec :\n• 📊 Prédictions de temps d\'attente\n• 🏥 Triage médical d\'urgence\n• 📄 Documents requis\n• 🗺️ Services à proximité\n\nComment puis-je vous aider ?',
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
                user_location: 'Abidjan'
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
                content: '😔 Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.',
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
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-custom-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen
                    ? 'bg-slate-900 rotate-90'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
                    } text-white group`}
                aria-label="Assistant IA"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    </>
                )}
            </button>

            {/* Chat Window Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Chat Window */}
            <div className={`fixed z-[60] transition-all duration-300 ease-in-out bg-white shadow-2xl overflow-hidden flex flex-col
                ${isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-10 pointer-events-none'
                }
                md:bottom-24 md:right-6 md:w-[380px] md:h-[600px] md:max-h-[calc(100vh-120px)] md:rounded-3xl border border-slate-100
                bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl
            `}>
                {/* Header */}
                <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-xl">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Assistant ViteVite</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">En ligne</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={clearHistory}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                        title="Effacer l'historique"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === 'user'
                                ? 'bg-slate-900 border-slate-900'
                                : 'bg-white border-slate-100'
                                }`}>
                                {msg.role === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-primary-600" />
                                )}
                            </div>
                            <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-sm'
                                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                                    }`}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                    ))}
                                </div>
                                {msg.timestamp && (
                                    <span className="text-[10px] text-slate-400 px-1">
                                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-3 animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Bot className="w-4 h-4 text-primary-600" />
                            </div>
                            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {showQuickReplies && messages.length <= 2 && !isLoading && (
                    <div className="px-4 pb-2 bg-slate-50/50">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {quickReplies.map((reply, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickReply(reply.prompt)}
                                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 rounded-full text-xs font-medium text-slate-600 transition-all whitespace-nowrap shadow-sm"
                                >
                                    <span className="text-primary-600">{reply.icon}</span>
                                    <span>{reply.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez votre question..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 text-sm placeholder:text-slate-400 transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400">
                            Propulsé par <span className="font-semibold text-primary-600">Gemini AI</span>
                        </p>
                    </div>
                </form>
            </div>
        </>
    );
}
