'use client';

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
  textColor?: string;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center">
                <Brain className="w-10 h-10 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Analytics & IA Dashboard</h1>
                <p className="text-gray-500">Intelligence artificielle pour l'optimisation des services</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Performance KPIs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-yellow-500" />
            Indicateurs de performance IA
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              icon={<Clock />}
              value={`-${performanceMetrics.avgWaitTimeReduction}%`}
              label="Réduction attente"
              color="bg-white border border-gray-100"
              textColor="text-green-600"
              trend="improving"
            />
            <MetricCard
              icon={<Users />}
              value={performanceMetrics.userSatisfaction}
              label="Satisfaction"
              color="bg-white border border-gray-100"
              textColor="text-yellow-600"
              suffix="/5"
            />
            <MetricCard
              icon={<Activity />}
              value={performanceMetrics.ticketsProcessedToday}
              label="Tickets traités"
              color="bg-white border border-gray-100"
              textColor="text-gray-900"
            />
            <MetricCard
              icon={<Zap />}
              value={`${performanceMetrics.timeSavedToday}h`}
              label="Temps économisé"
              color="bg-white border border-gray-100"
              textColor="text-yellow-600"
            />
            <MetricCard
              icon={<TrendingUp />}
              value={performanceMetrics.peakHoursPredicted}
              label="Pics prédits"
              color="bg-white border border-gray-100"
              textColor="text-gray-900"
            />
            <MetricCard
              icon={<Brain />}
              value={`${performanceMetrics.aiAccuracy}%`}
              label="Précision IA"
              color="bg-white border border-gray-100"
              textColor="text-yellow-500"
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
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-gray-400" />
              Analyse horaire de l'affluence
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Tickets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
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
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
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
            <Brain className="w-6 h-6 mr-2 text-yellow-500" />
            Recommandations IA stratégiques
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>

        {/* Business Insights */}
        <section className="bg-gray-900 rounded-3xl p-10 text-white">
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

const MetricCard = ({ icon, value, label, color, trend, suffix = '', textColor = 'text-gray-900' }: MetricCardProps) => (
  <div className={`${color} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all`}>
    <div className="mb-4 text-gray-400">
      {React.cloneElement(icon, { className: 'w-8 h-8' })}
    </div>
    <div className={`text-3xl font-black mb-1 ${textColor}`}>
      {value}{suffix}
    </div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    {trend === 'improving' && (
      <div className="mt-2 flex items-center text-xs text-green-600 font-bold">
        <TrendingUp className="w-4 h-4 mr-1" />
        Amélioration
      </div>
    )}
  </div>
);

const AIInsightCard = ({ insight }: { insight: AIInsight }) => {
  const priorityColors: Record<AIInsight['priority'], string> = {
    high: 'bg-red-50 text-red-700 border-red-100',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    low: 'bg-gray-50 text-gray-700 border-gray-100'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
      <div className={`p-4 border-b ${priorityColors[insight.priority].replace('bg-', 'border-')}`}>
        <div className="flex items-center justify-between">
          <div className="text-4xl">{insight.icon}</div>
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-500">Confiance IA</div>
            <div className="text-2xl font-black text-gray-900">{insight.confidence}%</div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">{insight.title}</h3>
          <p className="text-gray-600 text-sm">{insight.message}</p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded p-3">
          <div className="text-xs font-semibold text-yellow-900 mb-1">Action recommandée</div>
          <div className="text-sm text-yellow-800">{insight.action}</div>
        </div>
        <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all">
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
          <div className="flex-1 bg-gray-50 rounded-full h-8 overflow-hidden">
            <div
              className="bg-yellow-500 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${ticketWidth}%` }}
            >
              {ticketWidth > 15 && (
                <span className="text-white text-xs font-bold">{data.tickets}</span>
              )}
            </div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2"
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
    up: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
    down: { icon: <TrendingDown className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    stable: { icon: <Activity className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-50' }
  };

  const statusColors: Record<Service['status'], string> = {
    improving: 'bg-green-100 text-green-800',
    stable: 'bg-gray-100 text-gray-800',
    worsening: 'bg-red-100 text-red-800'
  };

  const trend = trendIcons[service.trend];

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-yellow-200 transition-all">
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
    low: { color: 'bg-gray-100 text-gray-800', label: '🔵 Basse' }
  };

  const costBadge: Record<Recommendation['cost'], string> = {
    Faible: 'bg-green-100 text-green-800',
    Moyen: 'bg-yellow-100 text-yellow-800',
    Élevé: 'bg-red-100 text-red-800'
  };

  const priority = priorityBadge[recommendation.priority];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
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
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">{recommendation.reason}</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">{recommendation.impact}</span>
        </div>
      </div>

      <button className="w-full bg-white border-2 border-gray-100 text-gray-900 py-3 rounded-xl font-semibold hover:border-yellow-500 hover:text-yellow-600 transition-all">
        Analyser en détail
      </button>
    </div>
  );
};

const BusinessInsight = ({ icon, title, value, change, period }: BusinessInsightProps) => (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-gray-300">{title}</h3>
    <div className="text-4xl font-black mb-2 text-white">{value}</div>
    <div className="flex items-center space-x-2 text-sm flex-wrap gap-1">
      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">{change}</span>
      <span className="text-gray-400">{period}</span>
    </div>
  </div>
);

export default ViteviteAnalytics;