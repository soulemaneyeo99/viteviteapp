// frontend/src/app/services/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI, ticketsAPI } from "@/lib/api";
import { Service } from "@/types";
import { Search, MapPin, Clock, Users, FileText, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ChatBotPro from "@/components/ChatBot";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketForm, setTicketForm] = useState({ name: "", phone: "", notes: "" });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await servicesAPI.getAll();
      return response.data;
    },
  });

  const services: Service[] = servicesData?.services || [];
  const categories = ["Tous", ...Array.from(new Set(services.map((s: Service) => s.category)))];

  const filteredServices = services.filter((service) => {
    const matchCategory = selectedCategory === "Tous" || service.category === selectedCategory;
    const matchSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleTakeTicket = (service: Service) => {
    if (service.status !== "ouvert") {
      toast.error("Ce service est fermé");
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
      window.location.href = `/ticket/${response.data.ticket.id}`;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF8C00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Header */}
      <header className="bg-white border-b border-[#FF8C00] sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C00] to-[#FF6F00] rounded-xl flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">ViteViteApp</h1>
                  <p className="text-xs text-gray-500">Espace Citoyen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Services disponibles</h1>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#FF8C00] text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: Service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onTakeTicket={() => handleTakeTicket(service)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Prendre un ticket</h2>
            
            <div className="bg-[#FFF8E7] rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg mb-2">{selectedService.name}</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{selectedService.current_queue_size} personnes en attente</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>~{selectedService.estimated_wait_time} min d'attente</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Votre nom"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="+225 XX XX XX XX XX"
                value={ticketForm.phone}
                onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                className="input-field"
              />
              <textarea
                placeholder="Notes (optionnel)"
                rows={3}
                value={ticketForm.notes}
                onChange={(e) => setTicketForm({ ...ticketForm, notes: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={submitTicket}
                className="flex-1 btn-primary"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatBotPro />
    </div>
  );
}

function ServiceCard({ service, onTakeTicket }: { service: Service; onTakeTicket: () => void }) {
  const statusColors: Record<string, string> = {
    ouvert: "bg-green-100 text-green-800",
    fermé: "bg-red-100 text-red-800",
    en_pause: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`badge-status ${statusColors[service.status]} mb-2`}>
            {service.status === "ouvert" ? "Ouvert" : "Fermé"}
          </span>
          <h3 className="font-bold text-lg mb-1">{service.name}</h3>
          <p className="text-sm text-gray-600">{service.category}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#FFF8E7] rounded-lg p-3">
          <Users className="w-5 h-5 text-[#FF8C00] mb-1" />
          <div className="text-lg font-bold">{service.current_queue_size}</div>
          <div className="text-xs text-gray-600">personnes</div>
        </div>
        <div className="bg-[#FFF8E7] rounded-lg p-3">
          <Clock className="w-5 h-5 text-[#FF8C00] mb-1" />
          <div className="text-lg font-bold">{service.estimated_wait_time}</div>
          <div className="text-xs text-gray-600">minutes</div>
        </div>
      </div>

      {service.location && (
        <div className="flex items-start text-xs text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{service.location.address}</span>
        </div>
      )}

      <button
        onClick={onTakeTicket}
        disabled={service.status !== "ouvert"}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          service.status === "ouvert"
            ? "bg-[#FF8C00] hover:bg-[#FF6F00] text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {service.status === "ouvert" ? "🎫 Prendre un ticket" : "Service fermé"}
      </button>
    </div>
  );
}