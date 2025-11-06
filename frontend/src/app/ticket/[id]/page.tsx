'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Ticket, Service } from '@/lib/types';

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadTicket();
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadTicket();
      }
    }, 5000); // Refresh toutes les 5 secondes

    return () => clearInterval(interval);
  }, [ticketId, autoRefresh]);

  const loadTicket = async () => {
    try {
      const ticketData = await api.getTicket(ticketId);
      setTicket(ticketData);

      const serviceData = await api.getService(ticketData.service_id);
      setService(serviceData);
    } catch (error) {
      console.error('Erreur chargement ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce ticket ?')) return;

    try {
      await api.cancelTicket(ticketId);
      router.push('/services');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'annulation');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'en_attente':
        return { text: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'appelé':
        return { text: 'Appelé - Présentez-vous !', color: 'bg-green-100 text-green-800', icon: '🔔' };
      case 'en_service':
        return { text: 'En cours de traitement', color: 'bg-blue-100 text-blue-800', icon: '⚙️' };
      case 'terminé':
        return { text: 'Terminé', color: 'bg-gray-100 text-gray-800', icon: '✅' };
      case 'annulé':
        return { text: 'Annulé', color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!ticket || !service) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ticket non trouvé</h2>
        <Link href="/services" className="btn-primary">
          Retour aux services
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre ticket virtuel</h1>
        <p className="text-gray-600">Suivez l'évolution de votre position en temps réel</p>
      </div>

      {/* Ticket Card */}
      <div className="card p-8 text-center bg-gradient-to-br from-[#FFD43B] to-[#FFC107]">
        <div className="text-6xl mb-4">🎫</div>
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {ticket.ticket_number}
        </div>
        <div className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${statusInfo.color}`}>
          {statusInfo.icon} {statusInfo.text}
        </div>
      </div>

      {/* Service Info */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Service</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Nom:</span>
            <span className="font-semibold">{service.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Catégorie:</span>
            <span className="font-semibold">{service.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Horaires:</span>
            <span className="font-semibold">{service.opening_hours}</span>
          </div>
          {service.location && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Adresse:</span>
              <span className="font-semibold text-sm">{service.location.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Queue Info */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations sur la file</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#FFD43B] mb-1">
              {ticket.position_in_queue}
            </div>
            <div className="text-sm text-gray-600">Position dans la file</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#FFD43B] mb-1">
              {ticket.estimated_wait_time}
            </div>
            <div className="text-sm text-gray-600">Minutes d'attente estimées</div>
          </div>
        </div>
      </div>

      {/* Documents Required */}
      {service.required_documents.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📋 Documents à apporter
          </h2>
          <div className="space-y-2">
            {service.required_documents.map((doc, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                <span className="text-2xl">{doc.required ? '✅' : '📄'}</span>
                <div>
                  <div className="font-semibold text-gray-900">{doc.name}</div>
                  {doc.description && (
                    <div className="text-sm text-gray-600">{doc.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Details */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Détails du ticket</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ID:</span>
            <span className="font-mono text-xs">{ticket.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Créé le:</span>
            <span>{new Date(ticket.created_at).toLocaleString('fr-FR')}</span>
          </div>
          {ticket.user_name && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Nom:</span>
              <span>{ticket.user_name}</span>
            </div>
          )}
          {ticket.user_phone && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Téléphone:</span>
              <span>{ticket.user_phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Auto-refresh Toggle */}
      <div className="card p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">Actualisation automatique</span>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            autoRefresh
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {autoRefresh ? '✅ Activé' : '⏸️ Désactivé'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/services" className="flex-1 btn-secondary text-center">
          ← Retour aux services
        </Link>
        {ticket.status === 'en_attente' && (
          <button
            onClick={handleCancelTicket}
            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Annuler le ticket
          </button>
        )}
      </div>

      {/* Alert for called ticket */}
      {ticket.status === 'appelé' && (
        <div className="card p-6 bg-green-50 border-2 border-green-500 animate-pulse-slow">
          <div className="text-center">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              C'est votre tour !
            </h3>
            <p className="text-green-700">
              Veuillez vous présenter au guichet maintenant
            </p>
          </div>
        </div>
      )}
    </div>
  );
}