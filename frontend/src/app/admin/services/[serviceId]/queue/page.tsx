"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings, LogOut, Clock, ArrowRight, MoreHorizontal, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ServiceQueuePage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;
    const [filter, setFilter] = useState("all");

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}` },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters` },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue`, active: true },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets` },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users` },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics` },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings` },
    ];

    // Hardcoded Queue Data
    const queueItems = [
        { id: 1, ticket: "A-045", name: "Traoré Aminata", time: "10:30", wait: "12 min", priority: "high", type: "Handicap", avatar: "TA" },
        { id: 2, ticket: "A-046", name: "Koffi Michel", time: "10:32", wait: "10 min", priority: "normal", type: "Standard", avatar: "KM" },
        { id: 3, ticket: "B-015", name: "Soro Guillaume", time: "10:35", wait: "7 min", priority: "normal", type: "Standard", avatar: "SG" },
        { id: 4, ticket: "A-047", name: "Diallo Ousmane", time: "10:38", wait: "4 min", priority: "vip", type: "VIP", avatar: "DO" },
        { id: 5, ticket: "C-003", name: "Bakayoko Aïcha", time: "10:40", wait: "2 min", priority: "normal", type: "Standard", avatar: "BA" },
        { id: 6, ticket: "A-048", name: "Client Anonyme", time: "10:41", wait: "1 min", priority: "normal", type: "Standard", avatar: null },
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
                            <p className="text-xs text-slate-400">Files d'attente</p>
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
                        <h2 className="text-2xl font-black text-gray-900">Files d'attente</h2>
                        <p className="text-sm text-gray-500">Gestion en temps réel des files d'attente</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un ticket..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
                            />
                        </div>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-medium text-gray-500 mb-1">Total en attente</p>
                                <p className="text-3xl font-black text-gray-900">24</p>
                                <div className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1">
                                    +12% <span className="text-gray-400 font-normal">vs hier</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-medium text-gray-500 mb-1">Temps moyen</p>
                                <p className="text-3xl font-black text-gray-900">15 min</p>
                                <div className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1">
                                    -2 min <span className="text-gray-400 font-normal">vs hier</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-medium text-gray-500 mb-1">Prochain appel</p>
                                <p className="text-3xl font-black text-primary">~2 min</p>
                                <div className="mt-2 text-xs font-bold text-gray-400">
                                    Estimé par IA
                                </div>
                            </div>
                        </div>

                        {/* Queue List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900">File d'attente principale</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter("all")}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-slate-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        Tout
                                    </button>
                                    <button
                                        onClick={() => setFilter("vip")}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "vip" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        VIP
                                    </button>
                                    <button
                                        onClick={() => setFilter("handicap")}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "handicap" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        Prioritaire
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {queueItems.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-900 text-lg border border-gray-200">
                                                {item.ticket}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {item.avatar ? (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                        {item.avatar}
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.priority === 'high' ? 'bg-blue-100 text-blue-700' :
                                                                item.priority === 'vip' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {item.type}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Arrivé à {item.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Attente</p>
                                                <p className="text-lg font-black text-gray-900">{item.wait}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-primary hover:border-primary hover:text-white transition-colors text-gray-500 shadow-sm">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 shadow-sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                                <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                                    Voir toute la file d'attente
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
