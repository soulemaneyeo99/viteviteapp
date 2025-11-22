'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Ticket,
    Settings,
    LogOut,
    BarChart3
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
        { path: '/admin/tickets', icon: Ticket, label: 'Tickets' },
        { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytiques' },
        { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo Area */}
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold">
                        V
                    </div>
                    <span className="font-bold text-lg tracking-tight">ViteViteApp</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}
