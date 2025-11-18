"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ticketsAPI, servicesAPI } from "@/lib/api";
import { Ticket, Service } from "@/types";
import { Clock, Users, MapPin, FileCheck, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function TicketPage({ params }: { params: { id: string } }) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch ticket
  const { data: ticketData, isLoading, refetch } = useQuery({
    queryKey: ["ticket", params.id],
    queryFn: async () => {
      const response = await ticketsAPI.getById(params.id);
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5s
  });

  const ticket: Ticket = ticketData?.ticket;

  // Fetch service
  const { data: serviceData } = useQuery({
    queryKey: ["service", ticket?.service_id],
    queryFn: async () => {
      if (!ticket?.service_id) return null;
      const response = await servicesAPI.getById(ticket.service_id);
      return response.data;
    },
    enabled: !!ticket?.service_id,
  });

  const service: Service = serviceData?.service;

  const handleCancel = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce ticket ?")) return;

    try {
      await ticketsAPI.cancel(params.id);
      toast.success("Ticket annulé");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Ticket non trouvé</h2>
          <Link href="/services" className="text-primary hover:underline">
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-black">ViteviteApp</span>
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-2">Votre ticket virtuel</h1>
          <p className="text-gray-600">Suivez l'évolution en temps réel</p>
        </div>

        {/* Ticket Card */}
        <div className={`rounded-3xl overflow-hidden shadow-2xl mb-6 ${statusInfo.bgColor}`}>
          <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-center">
            <div className="text-6xl mb-3">🎫</div>
            <div className="text-6xl font-black text-black mb-2">{ticket.ticket_number}</div>
            <div className="bg-white/30 rounded-full px-4 py-2 inline-block">
              <p className="text-sm font-semibold text-black">Votre ticket virtuel</p>
            </div>
          </div>

          <div className="p-6 bg-white">
            {/* Status */}
            <div className={`text-center p-4 rounded-xl mb-6 ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
              <div className="text-4xl mb-2">{statusInfo.icon}</div>
              <h2 className={`text-2xl font-bold mb-1 ${statusInfo.textColor}`}>{statusInfo.title}</h2>
              <p className="text-sm opacity-90">{statusInfo.message}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Position</div>
                <div className="text-4xl font-bold text-primary">#{ticket.position_in_queue}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Attente estimée</div>
                <div className="text-4xl font-bold text-primary">{ticket.estimated_wait_time}</div>
                <div className="text-xs text-gray-500">minutes</div>
              </div>
            </div>

            {/* Service Info */}
            {service && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-3 flex items-center">
                  <span className="mr-2">🏢</span>
                  Service
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-semibold">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catégorie:</span>
                    <span className="font-semibold">{service.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horaires:</span>
                    <span className="font-semibold">{service.opening_hours}</span>
                  </div>
                  {service.location && (
                    <div className="flex items-start justify-between">
                      <span className="text-gray-600">Adresse:</span>
                      <span className="font-semibold text-right text-xs">{service.location.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code Placeholder */}
            <div className="text-center mb-4">
              <div className="inline-block bg-gray-100 p-4 rounded-lg">
                <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-1">📱</div>
                    <div className="text-xs text-gray-500">QR Code</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Scannez pour suivre</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh Toggle */}
        <div className="bg-white rounded-lg p-4 flex items-center justify-between mb-4 shadow">
          <span className="text-sm font-semibold text-gray-600">Actualisation automatique</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            {autoRefresh ? "✅ Activé" : "⏸️ Désactivé"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/services"
            className="flex-1 text-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            ← Retour
          </Link>
          {ticket.status === "en_attente" && (
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Alert if called */}
        {ticket.status === "appelé" && (
          <div className="mt-6 bg-green-500 text-white rounded-xl p-6 text-center animate-pulse">
            <div className="text-5xl mb-3">🔔</div>
            <h3 className="text-2xl font-bold mb-2">C'EST VOTRE TOUR !</h3>
            <p className="text-lg">Présentez-vous au guichet maintenant</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusInfo(status: string) {
  const statusMap: Record<string, any> = {
    en_attente: {
      icon: "⏳",
      title: "En attente",
      message: "Votre ticket est en file d'attente",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-800",
    },
    appelé: {
      icon: "🔔",
      title: "C'EST VOTRE TOUR !",
      message: "Veuillez vous présenter immédiatement",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      textColor: "text-green-800",
    },
    en_service: {
      icon: "⚙️",
      title: "En cours",
      message: "Votre demande est en cours de traitement",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-800",
    },
    terminé: {
      icon: "✅",
      title: "Terminé",
      message: "Merci d'avoir utilisé ViteviteApp",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      textColor: "text-gray-800",
    },
    annulé: {
      icon: "❌",
      title: "Annulé",
      message: "Ce ticket a été annulé",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      textColor: "text-red-800",
    },
  };

  return statusMap[status] || statusMap.en_attente;
}