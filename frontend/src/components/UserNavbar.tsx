'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Ticket, ChevronRight } from 'lucide-react';

export default function UserNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userRole = localStorage.getItem('user_role');
        const userEmail = localStorage.getItem('user_email');
        if (token) {
            setUser({ role: userRole, email: userEmail });
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/auth');
    };

    const isActive = (path: string) => pathname === path;

    // Don't show UserNavbar on admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const isHomePage = pathname === '/';
    const showSolidBackground = isScrolled || !isHomePage;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showSolidBackground ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50' : 'bg-transparent'
                }`}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                            V
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                            ViteViteApp
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/services"
                            className={`text-sm font-medium transition-colors ${isActive('/services') ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Services
                        </Link>
                        <Link
                            href="/marketplace"
                            className={`text-sm font-medium transition-colors ${isActive('/marketplace') ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Marketplace
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-orange-600' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Mes Tickets
                                </Link>

                                <div className="h-6 w-px bg-slate-200"></div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500">Connecté en tant que</div>
                                        <div className="text-sm font-semibold text-slate-900 max-w-[150px] truncate">{user.email}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Déconnexion"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/auth"
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth?mode=register"
                                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2"
                                >
                                    S'inscrire
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-5 duration-200">
                    <div className="p-4 space-y-2">
                        <Link
                            href="/services"
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/services') ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Ticket className="w-5 h-5" />
                            Services
                        </Link>
                        <Link
                            href="/marketplace"
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/marketplace') ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span className="text-lg">🛍️</span>
                            Marketplace
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/dashboard') ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                    Mes Tickets
                                </Link>
                                <div className="pt-4 mt-4 border-t border-slate-100">
                                    <div className="px-4 mb-4">
                                        <div className="text-xs text-slate-500">Connecté en tant que</div>
                                        <div className="font-medium text-slate-900 truncate">{user.email}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Déconnexion
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                                <Link
                                    href="/auth"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center px-4 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth?mode=register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center px-4 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
