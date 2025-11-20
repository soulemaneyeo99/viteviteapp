// frontend/src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, Edit, Trash2, Plus, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function UsersManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(`${API_URL}/api/v1/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.delete(`${API_URL}/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Utilisateur supprimé");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, data }: any) => {
      await axios.put(`${API_URL}/api/v1/admin/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Utilisateur mis à jour");
      setShowModal(false);
      setEditingUser(null);
    },
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm("Confirmer la suppression ?")) {
      deleteMutation.mutate(userId);
    }
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    updateMutation.mutate({
      userId: editingUser.id,
      data: {
        full_name: editingUser.full_name,
        phone: editingUser.phone,
        role: editingUser.role,
        is_active: editingUser.is_active,
      },
    });
  };

  const users = usersData?.users || [];

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <header className="bg-white border-b-4 border-[#FF8C00]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold">Gestion des utilisateurs</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
            />
          </div>

          <div className="flex gap-2">
            {["all", "citoyen", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  roleFilter === role
                    ? "bg-[#FF8C00] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {role === "all" ? "Tous" : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FFF8E7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Téléphone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Statut</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{user.full_name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Modifier l'utilisateur</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nom complet</label>
                <input
                  type="text"
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Rôle</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                >
                  <option value="citoyen">Citoyen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  className="w-5 h-5 text-[#FF8C00] focus:ring-[#FF8C00]"
                />
                <label htmlFor="is_active" className="text-sm font-semibold">
                  Compte actif
                </label>
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