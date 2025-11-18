"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI, ticketsAPI, predictionsAPI } from "@/lib/api";
import { Service } from "@/types";
import { Clock, Users, MapPin, FileText, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", phone: "", notes: "" });

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
      const response = await servicesAPI.getAll(params);
      return response.data;
    },
  });

  const services: Service[] = servicesData?.services || [];
  const categories: string[] = ["all", ...Array.from(new Set(services.map((s: Service) => s.category)))];

  const handleTakeTicket = (service: Service) => {
    if (service.status !== "ouvert") {
      toast.error("Ce service est actuellement fermé");
      return;
    }
    setSelectedService(service);
    setShowModal(true);
  };

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

      // Rediriger vers le ticket
      window.location.href = `/ticket/${response.data.ticket.id}`;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur lors de la création");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-black">ViteviteApp</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black transition"
          >
            Mes tickets
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">Services disponibles</h1>
          <p className="text-xl text-gray-600">
            Choisissez un service et prenez votre ticket virtuel
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onTakeTicket={() => handleTakeTicket(service)}
            />
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun service trouvé
            </h3>
            <p className="text-gray-600">Essayez une autre catégorie</p>
          </div>
        )}
      </div>

      {/* Modal Ticket */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Prendre un ticket</h2>
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg mb-1">{selectedService.name}</h3>
              <p className="text-sm text-gray-600">
                Temps d'attente estimé: {selectedService.estimated_wait_time} min
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Votre nom (optionnel)"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={ticketForm.phone}
                onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <textarea
                placeholder="Notes (optionnel)"
                rows={3}
                value={ticketForm.notes}
                onChange={(e) => setTicketForm({ ...ticketForm, notes: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={submitTicket}
                className="flex-1 px-6 py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary-dark"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, onTakeTicket }: { service: Service; onTakeTicket: () => void }) {
  const affluenceColors = {
    faible: "bg-green-100 text-green-800",
    modérée: "bg-yellow-100 text-yellow-800",
    élevée: "bg-orange-100 text-orange-800",
    "très_élevée": "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-2xl">
            {service.icon === "hospital" ? "🏥" : service.icon === "building-columns" ? "🏦" : "🏢"}
          </div>
          <div>
            <h3 className="font-bold text-lg">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.category}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            service.status === "ouvert" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {service.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600 text-xs mb-1">
            <Clock className="w-4 h-4" />
            <span>Attente</span>
          </div>
          <div className="text-xl font-bold">{service.estimated_wait_time} min</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600 text-xs mb-1">
            <Users className="w-4 h-4" />
            <span>File</span>
          </div>
          <div className="text-xl font-bold">{service.current_queue_size} pers.</div>
        </div>
      </div>

      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          affluenceColors[service.affluence_level as keyof typeof affluenceColors] || "bg-gray-100 text-gray-800"
        }`}>
          Affluence {service.affluence_level}
        </span>
      </div>

      <button
        onClick={onTakeTicket}
        disabled={service.status !== "ouvert"}
        className="w-full py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
      >
        <span>Prendre un ticket</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}