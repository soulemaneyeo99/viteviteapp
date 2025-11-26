"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings, LogOut, TrendingUp, TrendingDown, Clock, ThumbsUp } from "lucide-react";
import Link from "next/link";
import AffluenceChart from "@/components/charts/AffluenceChart";
import { formatDuration } from "@/lib/utils";

export default function ServiceAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}` },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters` },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue` },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets` },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users` },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics`, active: true },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings` },
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
                            <p className="text-xs text-slate-400">Analytiques</p>
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
                <header className="bg-white border-b border-gray-200 px-8 py-4">
                    <h2 className="text-2xl font-black text-gray-900">Analytiques & Rapports</h2>
                    <p className="text-sm text-gray-500">Statistiques détaillées et indicateurs de performance</p>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                        +12% <TrendingUp className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Visiteurs Total</p>
                                <h3 className="text-3xl font-black text-gray-900">1,248</h3>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                        -5% <TrendingDown className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Attente Moyenne</p>
                                <h3 className="text-3xl font-black text-gray-900">{formatDuration(14.5)}</h3>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                        +8% <TrendingUp className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Tickets Traités</p>
                                <h3 className="text-3xl font-black text-gray-900">856</h3>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                        <ThumbsUp className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                        Stable
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                                <h3 className="text-3xl font-black text-gray-900">4.8/5</h3>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-2">
                                <AffluenceChart
                                    type="global"
                                    title="Affluence Hebdomadaire"
                                    subtitle="Comparaison avec la semaine dernière"
                                    className="h-full"
                                />
                            </div>
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-6">Répartition par Motif</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">État Civil</span>
                                            <span className="font-bold text-gray-900">45%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[45%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">Légalisation</span>
                                            <span className="font-bold text-gray-900">30%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[30%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">Réclamations</span>
                                            <span className="font-bold text-gray-900">15%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 w-[15%] rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-gray-700">Autres</span>
                                            <span className="font-bold text-gray-900">10%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gray-400 w-[10%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-sm text-gray-900 mb-2">Insight IA 🤖</h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        L'affluence pour "État Civil" augmente de 15% le lundi matin. Pensez à renforcer l'équipe entre 8h et 11h.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
