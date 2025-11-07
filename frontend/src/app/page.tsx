import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Users, TrendingUp, MapPin, Sparkles, Bell, Search, Filter, ChevronRight, Calendar, Phone, MessageSquare, ShoppingBag, Zap } from 'lucide-react';

const ViteviteDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [services, setServices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Données simulées enrichies
  useEffect(() => {
    setServices([
      {
        id: 1,
        name: 'Mairie - État Civil',
        category: 'Administration',
        icon: '🏛️',
        status: 'open',
        waitTime: 25,
        queueSize: 8,
        affluence: 'low',
        trend: 'decreasing',
        location: 'Cocody, Abidjan',
        rating: 4.5,
        aiPrediction: 'Meilleur moment: 14h-16h',
        nextAvailable: '10 min',
        services: ['Carte d\'identité', 'Acte de naissance', 'Certificat'],
        popularityScore: 85
      },
      {
        id: 2,
        name: 'Banque Atlantique',
        category: 'Banque',
        icon: '🏦',
        status: 'open',
        waitTime: 45,
        queueSize: 15,
        affluence: 'moderate',
        trend: 'stable',
        location: 'Plateau, Abidjan',
        rating: 4.2,
        aiPrediction: 'Pic d\'affluence jusqu\'à 11h',
        nextAvailable: '35 min',
        services: ['Virements', 'Ouverture compte', 'Retraits'],
        popularityScore: 92
      },
      {
        id: 3,
        name: 'CHU Treichville',
        category: 'Santé',
        icon: '🏥',
        status: 'open',
        waitTime: 65,
        queueSize: 23,
        affluence: 'high',
        trend: 'increasing',
        location: 'Treichville, Abidjan',
        rating: 4.7,
        aiPrediction: 'Très occupé - attendre 17h',
        nextAvailable: '1h 15min',
        services: ['Consultations', 'Urgences', 'Radiologie'],
        popularityScore: 96
      },
      {
        id: 4,
        name: 'DGI - Impôts',
        category: 'Administration',
        icon: '💼',
        status: 'open',
        waitTime: 30,
        queueSize: 10,
        affluence: 'moderate',
        trend: 'stable',
        location: 'Plateau, Abidjan',
        rating: 3.8,
        aiPrediction: 'Affluence normale',
        nextAvailable: '20 min',
        services: ['Déclarations', 'Paiements', 'Attestations'],
        popularityScore: 78
      }
    ]);

    setNotifications([
      { id: 1, type: 'ticket', message: 'Votre ticket N-042 approche', time: '2 min', urgent: true },
      { id: 2, type: 'promo', message: 'Nouvelle marketplace disponible', time: '10 min', urgent: false },
      { id: 3, type: 'update', message: 'Mairie Cocody: temps réduit', time: '1h', urgent: false }
    ]);
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(services.map(s => s.category))];

  const stats = {
    activeTickets: 142,
    avgWaitTime: 38,
    servicesOpen: 24,
    usersSaved: '2,450h'
  };

  const getAffluenceColor = (level) => {
    const colors = {
      low: 'from-green-400 to-emerald-500',
      moderate: 'from-yellow-400 to-orange-500',
      high: 'from-orange-500 to-red-500',
      very_high: 'from-red-500 to-pink-600'
    };
    return colors[level] || colors.low;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header moderne avec gradient */}
      <header className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <Zap className="w-7 h-7 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">ViteVite</h1>
                <p className="text-xs font-semibold text-gray-800">Smart Queue Management</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {['home', 'services', 'marketplace', 'analytics'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-white text-yellow-600 shadow-lg'
                      : 'text-gray-800 hover:bg-white/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2.5 bg-white/90 rounded-xl hover:bg-white transition-all shadow-md">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </button>
              <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg">
                Mon Compte
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats en temps réel */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            Tableau de bord en direct
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              value={stats.activeTickets}
              label="Tickets actifs"
              color="from-blue-500 to-blue-600"
              trend="+12%"
            />
            <StatCard
              icon={<Clock className="w-8 h-8" />}
              value={`${stats.avgWaitTime}min`}
              label="Attente moyenne"
              color="from-purple-500 to-purple-600"
              trend="-8%"
            />
            <StatCard
              icon={<MapPin className="w-8 h-8" />}
              value={stats.servicesOpen}
              label="Services ouverts"
              color="from-green-500 to-green-600"
              trend="Stable"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              value={stats.usersSaved}
              label="Temps économisé"
              color="from-orange-500 to-orange-600"
              trend="Aujourd'hui"
            />
          </div>
        </section>

        {/* Notifications urgentes */}
        {notifications.filter(n => n.urgent).length > 0 && (
          <section className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-red-500 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">🔔 Notification urgente</h3>
                <p className="text-red-800 font-semibold">
                  {notifications.find(n => n.urgent)?.message}
                </p>
                <button className="mt-3 px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
                  Voir mon ticket
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Recherche et filtres améliorés */}
        <section className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un service, une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 font-semibold bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '🎯 Toutes catégories' : `📂 ${cat}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Services avec design premium */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Services disponibles</h2>
            <button className="text-yellow-600 font-semibold hover:text-yellow-700 flex items-center">
              Voir carte interactive
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} getAffluenceColor={getAffluenceColor} getTrendIcon={getTrendIcon} />
            ))}
          </div>
        </section>

        {/* Nouvelles sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Marketplace teaser */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
            <ShoppingBag className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">🛍️ Marketplace ViteviteApp</h3>
            <p className="text-purple-100 mb-6">
              Profitez de votre temps d'attente pour commander matériaux, médicaments, et plus encore.
            </p>
            <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-lg transition-all">
              Explorer la boutique
            </button>
          </div>

          {/* Analytics teaser */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
            <BarChart3 className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">📊 Insights & Prédictions IA</h3>
            <p className="text-blue-100 mb-6">
              Découvrez les tendances, optimisez vos déplacements avec notre intelligence artificielle.
            </p>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all">
              Voir les analytics
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ icon, value, label, color, trend }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
    <div className="flex items-center justify-between mb-4">
      {icon}
      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
        {trend}
      </span>
    </div>
    <div className="text-4xl font-black mb-1">{value}</div>
    <div className="text-sm font-medium opacity-90">{label}</div>
  </div>
);

const ServiceCard = ({ service, getAffluenceColor, getTrendIcon }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
    {/* Header avec gradient d'affluence */}
    <div className={`bg-gradient-to-r ${getAffluenceColor(service.affluence)} p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-5xl">{service.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{service.name}</h3>
            <p className="text-white/90 text-sm">{service.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
            {service.status === 'open' ? '✅ OUVERT' : '🔒 FERMÉ'}
          </span>
          <span className="text-white text-2xl">{getTrendIcon(service.trend)}</span>
        </div>
      </div>
    </div>

    {/* Corps */}
    <div className="p-6 space-y-4">
      {/* Stats principales */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <div className="text-2xl font-black text-yellow-600">{service.waitTime}</div>
          <div className="text-xs text-gray-600 font-semibold">Minutes</div>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <div className="text-2xl font-black text-blue-600">{service.queueSize}</div>
          <div className="text-xs text-gray-600 font-semibold">Personnes</div>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <div className="text-2xl font-black text-green-600">⭐{service.rating}</div>
          <div className="text-xs text-gray-600 font-semibold">Note</div>
        </div>
      </div>

      {/* IA Prediction */}
      <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">{service.aiPrediction}</span>
        </div>
      </div>

      {/* Services offerts */}
      <div>
        <div className="text-xs font-semibold text-gray-500 mb-2">Services disponibles:</div>
        <div className="flex flex-wrap gap-2">
          {service.services.map((s, idx) => (
            <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-2">
        <button className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
          🎫 Prendre ticket
        </button>
        <button className="px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          <Phone className="w-5 h-5" />
        </button>
        <button className="px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          <MapPin className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

export default ViteviteDashboard;