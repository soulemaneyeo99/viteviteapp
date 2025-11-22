"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, Settings, Ticket } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Detect scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Get user from localStorage
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const userRole = localStorage.getItem("user_role");
        const userEmail = localStorage.getItem("user_email");
        if (token) {
            setUser({ role: userRole, email: userEmail });
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_email");
        router.push("/auth");
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/95 backdrop-blur-md shadow-lg"
                    : "bg-white border-b border-gray-100"
                }`}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 sm:space-x-3 group"
                    >
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                            <span className="text-lg sm:text-xl text-white font-bold">⚡</span>
                        </div>
                        <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight hidden xs:block">
                            ViteViteApp
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {user ? (
                            <>
                                <Link
                                    href="/services"
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${isActive("/services")
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    Services
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${isActive("/dashboard")
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    Mes tickets
                                </Link>
                                {(user.role === "admin" || user.role === "super") && (
                                    <Link
                                        href="/admin"
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${isActive("/admin") || pathname?.startsWith("/admin")
                                                ? "bg-orange-50 text-orange-600"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        <Settings className="w-4 h-4 inline mr-1.5" />
                                        Admin
                                    </Link>
                                )}

                                {/* User Menu */}
                                <div className="relative group ml-2">
                                    <button className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden lg:block">
                                            {user.email}
                                        </span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                                {user.role || "Citoyen"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/services"
                                    className="px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                                >
                                    Services
                                </Link>
                                <Link
                                    href="/auth"
                                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Connexion
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-900" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-900" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen
                            ? "max-h-screen opacity-100 pb-6"
                            : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                >
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        {user ? (
                            <>
                                <Link
                                    href="/services"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-xl font-semibold transition-all ${isActive("/services")
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <Ticket className="w-4 h-4 inline mr-2" />
                                    Services
                                </Link>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-xl font-semibold transition-all ${isActive("/dashboard")
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <User className="w-4 h-4 inline mr-2" />
                                    Mes tickets
                                </Link>
                                {(user.role === "admin" || user.role === "super") && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-semibold transition-all ${isActive("/admin") || pathname?.startsWith("/admin")
                                                ? "bg-orange-50 text-orange-600"
                                                : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Settings className="w-4 h-4 inline mr-2" />
                                        Admin
                                    </Link>
                                )}

                                <div className="pt-4 border-t border-gray-100 mt-4">
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                        Connecté en tant que
                                    </div>
                                    <div className="px-4 py-2 text-sm font-semibold text-gray-900 truncate">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full mt-2 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Déconnexion
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/services"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                                >
                                    Services
                                </Link>
                                <Link
                                    href="/auth"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all text-center"
                                >
                                    Connexion
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
