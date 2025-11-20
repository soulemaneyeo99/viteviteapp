"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI, ticketsAPI, predictionsAPI } from "@/lib/api";
import { Service } from "@/types";
import {
  Clock,
  Users,
  MapPin,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
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
      toast.error(error.response?.data?.detail || "Erreur lors de la création");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-40">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              ⚡
            </div>
            <span className="text-xl font-black">ViteviteApp</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-black">
              Mes tickets
            </Link>
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold"
            >
              🛍️ Marketplace
            </Link>
          </div>
        </nav>
      </header>

      {/* PAGE CONTENT */}
      <div className="container mx-auto px-4 py-8">
        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black">Services disponibles</h1>
          <p className="text-xl text-gray-600">Choisissez un service et prenez un ticket</p>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                selectedCategory === cat
                  ? "bg-primary text-black"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold">Aucun service trouvé</h3>
            <p className="text-gray-600">Essayez une autre catégorie</p>
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
//              SERVICE CARD
// ---------------------------------------------
function ServiceCard({
  service,
  onTakeTicket,
}: {
  service: Service;
  onTakeTicket: () => void;
}) {
  const affluenceColors = {
    faible: "bg-green-100 text-green-800 border-green-300",
    modérée: "bg-yellow-100 text-yellow-800 border-yellow-300",
    élevée: "bg-orange-100 text-orange-800 border-orange-300",
    très_élevée: "bg-red-100 text-red-800 border-red-300",
  };

  const statusColors = {
    ouvert: "bg-green-500",
    fermé: "bg-red-500",
    en_pause: "bg-yellow-500",
  };

  const isOpen = service.status === "ouvert";

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 relative group">
      <div className={`absolute top-0 right-0 w-3 h-3 ${statusColors[service.status]}`} />

      {/* ICON + NAME */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-4xl">{service.icon || "🏢"}</div>
          <div>
            <h3 className="font-bold text-lg">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.category}</p>
          </div>
        </div>
      </div>

      {/* AFFLUENCE */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${affluenceColors[service.affluence_level]}`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        Affluence: {service.affluence_level}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <Users className="w-4 h-4 text-gray-500" />
          <div className="font-bold text-lg">{service.current_queue_size}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="font-bold text-lg">{service.estimated_wait_time} min</div>
        </div>
      </div>

      {/* LOCATION */}
      {service.location && (
        <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{service.location.address}</span>
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={onTakeTicket}
        disabled={!isOpen}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center ${
          isOpen ? "bg-primary text-black hover:bg-primary-dark" : "bg-gray-200 text-gray-500"
        }`}
      >
        {isOpen ? "Prendre un ticket" : "Service fermé"}
        {isOpen && <ArrowRight className="w-5 h-5 ml-2" />}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Prendre un ticket - {selectedService.name}</h2>
            <p className="text-sm text-gray-600">{selectedService.category}</p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Nom (facultatif)</label>
            <input
              value={ticketForm.name}
              onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Téléphone (facultatif)</label>
            <input
              value={ticketForm.phone}
              onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="06XXXXXXXX"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Notes</label>
            <textarea
              value={ticketForm.notes}
              onChange={(e) => setTicketForm({ ...ticketForm, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder="Informations supplémentaires"
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Prédiction IA</span>
              </div>
              {loadingPrediction && <div className="text-sm text-gray-500">Chargement...</div>}
            </div>
            {!loadingPrediction && prediction && (
              <div className="text-sm text-gray-600">
                {prediction.message || JSON.stringify(prediction)}
              </div>
            )}
            {!loadingPrediction && !prediction && (
              <div className="text-sm text-gray-500">Aucune prédiction disponible</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <button
            onClick={submitTicket}
            className="flex-1 py-3 bg-primary text-black rounded-lg font-bold"
          >
            Confirmer et prendre un ticket
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
