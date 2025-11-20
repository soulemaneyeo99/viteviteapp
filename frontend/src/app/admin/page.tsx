// frontend/src/app/admin/page.tsx - MISE À JOUR AVEC LIENS
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users, Clock, TrendingUp, ChevronLeft, UserCog, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/tickets/stats/today`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      return response.data;
    },
    refetchInterval: 10000,
  });

  const stats = statsData || {
    total_tickets_today: 0,
    active_tickets: 0,
    completed_tickets: 0,
    average_wait_time: 0,
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <header className="bg-white border-b-4 border-[#FF8C00]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👨‍💼</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">ViteViteApp</h1>
                  <p className="text-xs text-gray-500">Administration</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={stats.active_tickets}
            label="En attente"
            color="bg-gradient-to-br from-[#FF8C00] to-[#FF6F00]"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            value={`${stats.average_wait_time}min`}
            label="Temps moyen"
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            value={stats.total_tickets_today}
            label="Traités aujourd'hui"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            value={stats.completed_tickets}
            label="Terminés"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="card p-8 hover:shadow-xl transition-all group">
            <UserCog className="w-12 h-12 text-[#FF8C00] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h3>
            <p className="text-gray-600">Créer, modifier et supprimer des utilisateurs</p>
          </Link>

          <Link href="/admin/tickets" className="card p-8 hover:shadow-xl transition-all group">
            <Ticket className="w-12 h-12 text-[#FF8C00] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-2">Gestion des tickets</h3>
            <p className="text-gray-600">Gérer tous les tickets de la plateforme</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: any) {
  return (
    <div className={`${color} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}