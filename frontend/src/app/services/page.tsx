"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI, ticketsAPI, predictionsAPI } from "@/lib/api";
import { Service } from "@/types";
import {
  Clock,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Building2,
  IdCard,
  Zap,
  Droplet,
  Activity,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", phone: "", notes: "" });
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // ---- FETCH SERVICES ----
  const { data, isLoading } = useQuery({
    queryKey: ["services", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
      const response = await servicesAPI.getAll(params);
      return response.data;
    },
  });

  const services: Service[] = data?.services ?? [];
  const categories = ["all", ...new Set(services.map(s => s.category))];

  // ---- TAKE TICKET ----
  const handleTakeTicket = async (service: Service) => {
    if (service.status !== "ouvert") {
      toast.error("Ce service est actuellement fermé");
      return;
    }

    setSelectedService(service);
    setShowModal(true);

    // IA Prediction
    setLoadingPrediction(true);
    try {
      const response = await predictionsAPI.predict(service.id);
      setPrediction(response.data);
    } catch (err) {
      console.error("Erreur prédiction:", err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // ---- SUBMIT ----
  const submitTicket = async () => {
    if (!selectedService) return;

    try {
      const response = await ticketsAPI.create({
        service_id: selectedService.id,
        user_name: ticketForm.name || undefined,
        user_phone: ticketForm.phone || undefined,
        notes: ticketForm.notes || undefined,
      });

      toast.success(`Ticket ${response.data.ticket.ticket_number} créé !`);

      setShowModal(false);
      setTicketForm({ name: "", phone: "", notes: "" });
      setPrediction(null);

      window.location.href = `/ticket/${response.data.ticket.id}`;
    } catch (error: any) {
      let message = "Erreur lors de la création";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((e: any) => e.msg).join(", ");
        } else if (typeof detail === "object") {
          message = JSON.stringify(detail);
        }
      }
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-xl text-white">⚡</span>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">ViteViteApp</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Mes tickets
            </Link>
            <Link
              href="/marketplace"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors"
            >
              <span>🛍️</span>
              <span>Marketplace</span>
            </Link>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              {/* Placeholder avatar */}
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
            </div>
          </div>
        </nav>
      </header>

      {/* PAGE CONTENT */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* TITLE & SEARCH */}
        <div className="mb-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Services disponibles</h1>
            <p className="text-gray-500">Sélectionnez un service pour prendre votre ticket</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${selectedCategory === cat
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 transform scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
              {cat === "all" ? "Tous" : cat}
            </button>
          ))}
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} onTakeTicket={() => handleTakeTicket(service)} />
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-500">Essayez de changer de catégorie ou de recherche</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && selectedService && (
        <TicketModal
          selectedService={selectedService}
          setShowModal={setShowModal}
          ticketForm={ticketForm}
          setTicketForm={setTicketForm}
          prediction={prediction}
          loadingPrediction={loadingPrediction}
          submitTicket={submitTicket}
        />
      )}
    </div>
  );
}

// ---------------------------------------------
//              ICON MAPPING
// ---------------------------------------------
const iconMap: Record<string, any> = {
  "building": Building2,
  "id-card": IdCard,
  "zap": Zap,
  "droplet": Droplet,
  "activity": Activity,
  "credit-card": CreditCard,
};

// ---------------------------------------------
//              SERVICE CARD
// ---------------------------------------------
function ServiceCard({
  service,
  onTakeTicket,
}: {
  service: Service;
  onTakeTicket: () => void;
}) {
  const isOpen = service.status === "ouvert";
  const IconComponent = iconMap[service.icon] || Building2;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-custom-sm hover:shadow-custom-lg transition-all duration-300 group relative overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-6 right-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
          {isOpen ? "Ouvert" : "Fermé"}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="w-8 h-8 text-gray-700 group-hover:text-primary transition-colors" />
        </div>
        <div className="pt-1">
          <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{service.category}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">File</span>
          </div>
          <div className="text-xl font-black text-gray-900">
            {service.current_queue_size} <span className="text-xs font-normal text-gray-400">pers.</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Attente</span>
          </div>
          <div className="text-xl font-black text-gray-900">
            {service.estimated_wait_time} <span className="text-xs font-normal text-gray-400">min</span>
          </div>
        </div>
      </div>

      {/* Location */}
      {service.location && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50/50 p-2 rounded-lg">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{service.location.address}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onTakeTicket}
        disabled={!isOpen}
        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isOpen
          ? "bg-gray-900 text-white hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-0.5"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {isOpen ? "Prendre un ticket" : "Fermé pour le moment"}
        {isOpen && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}

// ---------------------------------------------
//              TICKET MODAL
// ---------------------------------------------
function TicketModal({
  selectedService,
  setShowModal,
  ticketForm,
  setTicketForm,
  prediction,
  loadingPrediction,
  submitTicket,
}: {
  selectedService: Service;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  ticketForm: { name: string; phone: string; notes: string };
  setTicketForm: React.Dispatch<React.SetStateAction<{ name: string; phone: string; notes: string }>>;
  prediction: any;
  loadingPrediction: boolean;
  submitTicket: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Nouveau ticket</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">{selectedService.name}</p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Nom (facultatif)</label>
              <input
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                className="input-field"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Téléphone (facultatif)</label>
              <input
                value={ticketForm.phone}
                onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                className="input-field"
                placeholder="06XXXXXXXX"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Notes</label>
              <textarea
                value={ticketForm.notes}
                onChange={(e) => setTicketForm({ ...ticketForm, notes: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="Informations supplémentaires..."
              />
            </div>
          </div>

          {/* AI Prediction Box */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-bold text-purple-900 text-sm">Estimation IA</span>
              </div>
              {loadingPrediction && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-purple-600 font-medium">Analyse...</span>
                </div>
              )}
            </div>

            {!loadingPrediction && prediction && (
              <p className="text-sm text-purple-800 leading-relaxed font-medium">
                {prediction.message || "Affluence modérée prévue dans les prochaines 30 minutes."}
              </p>
            )}
            {!loadingPrediction && !prediction && (
              <p className="text-sm text-purple-400 italic">Aucune prédiction disponible pour le moment.</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={submitTicket}
              className="flex-[2] py-4 px-6 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Confirmer le ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
