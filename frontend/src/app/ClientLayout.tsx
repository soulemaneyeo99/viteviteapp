// Fichier: frontend/src/app/ClientLayout.tsx
// NOUVEAU FICHIER À CRÉER dans frontend/src/app/

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Briefcase, ShoppingBag, BarChart3, Settings, MessageCircle } from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { icon: Home, label: 'Accueil', href: '/' },
    { icon: Briefcase, label: 'Services', href: '/services' },
    { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Admin', href: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec Navigation */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900">ViteVite</h1>
                <p className="text-xs text-gray-700 font-semibold">Smart Queue</p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-900 hover:bg-white/40 transition-all font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Bouton Menu Mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all z-50 relative"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <>
            {/* Overlay pour fermer au clic extérieur */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMenu}
            />
            
            {/* Menu */}
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl z-50 border-t-4 border-yellow-500">
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-all font-medium text-gray-900"
                  >
                    <item.icon className="w-5 h-5 text-yellow-600" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* ChatBot Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-40 flex items-center justify-center"
        aria-label="Ouvrir le chat"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* ChatBot Window */}
      {isChatOpen && (
        <>
          {/* Overlay mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleChat}
          />
          
          {/* Fenêtre chat - Responsive */}
          <div className="fixed inset-x-4 bottom-24 lg:right-6 lg:bottom-6 lg:left-auto lg:w-96 z-50">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[70vh] lg:h-[600px] overflow-hidden animate-slideIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Assistant ViteviteApp</h3>
                    <div className="flex items-center space-x-1 text-xs">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                <ChatMessage 
                  role="assistant"
                  content="Bonjour ! 👋 Je suis l'assistant ViteviteApp. Comment puis-je vous aider ?"
                />
                <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
                  <p className="text-sm text-purple-900 font-semibold mb-2">💡 Questions fréquentes</p>
                  <div className="space-y-2 text-xs">
                    <button className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-purple-100 transition">
                      Comment prendre un ticket ?
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-purple-100 transition">
                      Quels documents pour la mairie ?
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-purple-100 transition">
                      Comment fonctionne la marketplace ?
                    </button>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Votre question..."
                    className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition">
                    <span className="text-xl">🚀</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* À propos */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                ViteviteApp
              </h3>
              <p className="text-gray-400 text-sm">
                Solution intelligente de gestion des files d'attente avec marketplace intégrée.
              </p>
            </div>

            {/* Liens rapides */}
            <div>
              <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-yellow-400 transition">Accueil</Link></li>
                <li><Link href="/services" className="hover:text-yellow-400 transition">Services</Link></li>
                <li><Link href="/marketplace" className="hover:text-yellow-400 transition">Marketplace</Link></li>
                <li><Link href="/analytics" className="hover:text-yellow-400 transition">Analytics</Link></li>
              </ul>
            </div>

            {/* Fonctionnalités */}
            <div>
              <h4 className="text-white font-semibold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center"><span className="mr-2">✅</span>Files virtuelles</li>
                <li className="flex items-center"><span className="mr-2">🛍️</span>Marketplace</li>
                <li className="flex items-center"><span className="mr-2">🤖</span>IA Prédictive</li>
                <li className="flex items-center"><span className="mr-2">📊</span>Analytics</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <span className="mr-2">📧</span>contact@viteviteapp.ci
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📱</span>+225 XX XX XX XX
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📍</span>Abidjan, CI
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 ViteviteApp. Porté par Soura Aminata. Fait avec ❤️ en Côte d'Ivoire
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Composant Message du Chat
function ChatMessage({ role, content }: { role: string; content: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        role === 'user' 
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
          : 'bg-white border border-gray-200 text-gray-900'
      }`}>
        {role === 'assistant' && (
          <div className="flex items-center space-x-2 mb-2">
            <span>🤖</span>
            <span className="text-xs font-semibold text-gray-500">Assistant IA</span>
          </div>
        )}
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}