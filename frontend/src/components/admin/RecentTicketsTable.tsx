'use client';
import { useQuery } from '@tanstack/react-query';
import { ticketsAPI, servicesAPI } from '@/lib/api';
import { MoreHorizontal, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RecentTicketsTable() {
    // Fetch tickets
    const { data: ticketsData, isLoading } = useQuery({
        queryKey: ['admin-recent-tickets'],
        queryFn: async () => {
            const response = await ticketsAPI.getAll({ limit: 10 });
            return response.data;
        },
        refetchInterval: 10000,
    });

    const tickets = ticketsData?.tickets || [];

    // Fetch services to map IDs to names
    const { data: servicesData } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await servicesAPI.getAll();
            return response.data;
        }
    });

    const services = servicesData?.services || [];
    const getServiceName = (id: string) => {
        const service = services.find((s: any) => s.id === id);
        return service ? service.name : 'Service inconnu';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'en_attente':
            case 'WAITING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                        <Clock className="w-3 h-3" /> En attente
                    </span>
                );
            case 'appelé':
            case 'CALLED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <AlertCircle className="w-3 h-3" /> Appelé
                    </span>
                );
            case 'en_service':
            case 'SERVING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <Loader2 className="w-3 h-3 animate-spin" /> En cours
                    </span>
                );
            case 'terminé':
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 className="w-3 h-3" /> Terminé
                    </span>
                );
            case 'annulé':
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <XCircle className="w-3 h-3" /> Annulé
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                        {status}
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900">Tickets récents</h3>
                    <p className="text-sm text-gray-500">Dernières activités sur la plateforme</p>
                </div>
                <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700 hover:underline">
                    Voir tout
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">ID Ticket</th>
                            <th className="px-6 py-4">Utilisateur</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4">Temps</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Aucun ticket récent
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket: any) => (
                                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{ticket.ticket_number}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                                                {(ticket.user_name || '?').charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-700">{ticket.user_name || 'Anonyme'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{getServiceName(ticket.service_id)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
