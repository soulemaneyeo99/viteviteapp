"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings, LogOut, Search, Filter, Download, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function ServiceTicketsPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}` },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters` },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue` },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets`, active: true },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users` },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics` },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings` },
    ];

    // Hardcoded Tickets Data
    const tickets = [
        { id: "T-1023", number: "A-040", user: "Kouassi Yves", service: "État Civil", agent: "Kouamé Sarah", date: "26 Nov, 10:15", duration: "12 min", status: "completed" },
        { id: "T-1022", number: "B-011", user: "Touré Awa", service: "Légalisation", agent: "Koné Awa", date: "26 Nov, 10:10", duration: "5 min", status: "completed" },
        { id: "T-1021", number: "A-039", user: "N'Dri Paul", service: "État Civil", agent: "Kouamé Sarah", date: "26 Nov, 10:05", duration: "--", status: "cancelled" },
        { id: "T-1020", number: "C-002", user: "Fofana Ali", service: "Réclamation", agent: "Diop Moussa", date: "26 Nov, 09:55", duration: "25 min", status: "completed" },
        { id: "T-1019", number: "A-038", user: "Bamba Mariam", service: "État Civil", agent: "Kouamé Sarah", date: "26 Nov, 09:45", duration: "15 min", status: "completed" },
        { id: "T-1018", number: "A-037", user: "Kouadio Jean", service: "État Civil", agent: "Kouamé Sarah", date: "26 Nov, 09:30", duration: "10 min", status: "completed" },
        { id: "T-1017", number: "B-010", user: "Yéo Sita", service: "Légalisation", agent: "Koné Awa", date: "26 Nov, 09:25", duration: "--", status: "noshow" },
        { id: "T-1016", number: "A-036", user: "Diaby Mohamed", service: "État Civil", agent: "Kouamé Sarah", date: "26 Nov, 09:15", duration: "18 min", status: "completed" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Dark Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/admin" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-xl">⚡</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-white">ViteViteApp</h1>
                            <p className="text-xs text-slate-400">Gestion Tickets</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${item.active
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            router.push("/auth");
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Historique des Tickets</h2>
                        <p className="text-sm text-gray-500">Consultez et exportez l'historique complet</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Calendar className="w-4 h-4" />
                            Aujourd'hui
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800">
                            <Download className="w-4 h-4" />
                            Exporter
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par numéro, nom..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none">
                                    <option>Tous les statuts</option>
                                    <option>Terminés</option>
                                    <option>Annulés</option>
                                </select>
                                <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none">
                                    <option>Tous les agents</option>
                                    <option>Kouamé Sarah</option>
                                    <option>Koné Awa</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Heure</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Durée</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">{ticket.number}</span>
                                                    <span className="text-xs text-gray-400">{ticket.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{ticket.user}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{ticket.service}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                        {ticket.agent.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span className="text-sm text-gray-700">{ticket.agent}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{ticket.date}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ticket.status === 'completed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        <CheckCircle className="w-3 h-3" /> Terminé
                                                    </span>
                                                )}
                                                {ticket.status === 'cancelled' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                        <XCircle className="w-3 h-3" /> Annulé
                                                    </span>
                                                )}
                                                {ticket.status === 'noshow' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                        <Clock className="w-3 h-3" /> Absent
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="font-mono text-sm font-bold text-gray-900">{ticket.duration}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-500">Affichage de 1 à 8 sur 124 tickets</p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm disabled:opacity-50" disabled>Précédent</button>
                                    <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm">Suivant</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
