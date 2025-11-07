import { useState } from 'react';
import { Menu, X, Home, Briefcase, ShoppingBag, BarChart3, Settings, MessageCircle } from 'lucide-react';

export default function ViteviteLayout() {
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
      {/* Header avec Navigation Mobile Fixed */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-gray-900">ViteVite</h1>
                <p className="text-xs text-gray-700 font-semibold">Smart Queue</p>
              </div>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-900 hover:bg-white/40 transition-all font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>

            {/* Bouton Menu Mobile - FIXED */}
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

        {/* Menu Mobile Dropdown - FIXED avec overlay */}
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
                  <a
                    key={idx}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-all font-medium text-gray-900"
                  >
                    <item.icon className="w-5 h-5 text-yellow-600" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Corrections Appliquées
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-gray-900">Navigation Mobile Fixed</h3>
                <p className="text-sm text-gray-600">
                  Bouton burger qui change en X, menu qui se ferme au clic extérieur avec overlay
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-gray-900">ChatBot Centré (voir ci-dessous)</h3>
                <p className="text-sm text-gray-600">
                  Positionnement responsive avec width adaptatif selon écran
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-gray-900">Markdown Support</h3>
                <p className="text-sm text-gray-600">
                  Rendu progressif avec react-markdown et animations
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-gray-900">ElevenLabs Voice</h3>
                <p className="text-sm text-gray-600">
                  TTS/STT avec voix francophone Anicet optimisée
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon="🎫" value="247" label="Tickets actifs" color="from-blue-500 to-blue-600" />
          <StatCard icon="⏱️" value="12 min" label="Attente moyenne" color="from-green-500 to-green-600" />
          <StatCard icon="📊" value="98.5%" label="Satisfaction" color="from-purple-500 to-purple-600" />
        </div>
      </main>

      {/* ChatBot Button - FIXED Mobile */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-40 flex items-center justify-center"
        aria-label="Ouvrir le chat"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* ChatBot Window - FIXED Mobile Responsive */}
      {isChatOpen && (
        <>
          {/* Overlay mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleChat}
          />
          
          {/* Fenêtre chat - Responsive */}
          <div className="fixed inset-x-4 bottom-24 lg:right-6 lg:bottom-6 lg:left-auto lg:w-96 z-50 animate-slideIn">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[70vh] lg:h-[600px] overflow-hidden">
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
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <ChatMessage 
                  role="assistant"
                  content="Bonjour ! 👋 Je suis l'assistant ViteviteApp. Comment puis-je vous aider ?"
                />
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
        <div className="container mx-auto px-4 text-center">
          <div className="text-yellow-400 font-bold text-xl mb-2">⚡ ViteviteApp</div>
          <p className="text-gray-400 text-sm">
            © 2024 Porté par Soura Aminata - Fait avec ❤️ en Côte d'Ivoire
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl`}>
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

function ChatMessage({ role, content }: { role: string; content: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
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