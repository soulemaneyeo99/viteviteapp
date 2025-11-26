"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '@/lib/api';
import { X, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
    id: string;
    ticket_number: string;
    user_name: string;
    user_phone?: string;
    service_id: string;
    status: string;
    created_at: string;
    estimated_wait_time: number;
    notes?: string;
}

interface ValidateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

export default function ValidateTicketModal({ isOpen, onClose, ticket }: ValidateTicketModalProps) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const queryClient = useQueryClient();

    // Validate ticket mutation
    const validateMutation = useMutation({
        mutationFn: async ({ ticketId, action, reason }: { ticketId: string; action: 'approve' | 'reject'; reason?: string }) => {
            const response = await ticketsAPI.validate(ticketId, { action, reason });
            return response.data;
        },
        onSuccess: (data, variables) => {
            const actionText = variables.action === 'approve' ? 'approuvé' : 'refusé';
            toast.success(`Ticket ${actionText} avec succès`);
            queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['service-stats'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur lors de la validation');
        }
    });

    const handleClose = () => {
        setShowRejectForm(false);
        setRejectionReason('');
        onClose();
    };

    const handleApprove = () => {
        if (!ticket) return;
        validateMutation.mutate({ ticketId: ticket.id, action: 'approve' });
    };

    const handleReject = () => {
        if (!ticket) return;
        if (!showRejectForm) {
            setShowRejectForm(true);
            return;
        }
        validateMutation.mutate({
            ticketId: ticket.id,
            action: 'reject',
            reason: rejectionReason || 'Aucune raison spécifiée'
        });
    };

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Validation de Ticket</h2>
                            <p className="text-xs text-gray-500">Approuver ou refuser la demande</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={validateMutation.isPending}
                        className="p-2 hover:bg-white/50 rounded-full text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Ticket Details */}
                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">N° Ticket</p>
                                <p className="text-lg font-black text-orange-600">{ticket.ticket_number}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attente estimée</p>
                                <p className="text-lg font-black text-gray-900">{ticket.estimated_wait_time} min</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">Client</span>
                            <span className="text-sm font-bold text-gray-900">{ticket.user_name}</span>
                        </div>
                        {ticket.user_phone && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-500">Téléphone</span>
                                <span className="text-sm font-bold text-gray-900">{ticket.user_phone}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">Créé le</span>
                            <span className="text-sm font-bold text-gray-900">
                                {new Date(ticket.created_at).toLocaleString('fr-FR')}
                            </span>
                        </div>
                        {ticket.notes && (
                            <div className="py-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {ticket.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Rejection Form */}
                    {showRejectForm && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3 animate-in slide-in-from-top duration-200">
                            <label className="text-sm font-bold text-red-900">Raison du refus (optionnel)</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ex: Documents manquants, horaires non respectés..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    {!showRejectForm ? (
                        <>
                            <button
                                onClick={handleReject}
                                disabled={validateMutation.isPending}
                                className="flex-1 px-4 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <XCircle className="w-5 h-5" />
                                Refuser
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={validateMutation.isPending}
                                className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                            >
                                {validateMutation.isPending && validateMutation.variables?.action === 'approve' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Validation...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Approuver
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowRejectForm(false)}
                                disabled={validateMutation.isPending}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={validateMutation.isPending}
                                className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                            >
                                {validateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Refus...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        Confirmer le refus
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
