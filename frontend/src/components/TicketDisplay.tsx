'use client';

import { Ticket, Service, TicketStatus } from '@/lib/types';
import { useRef, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TicketDisplayProps {
  ticket: Ticket;
  service?: Service;
  showActions?: boolean;
  onCancel?: () => void;
  onPrint?: () => void;
  compact?: boolean;
}

export default function TicketDisplay({
  ticket,
  service,
  showActions = true,
  onCancel,
  onPrint,
  compact = false
}: TicketDisplayProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.WAITING:
        return {
          color: 'bg-yellow-50 border-yellow-300',
          textColor: 'text-yellow-800',
          icon: '⏳',
          title: 'En attente',
          message: 'Votre ticket est en file d\'attente',
          pulse: true
        };
      case TicketStatus.CALLED:
        return {
          color: 'bg-green-50 border-green-300',
          textColor: 'text-green-800',
          icon: '🔔',
          title: 'C\'EST VOTRE TOUR !',
          message: 'Veuillez vous présenter immédiatement',
          pulse: true
        };
      case TicketStatus.SERVING:
        return {
          color: 'bg-blue-50 border-blue-300',
          textColor: 'text-blue-800',
          icon: '⚙️',
          title: 'En cours de traitement',
          message: 'Votre demande est en cours',
          pulse: false
        };
      case TicketStatus.COMPLETED:
        return {
          color: 'bg-gray-50 border-gray-300',
          textColor: 'text-gray-800',
          icon: '✅',
          title: 'Terminé',
          message: 'Merci d\'avoir utilisé ViteviteApp',
          pulse: false
        };
      case TicketStatus.CANCELLED:
        return {
          color: 'bg-red-50 border-red-300',
          textColor: 'text-red-800',
          icon: '❌',
          title: 'Annulé',
          message: 'Ce ticket a été annulé',
          pulse: false
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-300',
          textColor: 'text-gray-800',
          icon: '📄',
          title: 'Statut inconnu',
          message: '',
          pulse: false
        };
    }
  };

  const statusInfo = getStatusInfo(ticket.status);
  const createdDate = new Date(ticket.created_at);
  const waitTime = ticket.called_at
    ? Math.round((new Date(ticket.called_at).getTime() - createdDate.getTime()) / 60000)
    : null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Ticket ${ticket.ticket_number} - ViteviteApp`,
      text: `Mon ticket virtuel pour ${service?.name || 'un service'}. Position: ${ticket.position_in_queue}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  if (compact) {
    return (
      <div className={`border-2 rounded-lg p-4 ${statusInfo.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{statusInfo.icon}</span>
            <div>
              <div className="text-2xl font-bold">{ticket.ticket_number}</div>
              <div className={`text-sm font-semibold ${statusInfo.textColor}`}>
                {statusInfo.title}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Position</div>
            <div className="text-2xl font-bold text-gray-900">
              #{ticket.position_in_queue}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ticket principal */}
      <div
        ref={ticketRef}
        className={`border-4 rounded-2xl overflow-hidden ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse-slow' : ''
          }`}
      >
        {/* Header coloré */}
        <div className="bg-gradient-to-r from-[#FFD43B] to-[#FFC107] p-6 text-center">
          <div className="text-6xl mb-3">🎫</div>
          <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
            {ticket.ticket_number}
          </h1>
          <div className="bg-white/30 rounded-full px-4 py-2 inline-block">
            <p className="text-sm font-semibold text-gray-900">
              Votre ticket virtuel
            </p>
          </div>
        </div>

        {/* Corps du ticket */}
        <div className="p-6 bg-white">
          {/* Status badge */}
          <div className={`text-center p-4 rounded-xl mb-6 ${statusInfo.color} border-2`}>
            <div className="text-4xl mb-2">{statusInfo.icon}</div>
            <h2 className={`text-2xl font-bold mb-1 ${statusInfo.textColor}`}>
              {statusInfo.title}
            </h2>
            <p className="text-sm opacity-90">{statusInfo.message}</p>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Position</div>
              <div className="text-4xl font-bold text-[#FFD43B]">
                #{ticket.position_in_queue}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Attente estimée</div>
              <div className="text-4xl font-bold text-[#FFD43B]">
                {ticket.estimated_wait_time}
                <span className="text-lg font-normal text-gray-600"> min</span>
              </div>
            </div>
          </div>

          {/* Détails du service */}
          {service && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🏢</span>
                Service
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-semibold text-gray-900">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="font-semibold text-gray-900">{service.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horaires:</span>
                  <span className="font-semibold text-gray-900">{service.opening_hours}</span>
                </div>
                {service.location && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Adresse:</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                      {service.location.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations du ticket */}
          <div className="border-t border-gray-200 pt-4 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>ID du ticket:</span>
              <span className="font-mono">{ticket.id.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Créé le:</span>
              <span>{createdDate.toLocaleString('fr-FR')}</span>
            </div>
            {waitTime !== null && (
              <div className="flex justify-between">
                <span>Temps d'attente réel:</span>
                <span className="font-semibold text-green-600">{waitTime} minutes</span>
              </div>
            )}
            {ticket.user_name && (
              <div className="flex justify-between">
                <span>Nom:</span>
                <span className="font-semibold">{ticket.user_name}</span>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="mt-6 text-center">
            <div className="inline-block bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  size={128}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3 uppercase tracking-wide">Scannez pour suivre</p>
            </div>
          </div>
        </div>

        {/* Footer avec branding */}
        <div className="bg-gray-900 text-white p-4 text-center">
          <div className="text-[#FFD43B] font-bold text-lg mb-1">ViteviteApp</div>
          <p className="text-xs text-gray-400">Gagnez du temps, vivez mieux</p>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <span>🖨️</span>
            <span>Imprimer</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <span>📤</span>
            <span>Partager</span>
          </button>

          {onCancel && ticket.status === TicketStatus.WAITING && (
            <button
              onClick={onCancel}
              className="col-span-2 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              <span>❌</span>
              <span>Annuler le ticket</span>
            </button>
          )}
        </div>
      )}

      {/* Notifications visuelles */}
      {ticket.status === TicketStatus.CALLED && (
        <div className="bg-green-500 text-white rounded-xl p-6 text-center animate-pulse">
          <div className="text-5xl mb-3">🔔</div>
          <h3 className="text-2xl font-bold mb-2">C'EST VOTRE TOUR !</h3>
          <p className="text-lg">Présentez-vous au guichet maintenant</p>
        </div>
      )}

      {ticket.status === TicketStatus.WAITING && ticket.position_in_queue <= 3 && (
        <div className="bg-orange-100 border-2 border-orange-300 text-orange-900 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <p className="font-semibold">Votre tour approche ! Soyez prêt.</p>
        </div>
      )}
    </div>
  );
}