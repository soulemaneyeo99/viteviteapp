"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { servicesAPI, ticketsAPI } from "@/lib/api";
import axios from "axios";
import {
    LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings,
    LogOut, Search, Plus, Bell, AlertTriangle, Clock, CheckCircle2, Activity
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ServiceControlCenter() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch service data
    const { data: serviceData } = useQuery({
        queryKey: ["service", serviceId],
        queryFn: async () => {
            const response = await servicesAPI.getById(serviceId);
            return response.data;
        },
    });

    // Fetch dashboard stats
    const { data: statsData } = useQuery({
        queryKey: ["service-stats", serviceId],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_URL}/api/v1/admin/dashboard/stats`, {
                    params: { service_id: serviceId },
                    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
                });
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    window.location.href = "/auth";
                }
                throw error;
            }
        },
        refetchInterval: 10000,
    });

    // Fetch recent tickets
    const { data: ticketsData } = useQuery({
        queryKey: ["service-tickets", serviceId],
        queryFn: async () => {
            const response = await ticketsAPI.getAll({ service_id: serviceId, limit: 10 });
            return response.data;
        },
        refetchInterval: 10000,
    });

    const service = serviceData?.service;
    const stats = statsData?.overview || {};
    const alerts = statsData?.alerts || [];
    const tickets = ticketsData?.tickets || [];

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}`, active: true },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters` },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue` },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets` },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users` },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics` },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings` },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Dark Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link href="/admin" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-xl">⚡</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-white">ViteViteApp</h1>
                            <p className="text-xs text-slate-400">{service?.name || "Service"}</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
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

                {/* Logout */}
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
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Centre de Contrôle</h2>
                            <p className="text-sm text-gray-500">Gestion en temps réel de {service?.name}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* View Public Page */}
                            <Link
                                href={`/administrations/${service?.administration_id || 'admin'}/services/${serviceId}`}
                                target="_blank"
                                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Activity className="w-4 h-4" />
                                <span>Voir Public</span>
                            </Link>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            {/* New Ticket Button */}
                            <button className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" />
                                <span>Nouveau Ticket</span>
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                                {alerts.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Admin Info */}
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-gray-600">A</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Administrateur</p>
                                    <p className="text-xs text-gray-500">admin@vitevite.ci</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {/* Alerts Section */}
                    {alerts.length > 0 && (
                        <div className="mb-8 space-y-3">
                            {alerts.map((alert: any, index: number) => (
                                <div
                                    key={index}
                                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 ${alert.type === "surcharge"
                                        ? "bg-red-50 border-red-200 text-red-800"
                                        : "bg-yellow-50 border-yellow-200 text-yellow-800"
                                        }`}
                                >
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{alert.message}</p>
                                        {alert.suggestion && (
                                            <p className="text-xs mt-1 opacity-80">{alert.suggestion}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={Users}
                            label="En attente"
                            value={stats.waiting_count || 0}
                            color="orange"
                            trend="+0%"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Traités ce jour"
                            value={stats.completed_today || 0}
                            color="green"
                            trend="+0%"
                        />
                        <StatCard
                            icon={Clock}
                            label="Attente moyenne"
                            value={`${stats.average_wait_time || 0} min`}
                            color="blue"
                            trend="+0%"
                        />
                        <StatCard
                            icon={Activity}
                            label="Agents actifs"
                            value={stats.active_agents || 0}
                            color="purple"
                            trend="+0%"
                        />
                    </div>

                    {/* Recent Tickets Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Tickets récents</h3>
                                <p className="text-sm text-gray-500">Dernières activités sur la plateforme</p>
                            </div>
                            <Link
                                href={`/admin/services/${serviceId}/tickets`}
                                className="text-sm font-bold text-primary hover:text-primary-dark hover:underline"
                            >
                                Voir tout
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            ID Ticket
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Utilisateur
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Temps
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                Aucun ticket récent
                                            </td>
                                        </tr>
                                    ) : (
                                        tickets.map((ticket: any) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                                    {ticket.ticket_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-bold text-gray-600 uppercase">
                                                                {(ticket.user_name || "?").charAt(0)}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-gray-700">
                                                            {ticket.user_name || "Anonyme"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {service?.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={ticket.status} />
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">
                                                    Il y a {ticket.estimated_wait_time} min
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                        •••
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
    const colorClasses = {
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        green: "bg-green-50 text-green-600 border-green-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-green-600">{trend}</span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, { label: string; className: string }> = {
        en_attente: { label: "En attente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
        en_attente_validation: { label: "Validation", className: "bg-blue-50 text-blue-700 border-blue-200" },
        appelé: { label: "Appelé", className: "bg-green-50 text-green-700 border-green-200" },
        en_service: { label: "En cours", className: "bg-blue-50 text-blue-700 border-blue-200" },
        terminé: { label: "Terminé", className: "bg-gray-50 text-gray-700 border-gray-200" },
        annulé: { label: "Annulé", className: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = statusMap[status] || statusMap.en_attente;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.className}`}>
            {config.label}
        </span>
    );
}
