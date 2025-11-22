'use client';

import { TicketStatus } from '@/lib/types';
import { MoreHorizontal, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Mock data for visual purposes if real data is empty
const MOCK_TICKETS = [
    { id: 'T-8832', service: 'Mairie de Cocody', status: 'WAITING', time: 'Il y a 2 min', user: 'Kouamé Jean' },
    { id: 'T-8831', service: 'CIE Plateau', status: 'SERVING', time: 'Il y a 5 min', user: 'Amina Diallo' },
    { id: 'T-8830', service: 'SODECI Treichville', status: 'COMPLETED', time: 'Il y a 12 min', user: 'Moussa Koné' },
    { id: 'T-8829', service: 'Préfecture Abidjan', status: 'CANCELLED', time: 'Il y a 15 min', user: 'Sarah Yace' },
    { id: 'T-8828', service: 'Mairie de Cocody', status: 'WAITING', time: 'Il y a 18 min', user: 'Paul Koffi' },
];

export default function RecentTicketsTable() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'WAITING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <Clock className="w-3 h-3" /> En attente
                    </span>
                );
            case 'SERVING':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Loader2 className="w-3 h-3 animate-spin" /> En cours
                    </span>
                );
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 className="w-3 h-3" /> Terminé
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <XCircle className="w-3 h-3" /> Annulé
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">Tickets récents</h3>
                    <p className="text-sm text-slate-500">Dernières activités sur la plateforme</p>
                </div>
                <button className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline">
                    Voir tout
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">ID Ticket</th>
                            <th className="px-6 py-4">Utilisateur</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4">Temps</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_TICKETS.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-slate-900">{ticket.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {ticket.user.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-700">{ticket.user}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{ticket.service}</td>
                                <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                                <td className="px-6 py-4 text-slate-500">{ticket.time}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
