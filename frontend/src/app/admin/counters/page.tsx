'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:parameter>
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Plus, Power, PowerOff, UserPlus, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Counter {
    id: string;
    service_id: string;
    counter_number: number;
    name: string;
    status: string;
    priority_type: string;
    agent_id: string | null;
    agent_name: string | null;
    agent_email: string | null;
    tickets_processed_today: number;
    total_tickets_processed: number;
    is_active: boolean;
    current_ticket_id: string | null;
}

interface Service {
    id: string;
    name: string;
    category: string;
}

export default function CountersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');
        if (!token || role !== 'admin') {
            router.push('/login');
        }
    }, [router]);

    // Fetch services
    const { data: servicesData } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/v1/services`);
            return response.data.services as Service[];
        },
    });

    // Fetch counters for selected service
    const { data: countersData, isLoading } = useQuery({
        queryKey: ['counters', selectedService],
        queryFn: async () => {
            if (!selectedService) return [];
            const response = await axios.get(
                `${API_URL}/api/v1/counters/service/${selectedService}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                }
            );
            return response.data as Counter[];
        },
        enabled: !!selectedService,
    });

    // Update counter status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ counterId, status }: { counterId: string; status: string }) => {
            const response = await axios.patch(
                `${API_URL}/api/v1/counters/${counterId}/status`,
                { status },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['counters', selectedService] });
            toast.success('Statut du guichet mis à jour');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
        },
    });

    const services = servicesData || [];
    const counters = countersData || [];

    // Auto-select first service
    useEffect(() => {
        if (services.length > 0 && !selectedService) {
            setSelectedService(services[0].id);
        }
    }, [services, selectedService]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ouvert':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'fermé':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'en_pause':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ouvert':
                return <Power className="w-4 h-4" />;
            case 'fermé':
                return <PowerOff className="w-4 h-4" />;
            default:
                return <Power className="w-4 h-4" />;
        }
    };

    const handleToggleStatus = (counter: Counter) => {
        const newStatus = counter.status === 'ouvert' ? 'fermé' : 'ouvert';
        updateStatusMutation.mutate({ counterId: counter.id, status: newStatus });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                <AdminHeader title="Gestion des Guichets" onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="p-4 md:p-8">
                    {/* Service Selector */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Sélectionner un service
                            </label>
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            >
                                <option value="">Choisir un service...</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={!selectedService}
                            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            Nouveau Guichet
                        </button>
                    </div>

                    {/* Counters Grid */}
                    {selectedService && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                // Loading skeletons
                                [...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-pulse"
                                    >
                                        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                    </div>
                                ))
                            ) : counters.length === 0 ? (
                                <div className="col-span-full bg-white rounded-xl p-12 text-center border border-slate-100">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Power className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        Aucun guichet
                                    </h3>
                                    <p className="text-slate-500 mb-6">
                                        Créez votre premier guichet pour commencer
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                                    >
                                        Créer un guichet
                                    </button>
                                </div>
                            ) : (
                                counters.map((counter) => (
                                    <div
                                        key={counter.id}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {counter.name}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    Guichet #{counter.counter_number}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(
                                                    counter.status
                                                )}`}
                                            >
                                                {getStatusIcon(counter.status)}
                                                {counter.status}
                                            </span>
                                        </div>

                                        {/* Agent Info */}
                                        <div className="mb-4 pb-4 border-b border-slate-100">
                                            {counter.agent_name ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <UserPlus className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {counter.agent_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{counter.agent_email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">Aucun agent assigné</p>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Aujourd'hui</p>
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {counter.tickets_processed_today}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Total</p>
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {counter.total_tickets_processed}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(counter)}
                                                disabled={!counter.agent_id && counter.status === 'fermé'}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${counter.status === 'ouvert'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed'
                                                    }`}
                                            >
                                                {counter.status === 'ouvert' ? 'Fermer' : 'Ouvrir'}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/admin/counters/${counter.id}`)}
                                                className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {!selectedService && (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Power className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Sélectionnez un service
                            </h3>
                            <p className="text-slate-500">
                                Choisissez un service pour voir et gérer ses guichets
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
