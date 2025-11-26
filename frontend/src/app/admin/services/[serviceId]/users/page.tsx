"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings, LogOut, Search, Plus, MoreVertical, Mail, Phone, Shield } from "lucide-react";
import Link from "next/link";

export default function ServiceUsersPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}` },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters` },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue` },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets` },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users`, active: true },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics` },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings` },
    ];

    // Hardcoded Users Data
    const users = [
        { id: 1, name: "Administrateur Principal", role: "Admin", email: "admin@vitevite.ci", phone: "07 07 07 07 07", status: "active", avatar: "AD", tickets: 1240, rating: 5.0 },
        { id: 2, name: "Kouamé Sarah", role: "Agent", email: "sarah.k@vitevite.ci", phone: "01 02 03 04 05", status: "active", avatar: "KS", tickets: 856, rating: 4.8 },
        { id: 3, name: "Diop Moussa", role: "Agent", email: "moussa.d@vitevite.ci", phone: "05 04 03 02 01", status: "active", avatar: "DM", tickets: 743, rating: 4.7 },
        { id: 4, name: "Koné Awa", role: "Agent", email: "awa.k@vitevite.ci", phone: "01 01 01 01 01", status: "active", avatar: "KA", tickets: 621, rating: 4.9 },
        { id: 5, name: "Yao Jean", role: "Superviseur", email: "jean.y@vitevite.ci", phone: "02 02 02 02 02", status: "away", avatar: "YJ", tickets: 432, rating: 4.6 },
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
                            <p className="text-xs text-slate-400">Utilisateurs</p>
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
                        <h2 className="text-2xl font-black text-gray-900">Gestion de l'équipe</h2>
                        <p className="text-sm text-gray-500">Gérez les accès et les performances des agents</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Ajouter un membre
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((user) => (
                                <div key={user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-700 border-4 border-white shadow-sm">
                                                {user.avatar}
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{user.name}</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'Superviseur' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-orange-500'
                                                }`}></span>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {user.phone}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Tickets</p>
                                                <p className="text-lg font-black text-gray-900">{user.tickets}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Note</p>
                                                <p className="text-lg font-black text-yellow-500 flex items-center gap-1">
                                                    {user.rating} <span className="text-xs text-gray-300">/5</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium text-gray-500">Dernière connexion: 2 min</span>
                                        <button className="text-xs font-bold text-primary hover:underline">Voir profil</button>
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
