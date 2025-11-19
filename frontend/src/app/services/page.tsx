"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI, ticketsAPI, predictionsAPI } from "@/lib/api";
import { Service } from "@/types";
import { Clock, Users, MapPin, FileText, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", phone: "", notes: "" });
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

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

  const handleTakeTicket = async (service: Service) => {
    if (service.status !== "ouvert") {
      toast.error("Ce service est actuellement fermé");
      return;
    }
    
    setSelectedService(service);
    setShowModal(true);
    
    // Prédiction IA
    setLoadingPrediction(true);
    try {
      const response = await predictionsAPI.predict(service.id);
      setPrediction(response.data);
    } catch (error) {
      console.error("Erreur prédiction:", error);
    } finally {
      setLoadingPrediction(false);
    }
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
      setPrediction(null);

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
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black">
              Mes tickets
            </Link>
            <Link href="/marketplace" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200">
              🛍️ Marketplace
            </Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">Services disponibles</h1>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600">Essayez une autre catégorie</p>
          </div>
        )}
      </div>

      {/* Modal Ticket avec Prédiction IA */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in my-8">
            <h2 className="text-2xl font-bold mb-4">Prendre un ticket</h2>
            
            {/* Service Info */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{selectedService.name}</h3>
                  <p className="text-sm text-gray-600">{selectedService.category}</p>
                </div>
                <div className="text-5xl">{selectedService.icon || "🏢"}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-gray-600 text-xs mb-1">File actuelle</div>
                  <div className="font-bold text-lg">{selectedService.current_queue_size} personnes</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-gray-600 text-xs mb-1">Temps d'attente</div>
                  <div className="font-bold text-lg">{selectedService.estimated_wait_time} min</div>
                </div>
              </div>
            </div>

            {/* Prédiction IA */}
            {loadingPrediction && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                  <span className="text-sm text-purple-700 font-semibold">Analyse IA en cours...</span>
                </div>
              </div>
            )}

            {prediction && !loadingPrediction && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-900 mb-2 flex items-center">
                      Prédiction IA
                      <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                        {Math.round(prediction.confidence * 100)}% confiance
                      </span>
                    </h4>
                    <p className="text-sm text-purple-800 mb-2">
                      <strong>Temps estimé:</strong> {prediction.predicted_wait_time} minutes
                    </p>
                    <p className="text-sm text-purple-700">{prediction.recommendation}</p>
                    {prediction.best_time_to_visit && (
                      <p className="text-xs text-purple-600 mt-2">
                        💡 <strong>Meilleur moment:</strong> {prediction.best_time_to_visit}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Documents requis */}
            {selectedService.required_documents && selectedService.required_documents.length > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 mb-6">
                <h4 className="font-bold text-sm text-blue-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents requis
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {selectedService.required_documents.map((doc: any, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2">{doc.required ? "✅" : "📄"}</span>
                      {doc.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulaire */}
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Votre nom (optionnel)"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Téléphone (optionnel, ex: +225XXXXXXXXXX)"
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

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPrediction(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={submitTicket}
                className="flex-1 px-6 py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary-dark transition flex items-center justify-center space-x-2"
              >
                <span>Confirmer</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SERVICE CARD COMPONENT ==========
function ServiceCard({ service, onTakeTicket }: { service: Service; onTakeTicket: () => void }) {
  const affluenceColors: Record<string, string> = {
    faible: "bg-green-100 text-green-800 border-green-300",
    modérée: "bg-yellow-100 text-yellow-800 border-yellow-300",
    élevée: "bg-orange-100 text-orange-800 border-orange-300",
    très_élevée: "bg-red-100 text-red-800 border-red-300",
  };

  const statusColors: Record<string, string> = {
    ouvert: "bg-green-500",
    fermé: "bg-red-500",
    en_pause: "bg-yellow-500",
  };

  const isOpen = service.status === "ouvert";

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 relative overflow-hidden group">
      {/* Status Indicator */}
      <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${statusColors[service.status]}`}></div>
      
      {/* Icon & Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-4xl">{service.icon || "🏢"}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.category}</p>
          </div>
        </div>
      </div>

      {/* Affluence Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 mb-4 ${affluenceColors[service.affluence_level]}`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        Affluence: {service.affluence_level}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600 text-xs mb-1">
            <Users className="w-4 h-4" />
            <span>File d'attente</span>
          </div>
          <div className="font-bold text-lg">{service.current_queue_size}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600 text-xs mb-1">
            <Clock className="w-4 h-4" />
            <span>Temps estimé</span>
          </div>
          <div className="font-bold text-lg">{service.estimated_wait_time}min</div>
        </div>
      </div>

      {/* Location */}
      {service.location && (
        <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{service.location.address}</span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={onTakeTicket}
        disabled={!isOpen}
        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
          isOpen
            ? "bg-primary text-black hover:bg-primary-dark hover:shadow-lg"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        <span>{isOpen ? "Prendre un ticket" : "Service fermé"}</span>
        {isOpen && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />}
      </button>
    </div>
  );
}