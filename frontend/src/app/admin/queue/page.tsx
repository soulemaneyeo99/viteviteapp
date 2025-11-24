'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Service {
    id: string;
    name: string;
    category: string;
}

interface Ticket {
    id: string;
    ticket_number: string;
    user_name: string | null;
    status: string;
    position_in_queue: number;
    counter_id: string | null;
    estimated_wait_time: number;
}

export default function QueueManagementPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<string>('');

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

    // Fetch queue status
    const { data: queueData, isLoading } = useQuery({
        queryKey: ['queue-status', selectedService],
        queryFn: async () => {
            if (!selectedService) return null;
            const response = await axios.get(
                `${API_URL}/api/v1/queue/status/${selectedService}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                }
            );
            return response.data;
        },
        enabled: !!selectedService,
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    const services = servicesData || [];

    // Auto-select first service
    useEffect(() => {
        if (services.length > 0 && !selectedService) {
            setSelectedService(services[0].id);
        }
    }, [services, selectedService]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'en_attente':
                return 'bg-blue-100 text-blue-700';
            case 'appelé':
                return 'bg-yellow-100 text-yellow-700';
            case 'en_service':
                return 'bg-purple-100 text-purple-700';
            case 'terminé':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'en_attente':
                return <Clock className="w-4 h-4" />;
            case 'appelé':
                return <AlertCircle className="w-4 h-4" />;
            case 'en_service':
                return <Users className="w-4 h-4" />;
            case 'terminé':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                <AdminHeader
                    title="Gestion des Files d'Attente"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="p-4 md:p-8">
                    {/* Service Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Sélectionner un service
                        </label>
                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        >
                            <option value="">Choisir un service...</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedService && queueData && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-600">Personnes en file</p>
                                        <Users className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {queueData.total_active_tickets}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-600">Guichets actifs</p>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {queueData.counters.filter((c: any) => c.status === 'ouvert').length}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-600">Temps d'attente</p>
                                        <Clock className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {queueData.service.estimated_wait_time || 0} min
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-600">Statut</p>
                                        <div
                                            className={`w-3 h-3 rounded-full ${queueData.service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'
                                                }`}
                                        ></div>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900 capitalize">
                                        {queueData.service.status}
                                    </p>
                                </div>
                            </div>

                            {/* Queue Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        File d'attente en temps réel
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Mise à jour automatique toutes les 5 secondes
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Ticket
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Usager
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Statut
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Temps d'attente
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center">
                                                        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </td>
                                                </tr>
                                            ) : queueData.active_tickets.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                        Aucun ticket en file d'attente
                                                    </td>
                                                </tr>
                                            ) : (
                                                queueData.active_tickets.map((ticket: Ticket) => (
                                                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-sm font-bold text-orange-600">
                                                                        {ticket.position_in_queue}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-mono text-sm font-medium text-slate-900">
                                                                {ticket.ticket_number}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-slate-900">
                                                                {ticket.user_name || 'Anonyme'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                    ticket.status
                                                                )}`}
                                                            >
                                                                {getStatusIcon(ticket.status)}
                                                                {ticket.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                            ~{ticket.estimated_wait_time} min
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                                                                Prioriser
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {!selectedService && (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ArrowUpDown className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Sélectionnez un service
                            </h3>
                            <p className="text-slate-500">
                                Choisissez un service pour voir et gérer sa file d'attente
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
