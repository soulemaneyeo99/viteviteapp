// Fichier: frontend/src/app/layout.tsx (VERSION MISE À JOUR)

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ViteviteApp - Gestion intelligente des files d\'attente',
  description: 'Éliminez le stress et la perte de temps liés aux files d\'attente. Marketplace intégrée, Analytics IA, et bien plus.',
  keywords: 'file d\'attente, Côte d\'Ivoire, Abidjan, marketplace, services publics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-[#FFD43B] shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">ViteVite</h1>
                    <p className="text-xs text-gray-700">Smart Queue Management</p>
                  </div>
                </Link>

                {/* Navigation Desktop */}
                <div className="hidden md:flex items-center space-x-1">
                  <NavLink href="/" label="Accueil" />
                  <NavLink href="/services" label="Services" />
                  <NavLink href="/marketplace" label="🛍️ Marketplace" />
                  <NavLink href="/analytics" label="📊 Analytics" />
                  <Link 
                    href="/admin" 
                    className="ml-2 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition font-semibold shadow-md"
                  >
                    Admin
                  </Link>
                </div>

                {/* Bouton Menu Mobile */}
                <button className="md:hidden p-2 rounded-lg bg-gray-900 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Navigation Mobile */}
              <div className="md:hidden mt-4 space-y-2">
                <MobileNavLink href="/" label="Accueil" />
                <MobileNavLink href="/services" label="Services" />
                <MobileNavLink href="/marketplace" label="🛍️ Marketplace" />
                <MobileNavLink href="/analytics" label="📊 Analytics" />
                <MobileNavLink href="/admin" label="Admin" />
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* À propos */}
                <div>
                  <h3 className="text-[#FFD43B] font-bold text-lg mb-4 flex items-center">
                    <span className="mr-2">⚡</span>
                    ViteviteApp
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Solution intelligente de gestion des files d'attente avec marketplace intégrée et analytics IA.
                  </p>
                </div>

                {/* Liens rapides */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link href="/" className="hover:text-[#FFD43B] transition">Accueil</Link></li>
                    <li><Link href="/services" className="hover:text-[#FFD43B] transition">Nos services</Link></li>
                    <li><Link href="/marketplace" className="hover:text-[#FFD43B] transition">Marketplace</Link></li>
                    <li><Link href="/analytics" className="hover:text-[#FFD43B] transition">Analytics</Link></li>
                    <li><Link href="/admin" className="hover:text-[#FFD43B] transition">Dashboard Admin</Link></li>
                  </ul>
                </div>

                {/* Fonctionnalités */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Fonctionnalités</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center">
                      <span className="mr-2">✅</span>
                      Files d'attente virtuelles
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🛍️</span>
                      Marketplace intégrée
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🤖</span>
                      Prédictions IA
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📊</span>
                      Analytics avancés
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🔔</span>
                      Notifications push
                    </li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center">
                      <span className="mr-2">📧</span>
                      contact@viteviteapp.ci
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📱</span>
                      +225 XX XX XX XX XX
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">📍</span>
                      Abidjan, Côte d'Ivoire
                    </li>
                  </ul>
                  
                  {/* Réseaux sociaux */}
                  <div className="flex space-x-3 mt-4">
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFD43B] hover:text-gray-900 transition">
                      <span className="text-xs">f</span>
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFD43B] hover:text-gray-900 transition">
                      <span className="text-xs">X</span>
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFD43B] hover:text-gray-900 transition">
                      <span className="text-xs">in</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-gray-800 mt-8 pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
                  <p>© 2024 ViteviteApp. Porté par Soura Aminata. Tous droits réservés.</p>
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-[#FFD43B] transition">Politique de confidentialité</a>
                    <a href="#" className="hover:text-[#FFD43B] transition">CGU</a>
                    <a href="#" className="hover:text-[#FFD43B] transition">FAQ</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

// Composant NavLink pour desktop
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="px-4 py-2 text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all duration-200"
    >
      {label}
    </Link>
  );
}

// Composant NavLink pour mobile
function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="block px-4 py-2 text-gray-900 bg-white/50 hover:bg-white rounded-lg font-medium transition-all duration-200"
    >
      {label}
    </Link>
  );
}