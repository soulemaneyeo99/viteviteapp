'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI, ticketsAPI } from '@/lib/api';
import { X, Loader2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
    id: string;
    name: string;
    category: string;
}

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
    const [selectedService, setSelectedService] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');

    const queryClient = useQueryClient();

    // Fetch services
    const { data: servicesData, isLoading: isLoadingServices, error: servicesError } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await servicesAPI.getAll();
            return response.data;
        },
        enabled: isOpen,
    });

    const services = servicesData?.services || [];

    // Create ticket mutation
    const createTicketMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await ticketsAPI.create(data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Ticket créé avec succès');
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recent-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            onClose();
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur lors de la création du ticket');
        }
    });

    const resetForm = () => {
        setSelectedService('');
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) {
            toast.error('Veuillez sélectionner un service');
            return;
        }

        createTicketMutation.mutate({
            service_id: selectedService,
            user_name: customerName || 'Client Anonyme',
            user_phone: customerPhone,
            notes: notes
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Nouveau Ticket</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Service Selection */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Service</label>
                        {isLoadingServices ? (
                            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
                        ) : servicesError ? (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Erreur de chargement des services</span>
                            </div>
                        ) : (
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                                required
                            >
                                <option value="">Sélectionner un service...</option>
                                {services.map((service: Service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Nom du client (Optionnel)</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ex: Kouamé Jean"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                        />
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Ex: 0707070707"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Notes (Optionnel)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Détails supplémentaires..."
                            rows={3}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={createTicketMutation.isPending}
                            className="flex-1 px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {createTicketMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Créer le ticket
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
