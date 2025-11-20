// frontend/src/app/admin/tickets/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, Edit, Trash2, ChevronLeft, Filter, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TicketsManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["admin-all-tickets", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await axios.get(`${API_URL}/api/v1/admin/tickets?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      return response.data;
    },
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      await axios.delete(`${API_URL}/api/v1/admin/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-tickets"] });
      toast.success("Ticket supprimé");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ ticketId, data }: any) => {
      await axios.put(`${API_URL}/api/v1/admin/tickets/${ticketId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-tickets"] });
      toast.success("Ticket mis à jour");
      setShowModal(false);
      setEditingTicket(null);
    },
  });

  const handleEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setShowModal(true);
  };

  const handleDelete = (ticketId: string) => {
    if (confirm("Confirmer la suppression ?")) {
      deleteMutation.mutate(ticketId);
    }
  };

  const handleUpdate = () => {
    if (!editingTicket) return;
    updateMutation.mutate({
      ticketId: editingTicket.id,
      data: {
        status: editingTicket.status,
        notes: editingTicket.notes,
      },
    });
  };

  const tickets = ticketsData?.tickets || [];

  const statusColors: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-800",
    appelé: "bg-green-100 text-green-800",
    en_service: "bg-blue-100 text-blue-800",
    terminé: "bg-gray-100 text-gray-800",
    annulé: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <header className="bg-white border-b-4 border-[#FF8C00]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold">Gestion des tickets</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "en_attente", "appelé", "en_service", "terminé", "annulé"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-[#FF8C00] text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status === "all" ? "Tous" : status.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FFF8E7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Ticket</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Position</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FF8C00] border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun ticket trouvé
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#FF8C00]">{ticket.ticket_number}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{ticket.user_name || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">#{ticket.position_in_queue}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {showModal && editingTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Modifier le ticket</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Statut</label>
                <select
                  value={editingTicket.status}
                  onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                >
                  <option value="en_attente">En attente</option>
                  <option value="appelé">Appelé</option>
                  <option value="en_service">En service</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulé">Annulé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={editingTicket.notes || ""}
                  onChange={(e) => setEditingTicket({ ...editingTicket, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-3 bg-[#FF8C00] hover:bg-[#FF6F00] text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {updateMutation.isPending ? "Mise à jour..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}