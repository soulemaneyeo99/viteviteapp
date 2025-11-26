"use client";

import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Ticket, BarChart3, Settings, LogOut, Save, Bell, Shield, Clock, Palette } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ServiceSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;
    const [isLoading, setIsLoading] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: "Tableau de bord", href: `/admin/services/${serviceId}` },
        { icon: Users, label: "Guichets", href: `/admin/services/${serviceId}/counters` },
        { icon: ListChecks, label: "Files d'attente", href: `/admin/services/${serviceId}/queue` },
        { icon: Ticket, label: "Tickets", href: `/admin/services/${serviceId}/tickets` },
        { icon: Users, label: "Utilisateurs", href: `/admin/services/${serviceId}/users` },
        { icon: BarChart3, label: "Analytiques", href: `/admin/services/${serviceId}/analytics` },
        { icon: Settings, label: "Paramètres", href: `/admin/services/${serviceId}/settings`, active: true },
    ];

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Paramètres enregistrés avec succès");
        }, 1000);
    };

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
                            <p className="text-xs text-slate-400">Paramètres</p>
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
                        <h2 className="text-2xl font-black text-gray-900">Configuration</h2>
                        <p className="text-sm text-gray-500">Gérez les paramètres de votre service</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? (
                            <>Enregistrement...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* General Settings */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Informations Générales</h3>
                                        <p className="text-xs text-gray-500">Détails visibles par les utilisateurs</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Nom du Service</label>
                                        <input type="text" defaultValue="État Civil" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Code Service</label>
                                        <input type="text" defaultValue="EC-01" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Description</label>
                                    <textarea rows={3} defaultValue="Service chargé de l'enregistrement des naissances, mariages et décès." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                                </div>
                            </div>
                        </section>

                        {/* Opening Hours */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Horaires d'ouverture</h3>
                                        <p className="text-xs text-gray-500">Définissez les plages de disponibilité</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => (
                                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="font-medium text-gray-700 w-24">{day}</span>
                                        <div className="flex items-center gap-4">
                                            <input type="time" defaultValue="08:00" className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                            <span className="text-gray-400">-</span>
                                            <input type="time" defaultValue="16:30" className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Notifications & Branding */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Alerte SMS Client</span>
                                        <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Email Récapitulatif</span>
                                        <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                            <Palette className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Apparence</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Couleur Principale</label>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500 ring-2 ring-offset-2 ring-orange-500 cursor-pointer"></div>
                                            <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer hover:opacity-80"></div>
                                            <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer hover:opacity-80"></div>
                                            <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer hover:opacity-80"></div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
