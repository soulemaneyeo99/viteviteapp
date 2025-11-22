'use client';

import { useState } from 'react';
import { Bell, Search, User, Plus, Menu } from 'lucide-react';
import CreateTicketModal from './CreateTicketModal';

export default function AdminHeader({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    return (
        <>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {/* Search Bar */}
                    <div className="relative hidden md:block">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-64 transition-all"
                        />
                    </div>

                    {/* New Ticket Button */}
                    <button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau Ticket</span>
                    </button>

                    {/* Mobile Plus Button */}
                    <button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="sm:hidden p-2 bg-orange-500 text-white rounded-full shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden lg:block">
                                <div className="text-sm font-semibold text-slate-900">Administrateur</div>
                                <div className="text-xs text-slate-500">admin@vitevite.ci</div>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                <User className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <CreateTicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
            />
        </>
    );
}
