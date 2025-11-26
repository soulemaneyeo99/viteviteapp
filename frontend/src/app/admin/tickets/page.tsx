"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Clock,
  TrendingUp,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Bell,
  MoreVertical,
  Play,
  AlertCircle,
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { servicesAPI, ticketsAPI } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function QueueManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  // Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await ticketsAPI.getTodayStats();
      return response.data;
    },
    refetchInterval: 10000,
  });

  const stats = statsData || {
    active_tickets: 0,
    average_wait_time: 0,
    total_tickets_today: 0,
    completed_tickets: 0,
  };

  // Fetch Services
  const { data: servicesData } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await servicesAPI.getAll();
      return response.data;
    },
  });

  const services = servicesData?.services || servicesData || [];

  // Fetch Tickets for Selected Service
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["admin-tickets", selectedService],
    queryFn: async () => {
      if (!selectedService) return { tickets: [] };
      const response = await ticketsAPI.getAll({
        service_id: selectedService,
        status: "en_attente,appelé,en_service"
      });
      return response.data;
    },
    enabled: !!selectedService,
    refetchInterval: 5000,
  });

  const tickets = ticketsData?.tickets || [];

  // Fetch Pending Validation Tickets
  const { data: pendingData } = useQuery({
    queryKey: ["pending-tickets"],
    queryFn: async () => {
      const response = await ticketsAPI.getPending();
      return response.data;
    },
    refetchInterval: 5000,
  });

  const pendingTickets = pendingData?.tickets || [];

  // Mutations
  const callNextMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await ticketsAPI.callNext(serviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Ticket appelé");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'appel du ticket");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      await ticketsAPI.updateStatus(ticketId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Statut mis à jour");
    },
  });

  const handleCallNext = () => {
    if (selectedService) {
      callNextMutation.mutate(selectedService);
    }
  };

  const handleStatusUpdate = (ticketId: string, status: string) => {
    updateStatusMutation.mutate({ ticketId, status });
  };

  // Validation Mutation
  const validateMutation = useMutation({
    mutationFn: async ({ ticketId, action }: { ticketId: string; action: string }) => {
      await ticketsAPI.validate(ticketId, action);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pending-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(
        variables.action === "confirm"
          ? "Ticket confirmé avec succès"
          : "Ticket refusé"
      );
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    }
  });

  const handleValidate = (ticketId: string, action: string) => {
    validateMutation.mutate({ ticketId, action });
  };

  // Create Ticket Mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: { service_id: string; sub_service_id?: string; user_name: string; user_phone: string; notes?: string }) => {
      const response = await ticketsAPI.createWalkIn(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setCreatedTicket(data.ticket);
      setShowCreateModal(false);
      toast.success("Ticket créé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Erreur lors de la création du ticket");
    }
  });

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTicketMutation.mutate({
      service_id: formData.get("service_id") as string,
      sub_service_id: formData.get("sub_service_id") as string || undefined, // Nouveau
      user_name: formData.get("user_name") as string,
      user_phone: formData.get("user_phone") as string,
      notes: formData.get("notes") as string || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">ViteViteApp</h1>
                <p className="text-xs text-gray-500 font-medium">Tableau de bord Administrateur</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Système opérationnel</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-yellow-500" />}
            value={stats.active_tickets}
            label="En attente"
            sublabel="Tickets actifs"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-green-600" />}
            value={`${stats.average_wait_time}min`}
            label="Temps moyen"
            sublabel="Attente estimée"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-gray-600" />}
            value={stats.total_tickets_today}
            label="Traités aujourd'hui"
            sublabel="Total tickets"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            value={stats.completed_tickets} // Using completed as proxy or need specific absent stat
            label="Terminés"
            sublabel="Tickets clôturés"
          />
        </div>

        {/* Pending Validation Section */}
        {pendingTickets.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Tickets à valider
                  </h2>
                  <p className="text-sm text-gray-600">
                    Ces tickets nécessitent votre approbation
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-bold shadow-lg">
                {pendingTickets.length} en attente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTickets.map((ticket: any) => (
                <PendingTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onConfirm={() => handleValidate(ticket.id, "confirm")}
                  onReject={() => handleValidate(ticket.id, "reject")}
                  isLoading={validateMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Services List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800">Services actifs</h2>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {services.length} services
              </span>
            </div>

            <div className="space-y-3">
              {services.map((service: any) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${selectedService === service.id
                    ? "bg-white border-yellow-500 shadow-md ring-1 ring-yellow-500/20"
                    : "bg-white border-gray-100 hover:border-yellow-500/50 hover:shadow-sm"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold ${selectedService === service.id ? "text-yellow-600" : "text-gray-800"}`}>
                      {service.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${service.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}>
                      {service.is_active ? "Ouvert" : "Fermé"}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>-- en attente</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>~-- min</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Queue Management */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
              {selectedService ? (
                <>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        File d'attente
                        <span className="text-gray-400 font-normal mx-2">•</span>
                        <span className="text-yellow-600">
                          {services.find((s: any) => s.id === selectedService)?.name}
                        </span>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Gérez les tickets en temps réel</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un ticket
                      </button>
                      <button
                        onClick={handleCallNext}
                        disabled={callNextMutation.isPending}
                        className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold shadow-lg shadow-yellow-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Appeler le suivant
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    {isLoadingTickets ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun ticket en attente</h3>
                        <p className="text-gray-500">La file d'attente est vide pour ce service.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tickets.map((ticket: any) => (
                          <div
                            key={ticket.id}
                            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${ticket.status === 'appelé'
                              ? "bg-yellow-50 border-yellow-200 shadow-sm"
                              : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                              }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${ticket.status === 'appelé'
                                ? "bg-yellow-500 text-white shadow-lg shadow-yellow-200"
                                : "bg-gray-100 text-gray-600"
                                }`}>
                                {ticket.ticket_number}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 flex items-center">
                                  {ticket.user_name || "Utilisateur anonyme"}
                                  {ticket.status === 'appelé' && (
                                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">
                                      En cours
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Attend depuis {Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / 60000)} min
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {ticket.status === 'appelé' ? (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(ticket.id, 'terminé')}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                    Terminer
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(ticket.id, 'annulé')} // Using annulé for absent
                                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-lg transition-colors"
                                  >
                                    Absent
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleStatusUpdate(ticket.id, 'appelé')}
                                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                                >
                                  <Bell className="w-3 h-3 mr-1.5" />
                                  Appeler
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                    <MoreVertical className="w-12 h-12 text-yellow-500 opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sélectionnez un service</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Choisissez un service dans la liste de gauche pour voir la file d'attente et gérer les tickets.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Créer un ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  name="service_id"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  onChange={(e) => setSelectedService(e.target.value)} // Update selected service to show sub-services
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Service Selection (New Step B) */}
              {selectedService && services.find((s: any) => s.id === selectedService)?.sub_services?.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Type d'opération *
                  </label>
                  <select
                    name="sub_service_id"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Sélectionner une opération</option>
                    {services.find((s: any) => s.id === selectedService)?.sub_services.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* User Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="user_name"
                  required
                  placeholder="Ex: Jean Kouassi"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* User Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="user_phone"
                  required
                  placeholder="Ex: +225 07 12 34 56 78"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Ex: Personne âgée, prioritaire"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createTicketMutation.isPending ? "Création..." : "Créer le ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createdTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket créé !</h2>
              <p className="text-gray-600 mb-6">Le ticket a été créé avec succès</p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-3">
                <div className="text-center">
                  <div className="text-5xl font-black text-primary mb-2">
                    {createdTicket.ticket_number}
                  </div>
                  <div className="text-sm text-gray-500">Numéro de ticket</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      #{createdTicket.position_in_queue}
                    </div>
                    <div className="text-xs text-gray-500">Position</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {createdTicket.estimated_wait_time} min
                    </div>
                    <div className="text-xs text-gray-500">Attente estimée</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 text-left">
                  <div className="text-sm text-gray-600 mb-1">Client</div>
                  <div className="font-bold text-gray-900">{createdTicket.user_name}</div>
                  <div className="text-sm text-gray-500">{createdTicket.user_phone}</div>
                </div>
              </div>

              <button
                onClick={() => setCreatedTicket(null)}
                className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, sublabel }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
        {/* <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span> */}
      </div>
      <div>
        <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-bold text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
      </div>
    </div>
  );
}

function PendingTicketCard({ ticket, onConfirm, onReject, isLoading }: {
  ticket: any;
  onConfirm: () => void;
  onReject: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white border-2 border-yellow-300 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <span className="text-lg font-black text-yellow-700">
              {ticket.ticket_number}
            </span>
          </div>
          <div>
            <div className="font-bold text-gray-900">{ticket.user_name || "Utilisateur"}</div>
            <div className="text-xs text-gray-500">{ticket.user_phone || "N/A"}</div>
          </div>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
          À valider
        </span>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">Service demandé</div>
        <div className="font-bold text-gray-900 text-sm">
          {ticket.service?.name || "Service inconnu"}
        </div>
      </div>

      {ticket.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-1 font-bold">Note du client</div>
          <div className="text-sm text-gray-700">{ticket.notes}</div>
        </div>
      )}

      <div className="text-xs text-gray-400 mb-4">
        Créé {new Date(ticket.created_at).toLocaleString("fr-FR")}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirmer
        </button>
        <button
          onClick={onReject}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="w-4 h-4" />
          Refuser
        </button>
      </div>
    </div>
  );
}