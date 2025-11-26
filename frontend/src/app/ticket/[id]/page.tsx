"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ticketsAPI, servicesAPI } from "@/lib/api";
import { Ticket, Service } from "@/types";
import { Clock, Users, MapPin, FileCheck, X, RefreshCw, Share2, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

export default function TicketPage({ params }: { params: { id: string } }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ticketUrl, setTicketUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTicketUrl(window.location.href);
    }
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="text-lg font-bold">⚡</span>
            </div>
            <span className="text-lg font-black tracking-tight">ViteviteApp</span>
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-1 text-slate-900">Votre ticket virtuel</h1>
          <p className="text-slate-500 text-sm">Suivez l'évolution en temps réel</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 relative">
          {/* Orange Header */}
          <div className="bg-primary p-8 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

            <div className="relative z-10">
              <div className="text-white/80 mb-2">
                <div className="inline-flex items-center justify-center w-12 h-8 rounded border-2 border-white/30 mb-2">
                  <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                  <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                  <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                </div>
              </div>
              <div className="text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-sm">
                {ticket.ticket_number}
              </div>
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/30">
                <p className="text-xs font-bold text-white uppercase tracking-wide">Votre ticket virtuel</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Status Box */}
            <div className={`text-center p-4 rounded-2xl mb-8 border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
              <div className="text-3xl mb-2">{statusInfo.icon}</div>
              <h2 className={`text-xl font-bold mb-1 ${statusInfo.textColor}`}>{statusInfo.title}</h2>
              <p className={`text-xs font-medium ${statusInfo.textColor} opacity-80`}>{statusInfo.message}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Position</div>
                <div className="text-4xl font-black text-primary">#{ticket.position_in_queue}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attente estimée</div>
                <div className="text-4xl font-black text-primary">{ticket.estimated_wait_time}</div>
                <div className="text-xs font-bold text-slate-400 mt-1">minutes</div>
              </div>
            </div>

            {/* Service Info */}
            {service && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <h3 className="font-bold text-slate-900">Détails du service</h3>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Service</span>
                    <span className="text-sm font-bold text-slate-900 text-right">{service.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Catégorie</span>
                    <span className="text-sm font-medium text-slate-700">{service.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Horaires</span>
                    <span className="text-sm font-medium text-slate-700">{service.opening_hours}</span>
                  </div>
                  {service.location && (
                    <div className="flex justify-between items-start pt-2 border-t border-slate-200 mt-2">
                      <span className="text-sm text-slate-500">Adresse</span>
                      <span className="text-xs font-medium text-slate-700 text-right max-w-[150px]">{service.location.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm mb-3">
                {ticketUrl && (
                  <QRCodeCanvas
                    value={ticketUrl}
                    size={120}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={false}
                  />
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Scannez pour suivre</p>
            </div>
          </div>
        </div>

        {/* Auto-refresh Toggle */}
        <div className="mt-6 bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-sm font-bold text-slate-700">Actualisation automatique</span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${autoRefresh ? 'bg-green-500' : 'bg-slate-200'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Link
            href="/services"
            className="block w-full text-center py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            ← Retour à l'accueil
          </Link>

          {ticket.status === "en_attente" && (
            <button
              onClick={handleCancel}
              className="block w-full py-4 text-red-500 font-bold text-sm hover:underline transition-all"
            >
              Annuler mon ticket
            </button>
          )}
        </div>
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
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
    },
    en_attente_validation: {
      icon: "🔍",
      title: "Validation",
      message: "En attente de validation par un agent",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
    },
    appelé: {
      icon: "🔔",
      title: "C'EST VOTRE TOUR !",
      message: "Veuillez vous présenter au guichet",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
    },
    en_service: {
      icon: "⚙️",
      title: "En cours",
      message: "Votre demande est en cours de traitement",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
    },
    terminé: {
      icon: "✅",
      title: "Terminé",
      message: "Merci d'avoir utilisé ViteviteApp",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-800",
    },
    annulé: {
      icon: "❌",
      title: "Annulé",
      message: "Ce ticket a été annulé",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
    },
    refusé: {
      icon: "⛔",
      title: "Refusé",
      message: "Votre ticket a été refusé",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
    },
  };

  return statusMap[status] || statusMap.en_attente;
}