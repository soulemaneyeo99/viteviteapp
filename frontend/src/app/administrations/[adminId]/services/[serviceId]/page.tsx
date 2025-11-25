'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicesAPI, ticketsAPI, predictionsAPI } from '@/lib/api';
import {
    Clock, Users, Activity, FileText, DollarSign, MapPin, AlertTriangle,
    Sparkles, TrendingDown, CheckCircle, ArrowRight, Zap, Calendar, Phone
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ServiceDetailPage() {
    const params = useParams();
    const serviceId = params.serviceId as string;
    const adminId = params.adminId as string;

    const [showTicketModal, setShowTicketModal] = useState(false);
    const [reservationType, setReservationType] = useState<'digital' | 'on_site'>('digital');
    const [ticketForm, setTicketForm] = useState({ name: '', phone: '', notes: '' });

    // Fetch service details
    const { data: serviceData, isLoading } = useQuery({
        queryKey: ['service', serviceId],
        queryFn: async () => {
            const response = await servicesAPI.getById(serviceId);
            return response.data;
        },
        refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    });

    // Fetch AI prediction
    const { data: predictionData } = useQuery({
        queryKey: ['prediction', serviceId],
        queryFn: async () => {
            const response = await predictionsAPI.predict(serviceId);
            return response.data;
        },
    });

    const service = serviceData?.service;
    const prediction = predictionData;

    // Mock crowd prediction data
    const crowdData = [
        { time: '8h', wait: 45 },
        { time: '10h', wait: 80 },
        { time: '12h', wait: 60 },
        { time: '14h', wait: 15 },
        { time: '16h', wait: 30 },
        { time: '18h', wait: 10 }
    ];

    const handleTakeTicket = async () => {
        try {
            const response = await ticketsAPI.create({
                service_id: serviceId,
                user_name: ticketForm.name || undefined,
                user_phone: ticketForm.phone || undefined,
                notes: ticketForm.notes || undefined,
            });

            toast.success(`Ticket ${response.data.ticket.ticket_number} créé !`);
            window.location.href = `/ticket/${response.data.ticket.id}`;
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur lors de la création du ticket');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-32 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-300 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span>/</span>
                        <Link href="/administrations" className="hover:text-white transition-colors">Administrations</Link>
                        <span>/</span>
                        <Link href={`/administrations/${adminId}`} className="hover:text-white transition-colors">Détails</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{service?.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                                {service?.name}
                            </h1>
                            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                                {service?.description}
                            </p>
                        </div>

                        {/* Live Status */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 min-w-[300px]">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-6 h-6 text-green-400 animate-pulse" />
                                <span className="text-lg font-bold">En direct</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-slate-300 mb-1">Ticket en cours</div>
                                    <div className="text-3xl font-black">{service?.current_ticket_number || 'A042'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-slate-300 mb-1">File d'attente</div>
                                        <div className="text-2xl font-black">{service?.current_queue_size}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-300 mb-1">Attente</div>
                                        <div className="text-2xl font-black">{service?.estimated_wait_time}min</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-sm text-slate-300 mb-2">Guichets actifs</div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${i <= (service?.active_counters || 0) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'
                                                }`}>
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
                {/* AI Prediction Chart */}
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-3xl p-1 shadow-xl mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-[1.4rem] p-8">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Sparkles className="w-8 h-8 text-yellow-300" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-white mb-2">Prévision d'affluence IA</h3>
                                <p className="text-violet-100">Basée sur l'historique et les tendances actuelles</p>
                            </div>
                            <div className="bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-400/30">
                                <div className="flex items-center gap-2 text-green-300">
                                    <TrendingDown className="w-5 h-5" />
                                    <span className="text-sm font-bold">Meilleur moment : 14h-15h30</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-48 w-full bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={crowdData}>
                                    <defs>
                                        <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#fff" fontSize={12} />
                                    <YAxis stroke="#fff" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="wait" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorWait)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Required Documents */}
                        {service?.required_documents && service.required_documents.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                    Documents requis
                                </h3>
                                <div className="space-y-3">
                                    {service.required_documents.map((doc: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${doc.required ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-400'
                                                }`}>
                                                {doc.required && <CheckCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{doc.name}</p>
                                                {doc.description && <p className="text-sm text-gray-600 mt-1">{doc.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fees */}
                        {service?.fees && (
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                    Frais
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="text-sm text-gray-500 mb-1">Tarif normal</div>
                                        <div className="text-2xl font-black text-gray-900">{service.fees.base} {service.fees.currency}</div>
                                    </div>
                                    {service.fees.express && (
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                                                <Zap className="w-3.5 h-3.5" />
                                                Express
                                            </div>
                                            <div className="text-2xl font-black text-blue-900">{service.fees.express} {service.fees.currency}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Problems Reported */}
                        {service?.problems_reported && service.problems_reported.length > 0 && (
                            <div className="bg-orange-50 rounded-3xl border-2 border-orange-200 p-8">
                                <h3 className="text-xl font-black text-orange-900 mb-4 flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                                    Problèmes signalés
                                </h3>
                                <div className="space-y-3">
                                    {service.problems_reported.map((problem: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-white rounded-xl">
                                            <p className="text-sm font-medium text-gray-900">{problem.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Signalé {problem.reported_at}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Digital Ticket */}
                        <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Zap className="w-6 h-6 text-yellow-300" />
                                </div>
                                <h3 className="text-xl font-black">Ticket Digital</h3>
                            </div>
                            <p className="text-blue-100 mb-6 leading-relaxed">
                                Réservez votre place à distance et suivez votre progression en temps réel.
                            </p>
                            <button
                                onClick={() => { setReservationType('digital'); setShowTicketModal(true); }}
                                className="w-full py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                Réserver maintenant
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Go On-Site */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <MapPin className="w-6 h-6 text-gray-700" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Aller sur place</h3>
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Présentez-vous directement. Nous vous recommandons d'y aller maintenant.
                            </p>
                            <button
                                onClick={() => { setReservationType('on_site'); setShowTicketModal(true); }}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                J'y vais maintenant
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Best Times */}
                        {service?.best_visit_times && service.best_visit_times.length > 0 && (
                            <div className="bg-green-50 rounded-3xl p-6 border border-green-200">
                                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Meilleurs moments
                                </h4>
                                <div className="space-y-2">
                                    {service.best_visit_times.map((time: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl">
                                            <span className="text-sm font-medium text-gray-900">{time.hour}</span>
                                            <span className="text-xs text-green-600 font-bold">{Math.round(time.score * 100)}% optimal</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white">
                            <h2 className="text-2xl font-black">
                                {reservationType === 'digital' ? 'Ticket Digital' : 'Confirmation'}
                            </h2>
                            <p className="text-blue-100 mt-1">{service?.name}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                                    Nom (optionnel)
                                </label>
                                <input
                                    value={ticketForm.name}
                                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Votre nom"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                                    Téléphone (optionnel)
                                </label>
                                <input
                                    value={ticketForm.phone}
                                    onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="06XXXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                                    Notes
                                </label>
                                <textarea
                                    value={ticketForm.notes}
                                    onChange={(e) => setTicketForm({ ...ticketForm, notes: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                                    placeholder="Informations supplémentaires..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowTicketModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleTakeTicket}
                                    className="flex-[2] py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
