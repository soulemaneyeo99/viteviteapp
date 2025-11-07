import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, MapPin, Zap, Calendar, Brain, Target, AlertTriangle, CheckCircle2, Activity, PieChart } from 'lucide-react';

type AIInsight = {
  id: number;
  type: string;
  icon: string;
  title: string;
  message: string;
  confidence: number;
  action: string;
  priority: 'high' | 'medium' | 'low';
};

type Service = {
  name: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'improving' | 'stable' | 'worsening';
};

type Recommendation = {
  id?: number;
  title: string;
  location: string;
  reason: string;
  impact: string;
  cost: 'Faible' | 'Moyen' | 'Élevé';
  priority: 'high' | 'medium' | 'low';
};

type MetricCardProps = {
  icon: React.ReactElement;
  value: string | number;
  label: string;
  color: string;
  trend?: 'improving' | string;
  suffix?: string;
};

type HourlyBarProps = {
  data: { hour: string; tickets: number; wait: number };
  maxTickets: number;
  maxWait: number;
};

type BusinessInsightProps = {
  icon: string;
  title: string;
  value: string;
  change: string;
  period: string;
};

const ViteviteAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Données de démonstration
  const aiInsights: AIInsight[] = [
    {
      id: 1,
      type: 'prediction',
      icon: '🔮',
      title: 'Pic d\'affluence prévu',
      message: 'Forte affluence attendue demain à la Mairie Cocody entre 9h-11h',
      confidence: 92,
      action: 'Recommander 14h-16h aux utilisateurs',
      priority: 'high'
    },
    {
      id: 2,
      type: 'optimization',
      icon: '⚡',
      title: 'Optimisation détectée',
      message: 'Banque Atlantique pourrait réduire le temps d\'attente de 23% avec un guichet supplémentaire',
      confidence: 87,
      action: 'Contacter le partenaire',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'trend',
      icon: '📈',
      title: 'Tendance croissante',
      message: 'CHU Treichville: +34% de tickets ce mois vs mois dernier',
      confidence: 95,
      action: 'Analyser les causes',
      priority: 'low'
    }
  ];

  const performanceMetrics = {
    avgWaitTimeReduction: 42,
    userSatisfaction: 4.7,
    ticketsProcessedToday: 1847,
    timeSavedToday: 2450,
    peakHoursPredicted: 3,
    aiAccuracy: 91
  };

  const serviceTrends: Service[] = [
    { name: 'Mairie Cocody', trend: 'down', change: -12, status: 'improving' },
    { name: 'Banque Atlantique', trend: 'stable', change: 2, status: 'stable' },
    { name: 'CHU Treichville', trend: 'up', change: 18, status: 'worsening' },
    { name: 'DGI Impôts', trend: 'down', change: -8, status: 'improving' }
  ];

  const hourlyData = [
    { hour: '8h', tickets: 45, wait: 15 },
    { hour: '9h', tickets: 89, wait: 28 },
    { hour: '10h', tickets: 134, wait: 42 },
    { hour: '11h', tickets: 156, wait: 51 },
    { hour: '12h', tickets: 98, wait: 35 },
    { hour: '13h', tickets: 67, wait: 22 },
    { hour: '14h', tickets: 112, wait: 38 },
    { hour: '15h', tickets: 145, wait: 46 },
    { hour: '16h', tickets: 123, wait: 40 },
    { hour: '17h', tickets: 78, wait: 25 }
  ];

  const recommendations: Recommendation[] = [
    {
      id: 1,
      title: 'Ouvrir nouveau point de service',
      location: 'Zone Abobo',
      reason: 'Demande élevée non couverte',
      impact: 'Réduction de 35% du temps d\'attente',
      cost: 'Moyen',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Ajuster horaires d\'ouverture',
      location: 'Mairie Yopougon',
      reason: 'Affluence tardive constatée',
      impact: 'Amélioration satisfaction +15%',
      cost: 'Faible',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Former personnel supplémentaire',
      location: 'CHU Treichville',
      reason: 'Surcharge pendant pics',
      impact: 'Traitement 28% plus rapide',
      cost: 'Élevé',
      priority: 'high'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <Brain className="w-10 h-10 text-purple-600" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-black">Analytics & IA Dashboard</h1>
                <p className="text-purple-100">Intelligence artificielle pour l'optimisation des services</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white/20 text-white border-2 border-white/30 rounded-xl font-semibold backdrop-blur-sm"
              >
                <option value="today" className="text-gray-900">Aujourd'hui</option>
                <option value="week" className="text-gray-900">Cette semaine</option>
                <option value="month" className="text-gray-900">Ce mois</option>
                <option value="year" className="text-gray-900">Cette année</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Performance KPIs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-purple-600" />
            Indicateurs de performance IA
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              icon={<Clock />}
              value={`-${performanceMetrics.avgWaitTimeReduction}%`}
              label="Réduction attente"
              color="from-green-500 to-emerald-600"
              trend="improving"
            />
            <MetricCard
              icon={<Users />}
              value={performanceMetrics.userSatisfaction}
              label="Satisfaction"
              color="from-blue-500 to-indigo-600"
              suffix="/5"
            />
            <MetricCard
              icon={<Activity />}
              value={performanceMetrics.ticketsProcessedToday}
              label="Tickets traités"
              color="from-purple-500 to-purple-600"
            />
            <MetricCard
              icon={<Zap />}
              value={`${performanceMetrics.timeSavedToday}h`}
              label="Temps économisé"
              color="from-orange-500 to-red-600"
            />
            <MetricCard
              icon={<TrendingUp />}
              value={performanceMetrics.peakHoursPredicted}
              label="Pics prédits"
              color="from-yellow-500 to-yellow-600"
            />
            <MetricCard
              icon={<Brain />}
              value={`${performanceMetrics.aiAccuracy}%`}
              label="Précision IA"
              color="from-pink-500 to-rose-600"
            />
          </div>
        </section>

        {/* AI Insights */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            Insights IA en temps réel
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {aiInsights.map(insight => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>

        {/* Hourly Analysis Chart */}
        <section className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
              Analyse horaire de l'affluence
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Tickets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Temps d'attente</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {hourlyData.map((data, idx) => (
              <HourlyBar key={idx} data={data} maxTickets={160} maxWait={60} />
            ))}
          </div>
        </section>

        {/* Service Trends */}
        <section className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Tendances par service
          </h2>
          <div className="space-y-4">
            {serviceTrends.map((service, idx) => (
              <ServiceTrendRow key={idx} service={service} />
            ))}
          </div>
        </section>

        {/* AI Recommendations */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            Recommandations IA stratégiques
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>

        {/* Predictive Map Placeholder */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <MapPin className="w-8 h-8 mr-3" />
            Carte prédictive des flux de population
          </h2>
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <div className="text-8xl mb-6">🗺️</div>
            <p className="text-xl text-gray-300 mb-6">
              Visualisation en temps réel des zones de forte affluence à Abidjan
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400">12</div>
                <div className="text-sm text-green-300">Zones fluides</div>
              </div>
              <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4">
                <div className="text-3xl font-bold text-yellow-400">8</div>
                <div className="text-sm text-yellow-300">Affluence modérée</div>
              </div>
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400">3</div>
                <div className="text-sm text-red-300">Zones saturées</div>
              </div>
            </div>
            <button className="mt-8 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all">
              Voir la carte interactive
            </button>
          </div>
        </section>

        {/* Business Insights */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Insights Business</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BusinessInsight
              icon="💰"
              title="Revenus Marketplace"
              value="2.4M FCFA"
              change="+23%"
              period="ce mois"
            />
            <BusinessInsight
              icon="🤝"
              title="Nouveaux partenaires"
              value="12"
              change="+4"
              period="cette semaine"
            />
            <BusinessInsight
              icon="👥"
              title="Utilisateurs actifs"
              value="18,450"
              change="+15%"
              period="vs mois dernier"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, value, label, color, trend, suffix = '' }: MetricCardProps) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all`}>
    <div className="mb-4">
      {React.cloneElement(icon, { className: 'w-8 h-8' })}
    </div>
    <div className="text-3xl font-black mb-1">
      {value}{suffix}
    </div>
    <div className="text-sm font-medium opacity-90">{label}</div>
    {trend === 'improving' && (
      <div className="mt-2 flex items-center text-xs">
        <TrendingUp className="w-4 h-4 mr-1" />
        Amélioration
      </div>
    )}
  </div>
);

const AIInsightCard = ({ insight }: { insight: AIInsight }) => {
  const priorityColors: Record<AIInsight['priority'], string> = {
    high: 'from-red-500 to-pink-600',
    medium: 'from-yellow-500 to-orange-600',
    low: 'from-blue-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
      <div className={`bg-gradient-to-r ${priorityColors[insight.priority]} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="text-4xl">{insight.icon}</div>
          <div className="text-right">
            <div className="text-xs font-semibold opacity-90">Confiance IA</div>
            <div className="text-2xl font-black">{insight.confidence}%</div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{insight.title}</h3>
          <p className="text-gray-600 text-sm">{insight.message}</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded p-3">
          <div className="text-xs font-semibold text-purple-900 mb-1">Action recommandée</div>
          <div className="text-sm text-purple-800">{insight.action}</div>
        </div>
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          Appliquer la recommandation
        </button>
      </div>
    </div>
  );
};

const HourlyBar = ({ data, maxTickets, maxWait }: HourlyBarProps) => {
  const ticketWidth = (data.tickets / maxTickets) * 100;
  const waitWidth = (data.wait / maxWait) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 w-12">{data.hour}</span>
        <div className="flex-1 flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${ticketWidth}%` }}
            >
              {ticketWidth > 15 && (
                <span className="text-white text-xs font-bold">{data.tickets}</span>
              )}
            </div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${waitWidth}%` }}
            >
              {waitWidth > 15 && (
                <span className="text-white text-xs font-bold">{data.wait}min</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceTrendRow = ({ service }: { service: Service }) => {
  const trendIcons = {
    up: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-100' },
    down: { icon: <TrendingDown className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
    stable: { icon: <Activity className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' }
  };

  const statusColors: Record<Service['status'], string> = {
    improving: 'bg-green-100 text-green-800',
    stable: 'bg-blue-100 text-blue-800',
    worsening: 'bg-red-100 text-red-800'
  };

  const trend = trendIcons[service.trend];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
      <div className="flex items-center space-x-4 flex-1">
        <div className={`p-3 ${trend.bg} rounded-xl`}>
          {React.cloneElement(trend.icon, { className: `w-6 h-6 ${trend.color}` })}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{service.name}</h4>
          <div className="flex items-center space-x-3 mt-1 flex-wrap gap-1">
            <span className={`text-sm font-semibold ${trend.color}`}>
              {service.change > 0 ? '+' : ''}{service.change}%
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[service.status]}`}>
              {service.status === 'improving' ? '✅ Amélioration' :
               service.status === 'stable' ? '➡️ Stable' : '⚠️ Détérioration'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const priorityBadge: Record<Recommendation['priority'], { color: string; label: string }> = {
    high: { color: 'bg-red-100 text-red-800', label: '🔴 Haute' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: '🟡 Moyenne' },
    low: { color: 'bg-blue-100 text-blue-800', label: '🔵 Basse' }
  };

  const costBadge: Record<Recommendation['cost'], string> = {
    Faible: 'bg-green-100 text-green-800',
    Moyen: 'bg-yellow-100 text-yellow-800',
    Élevé: 'bg-red-100 text-red-800'
  };

  const priority = priorityBadge[recommendation.priority];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priority.color}`}>
          {priority.label}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${costBadge[recommendation.cost]}`}>
          Coût: {recommendation.cost}
        </span>
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 mb-2">{recommendation.title}</h3>
      
      <div className="space-y-3 mb-4 text-sm">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">{recommendation.location}</span>
        </div>
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">{recommendation.reason}</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">{recommendation.impact}</span>
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
        Analyser en détail
      </button>
    </div>
  );
};

const BusinessInsight = ({ icon, title, value, change, period }: BusinessInsightProps) => (
  <div className="bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl p-6">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 opacity-90">{title}</h3>
    <div className="text-4xl font-black mb-2">{value}</div>
    <div className="flex items-center space-x-2 text-sm flex-wrap gap-1">
      <span className="bg-green-400 text-green-900 px-2 py-1 rounded font-bold">{change}</span>
      <span className="opacity-75">{period}</span>
    </div>
  </div>
);

export default ViteviteAnalytics;