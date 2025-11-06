'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Service, TicketCreate } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [ticketData, setTicketData] = useState({ name: '', phone: '', notes: '' });
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory, searchQuery]);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];

  const handleTakeTicket = (service: Service) => {
    setSelectedService(service);
    setShowTicketModal(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setCreatingTicket(true);
    try {
      const ticketPayload: TicketCreate = {
        service_id: selectedService.id,
        user_name: ticketData.name || undefined,
        user_phone: ticketData.phone || undefined,
        notes: ticketData.notes || undefined,
      };

      const ticket = await api.createTicket(ticketPayload);
      
      // Redirige vers la page du ticket
      router.push(`/ticket/${ticket.id}`);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création du ticket');
    } finally {
      setCreatingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Services disponibles</h1>
        <p className="text-xl text-gray-600">
          Choisissez un service et prenez votre ticket virtuel
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un service
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom du service..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD43B] focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD43B] focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun service trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onTakeTicket={handleTakeTicket}
            />
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Prendre un ticket
            </h2>
            <div className="bg-[#FFD43B] bg-opacity-20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-1">{selectedService.name}</h3>
              <p className="text-sm text-gray-600">
                Temps d'attente estimé: {selectedService.estimated_wait_time} minutes
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom (optionnel)
                </label>
                <input
                  type="text"
                  value={ticketData.name}
                  onChange={(e) => setTicketData({...ticketData, name: e.target.value})}
                  placeholder="Ex: Amadou Koné"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD43B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={ticketData.phone}
                  onChange={(e) => setTicketData({...ticketData, phone: e.target.value})}
                  placeholder="Ex: +225 XX XX XX XX XX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD43B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={ticketData.notes}
                  onChange={(e) => setTicketData({...ticketData, notes: e.target.value})}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD43B] focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="flex-1 btn-primary"
                >
                  {creatingTicket ? 'Création...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}