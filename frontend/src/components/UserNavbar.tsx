'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Ticket, ChevronRight, LayoutGrid, AlertCircle } from 'lucide-react';

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
    // Enhanced glassmorphism effect
    const navbarClasses = isScrolled || !isHomePage
        ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 supports-[backdrop-filter]:bg-white/60'
        : 'bg-transparent';

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${navbarClasses}`}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-orange-500/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 opacity-50"></div>
                            <span className="relative text-white font-bold text-xl">V</span>
                        </div>
                        <span className={`text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 ${!isScrolled && isHomePage ? 'text-slate-900' : ''}`}>
                            ViteViteApp
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/urgences"
                            className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 flex items-center gap-2 group"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            Urgences
                        </Link>

                        <Link
                            href="/services"
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive('/services')
                                    ? 'bg-orange-50 text-orange-600 font-semibold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            Services
                        </Link>

                        <Link
                            href="/transport"
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive('/transport')
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            Transport
                        </Link>

                        <Link
                            href="/pharmacies"
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive('/pharmacies')
                                    ? 'bg-emerald-50 text-emerald-600 font-semibold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            Pharmacies
                        </Link>

                        <div className="h-6 w-px bg-slate-200 mx-2"></div>

                        {user ? (
                            <div className="flex items-center gap-3 pl-2">
                                <Link
                                    href="/dashboard"
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive('/dashboard')
                                            ? 'bg-slate-100 text-slate-900 font-semibold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    Mes Tickets
                                </Link>

                                <div className="group relative">
                                    <button className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center text-orange-600 font-bold border border-white shadow-sm">
                                            {user.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
                                            {user.email?.split('@')[0]}
                                        </span>
                                    </button>

                                    {/* Dropdown Logout */}
                                    <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                        <div className="px-4 py-2 border-b border-slate-50">
                                            <p className="text-xs text-slate-500">Connecté en tant que</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-2">
                                <Link
                                    href="/auth"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth?mode=register"
                                    className="group px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 flex items-center gap-2"
                                >
                                    S'inscrire
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                        aria-label="Menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-2xl animate-in slide-in-from-top-5 duration-300 ease-out">
                    <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto">
                        <Link
                            href="/urgences"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            <AlertCircle className="w-5 h-5" />
                            Urgences
                        </Link>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/services"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all ${isActive('/services') ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <LayoutGrid className="w-6 h-6" />
                                Services
                            </Link>

                            <Link
                                href="/transport"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all ${isActive('/transport') ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="text-xl">🚌</span>
                                Transport
                            </Link>

                            <Link
                                href="/pharmacies"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all ${isActive('/pharmacies') ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="text-xl">💊</span>
                                Pharmacies
                            </Link>

                            {user && (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all ${isActive('/dashboard') ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <Ticket className="w-6 h-6" />
                                    Tickets
                                </Link>
                            )}
                        </div>

                        {user ? (
                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 px-2 mb-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                        {user.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-slate-500">Connecté en tant que</div>
                                        <div className="font-semibold text-slate-900 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                                <Link
                                    href="/auth"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center justify-center px-4 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth?mode=register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center justify-center px-4 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
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
