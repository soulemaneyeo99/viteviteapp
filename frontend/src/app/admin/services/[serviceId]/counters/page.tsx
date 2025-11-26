"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings, LogOut, User, Monitor, Clock, Power, MoreVertical, Mic } from "lucide-react";
import Link from "next/link";

export default function ServiceCountersPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}` },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters`, active: true },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue` },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets` },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users` },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics` },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings` },
    ];

    // Hardcoded Counters Data
    const counters = [
        { id: 1, name: "Guichet 01", agent: "Kouamé Sarah", status: "open", currentTicket: "A-042", time: "05:23", avatar: "KS" },
        { id: 2, name: "Guichet 02", agent: "Diop Moussa", status: "open", currentTicket: "A-043", time: "02:15", avatar: "DM" },
        { id: 3, name: "Guichet 03", agent: "Yao Jean", status: "break", currentTicket: "--", time: "12:00", avatar: "YJ" },
        { id: 4, name: "Guichet 04", agent: "Non assigné", status: "closed", currentTicket: "--", time: "--", avatar: null },
        { id: 5, name: "Guichet 05", agent: "Koné Awa", status: "open", currentTicket: "B-012", time: "08:45", avatar: "KA" },
        { id: 6, name: "Guichet 06", agent: "Non assigné", status: "closed", currentTicket: "--", time: "--", avatar: null },
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
                            <p className="text-xs text-slate-400">Gestion Guichets</p>
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
                        <h2 className="text-2xl font-black text-gray-900">Gestion des Guichets</h2>
                        <p className="text-sm text-gray-500">Vue d'ensemble et contrôle des guichets</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                        + Ajouter un guichet
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {counters.map((counter) => (
                                <div key={counter.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    {/* Card Header */}
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${counter.status === 'open' ? 'bg-green-50 text-green-600' :
                                                    counter.status === 'break' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-gray-50 text-gray-400'
                                                }`}>
                                                <Monitor className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{counter.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`w-2 h-2 rounded-full ${counter.status === 'open' ? 'bg-green-500' :
                                                            counter.status === 'break' ? 'bg-orange-500' :
                                                                'bg-gray-300'
                                                        }`}></span>
                                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                                        {counter.status === 'open' ? 'En ligne' :
                                                            counter.status === 'break' ? 'En pause' : 'Fermé'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                {counter.avatar ? (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm">
                                                        {counter.avatar}
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{counter.agent}</p>
                                                    <p className="text-xs text-gray-500">Agent assigné</p>
                                                </div>
                                            </div>
                                            {counter.status === 'open' && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Durée</p>
                                                    <p className="text-sm font-mono font-bold text-gray-900 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {counter.time}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`rounded-xl p-4 flex justify-between items-center ${counter.status === 'open' ? 'bg-primary/5 border border-primary/10' : 'bg-gray-50 border border-gray-100'
                                            }`}>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ticket en cours</p>
                                                <p className={`text-2xl font-black ${counter.status === 'open' ? 'text-primary' : 'text-gray-300'
                                                    }`}>
                                                    {counter.currentTicket}
                                                </p>
                                            </div>
                                            {counter.status === 'open' && (
                                                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                                    <Mic className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                        {counter.status === 'closed' ? (
                                            <button className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                                                Ouvrir le guichet
                                            </button>
                                        ) : (
                                            <>
                                                <button className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                                                    Appeler suivant
                                                </button>
                                                <button className="w-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
