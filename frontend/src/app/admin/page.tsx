'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardData, Service, Ticket } from '@/lib/types';

export default function AdminPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('all');

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadDashboard();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async (serviceId: string) => {
    try {
      const result = await api.callNextTicket(serviceId);
      if (result.ticket) {
        alert(`Ticket ${result.ticket.ticket_number} appelé !`);
        loadDashboard();
      } else {
        alert(result.message || 'Aucun ticket en attente');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'appel');
    }
  };

  const handleCompleteTicket = async (ticketId: string) => {
    try {
      await api.completeTicket(ticketId);
      loadDashboard();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la complétion');
    }
  };

  const handleUpdateServiceStatus = async (serviceId: string, status: string) => {
    try {
      await api.updateService(serviceId, { status: status as any });
      loadDashboard();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-12">Erreur de chargement</div>;
  }

  const filteredTickets = selectedService === 'all'
    ? dashboardData.recent_tickets
    : dashboardData.recent_tickets.filter(t => t.service_id === selectedService);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Gestion en temps réel des services et files d'attente</p>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            autoRefresh
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-6">
          <div className="text-sm text-gray-600 mb-2">Tickets aujourd'hui</div>
          <div className="text-3xl font-bold text-gray-900">
            {dashboardData.stats.total_tickets_today}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-600 mb-2">Tickets actifs</div>
          <div className="text-3xl font-bold text-[#FFD43B]">
            {dashboardData.stats.active_tickets}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-600 mb-2">Tickets terminés</div>
          <div className="text-3xl font-bold text-green-600">
            {dashboardData.stats.completed_tickets}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-600 mb-2">Temps d'attente moyen</div>
          <div className="text-3xl font-bold text-gray-900">
            {dashboardData.stats.average_wait_time} min
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-600 mb-2">Services ouverts</div>
          <div className="text-3xl font-bold text-blue-600">
            {dashboardData.stats.services_open}
          </div>
        </div>
      </div>

      {/* Services Management */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.services.map(service => {
            const stats = dashboardData.service_stats.find(s => s.service_id === service.id);
            return (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.category}</p>
                  </div>
                  <select
                    value={service.status}
                    onChange={(e) => handleUpdateServiceStatus(service.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="ouvert">Ouvert</option>
                    <option value="fermé">Fermé</option>
                    <option value="en_pause">En pause</option>
                  </select>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">File d'attente:</span>
                    <span className="font-semibold">{stats?.active_tickets || 0} pers.</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Temps estimé:</span>
                    <span className="font-semibold">{service.estimated_wait_time} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Affluence:</span>
                    <span className={`badge ${
                      service.affluence_level === 'faible' ? 'affluence-low' :
                      service.affluence_level === 'modérée' ? 'affluence-moderate' :
                      service.affluence_level === 'élevée' ? 'affluence-high' :
                      'affluence-very-high'
                    }`}>
                      {service.affluence_level}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCallNext(service.id)}
                  disabled={service.status !== 'ouvert'}
                  className={`w-full py-2 rounded-lg font-semibold transition text-sm ${
                    service.status === 'ouvert'
                      ? 'bg-[#FFD43B] text-gray-900 hover:bg-[#FFC107]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🔔 Appeler le prochain
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tickets récents</h2>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="all">Tous les services</option>
            {dashboardData.services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ticket</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Créé le</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.slice(0, 10).map(ticket => {
                const service = dashboardData.services.find(s => s.id === ticket.service_id);
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-semibold">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3 text-sm">{service?.name}</td>
                    <td className="px-4 py-3 text-sm">{ticket.user_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${
                        ticket.status === 'en_attente' ? 'badge-warning' :
                        ticket.status === 'appelé' ? 'badge-info' :
                        ticket.status === 'terminé' ? 'badge-success' :
                        'badge-danger'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(ticket.created_at).toLocaleTimeString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.status === 'appelé' && (
                        <button
                          onClick={() => handleCompleteTicket(ticket.id)}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          ✅ Terminer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Busiest Service Alert */}
      {dashboardData.stats.busiest_service && (
        <div className="card p-6 bg-orange-50 border-l-4 border-orange-500">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="font-bold text-gray-900">Service le plus occupé</h3>
              <p className="text-gray-700">
                {dashboardData.stats.busiest_service} nécessite votre attention
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}