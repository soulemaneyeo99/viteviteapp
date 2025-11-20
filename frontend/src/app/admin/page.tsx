// frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Service, Ticket } from "@/types";
import { Users, Clock, TrendingUp, Bell, ChevronLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"gestion" | "stats">("gestion");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
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

  const { data: servicesData } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/services`);
      return response.data;
    },
  });

  const { data: ticketsData } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/tickets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      return response.data;
    },
    refetchInterval: 5000,
  });

  const services: Service[] = servicesData?.services || [];
  const tickets: Ticket[] = ticketsData?.tickets || [];
  const stats = statsData || {
    total_tickets_today: 0,
    active_tickets: 0,
    completed_tickets: 0,
    average_wait_time: 0,
    services_open: 0,
  };

  const callNextMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await axios.post(
        `${API_URL}/api/v1/tickets/call-next/${serviceId}`,{},
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket appelé !");
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await axios.post(
        `${API_URL}/api/v1/tickets/${ticketId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket terminé !");
    },
  });

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
                  <p className="text-xs text-gray-500">Tableau de bord Administration</p>
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

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("gestion")}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold border-b-4 transition-all ${
                activeTab === "gestion"
                  ? "border-[#FF8C00] text-[#FF8C00]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Gestion des files</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold border-b-4 transition-all ${
                activeTab === "stats"
                  ? "border-[#FF8C00] text-[#FF8C00]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Statistiques</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === "gestion" ? (
          <>
            {/* Stats Cards */}
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
                icon={<Users className="w-6 h-6" />}
                value={stats.completed_tickets}
                label="Absents"
                color="bg-gradient-to-br from-red-500 to-red-600"
              />
            </div>

            {/* Services actifs */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Services actifs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services
                  .filter((s) => s.status === "ouvert")
                  .map((service) => (
                    <ServiceAdminCard
                      key={service.id}
                      service={service}
                      onCallNext={() => callNextMutation.mutate(service.id)}
                    />
                  ))}
              </div>
            </section>

            {/* File d'attente */}
            <section>
              <h2 className="text-xl font-bold mb-4">File d'attente - Préfecture d'Abidjan - Cartes d'identité</h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-[#FFF8E7] flex items-center justify-between border-b">
                  <div className="flex items-center space-x-3">
                    <button className="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center">
                      ▶
                    </button>
                    <button className="w-10 h-10 bg-[#FF8C00] text-white rounded-lg hover:bg-[#FF6F00] flex items-center justify-center">
                      ⏸
                    </button>
                    <button className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center">
                      ⏹
                    </button>
                  </div>
                </div>

                <div className="divide-y">
                  {tickets
                    .filter((t) => ["en_attente", "appelé", "en_service"].includes(t.status))
                    .slice(0, 5)
                    .map((ticket) => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        onComplete={() => completeMutation.mutate(ticket.id)}
                      />
                    ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <StatsView stats={stats} />
        )}
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

function ServiceAdminCard({ service, onCallNext }: any) {
  return (
    <div className="card p-5 border-l-4 border-[#FF8C00]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-base mb-1">{service.name}</h3>
          <span className="text-xs text-gray-500">{service.category}</span>
        </div>
        <span className="badge-status bg-green-100 text-green-800">Ouvert</span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">{service.current_queue_size} personnes</span>
          <span className="font-bold">{service.estimated_wait_time} min</span>
        </div>
      </div>

      <button
        onClick={onCallNext}
        className="w-full py-2 bg-[#FF8C00] hover:bg-[#FF6F00] text-white font-semibold rounded-lg flex items-center justify-center space-x-2"
      >
        <Bell className="w-4 h-4" />
        <span>Appeler</span>
      </button>
    </div>
  );
}

function TicketRow({ ticket, onComplete }: any) {
  const statusColors: Record<string, string> = {
    en_attente: "bg-[#FFF8E7] text-gray-700",
    appelé: "bg-green-100 text-green-800",
    en_service: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{ticket.ticket_number}</span>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{ticket.user_name || "Amadou Diallo"}</div>
          <div className="text-sm text-gray-500">Attend depuis {ticket.estimated_wait_time} min</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onComplete}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
        >
          Terminer
        </button>
        <button className="px-5 py-2 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold rounded-lg">
          Absent
        </button>
      </div>
    </div>
  );
}

function StatsView({ stats }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          value={156}
          label="Total servis"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value={23}
          label="En attente"
          color="bg-gradient-to-br from-[#FF8C00] to-[#FF6F00]"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          value="42min"
          label="Temps moyen"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value="94%"
          label="Taux de présence"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Affluence par heure</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[45, 68, 95, 72, 35, 28, 56, 62, 42, 22].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-[#FF8C00] to-[#FFD43B] rounded-t"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-500 mt-2">{7 + idx}h</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Tendance hebdomadaire</h3>
          <div className="h-64 flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <polyline
                points="0,150 50,120 100,100 150,140 200,80 250,60 300,90 350,110 400,80"
                fill="none"
                stroke="#FF8C00"
                strokeWidth="3"
              />
              <polyline
                points="0,150 50,120 100,100 150,140 200,80 250,60 300,90 350,110 400,80"
                fill="url(#gradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#FFF8E7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Heures de pointe</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Matin</span>
              <span className="font-bold">9h - 11h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Après-midi</span>
              <span className="font-bold">14h - 16h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pic maximal</span>
              <span className="font-bold">10h (89 pers.)</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Taux de service</span>
              <span className="font-bold text-green-600">96%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Temps moyen/personne</span>
              <span className="font-bold">4.2 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Satisfaction</span>
              <span className="font-bold text-green-600">87%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-lg mb-4">Recommandations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <span>⚡</span>
            <span className="text-sm">Ajouter 1 guichet entre 9h-11h</span>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <span>⚠️</span>
            <span className="text-sm">Taux d'absence élevé à 12h</span>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
            <span>✅</span>
            <span className="text-sm">Performance optimale l'après-midi</span>
          </div>
        </div>
      </div>
    </div>
  );
}