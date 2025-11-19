"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Service, Ticket } from "@/types";
import { Users, Clock, TrendingUp, Bell, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Check admin auth
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Fetch stats
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

  // Fetch services
  const { data: servicesData } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/services`);
      return response.data;
    },
  });

  // Fetch all tickets
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

  // Call next ticket
  const callNextMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await axios.post(
        `${API_URL}/api/v1/tickets/call-next/${serviceId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket appelé !");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Erreur");
    },
  });

  // Complete ticket
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
      toast.success("Ticket complété !");
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white border-b-4 border-primary">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl text-black">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-black">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">ViteviteApp</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm hover:text-primary transition">
              Voir le site
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<Users />}
            value={stats.total_tickets_today}
            label="Tickets aujourd'hui"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<Clock />}
            value={stats.active_tickets}
            label="Tickets actifs"
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<TrendingUp />}
            value={stats.completed_tickets}
            label="Complétés"
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Clock />}
            value={`${stats.average_wait_time.toFixed(0)}min`}
            label="Attente moyenne"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<Users />}
            value={stats.services_open}
            label="Services ouverts"
            color="from-indigo-500 to-indigo-600"
          />
        </div>

        {/* Services Management */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Gestion des Services</h2>
            <button
              onClick={() => {
                setSelectedService(null);
                setShowServiceModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceAdminCard
                key={service.id}
                service={service}
                onEdit={() => {
                  setSelectedService(service);
                  setShowServiceModal(true);
                }}
                onCallNext={() => callNextMutation.mutate(service.id)}
              />
            ))}
          </div>
        </section>

        {/* Active Tickets Table */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tickets Actifs</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tickets
                  .filter((t) => ["en_attente", "appelé", "en_service"].includes(t.status))
                  .map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold">{ticket.ticket_number}</td>
                      <td className="px-6 py-4 text-sm">
                        {services.find((s) => s.id === ticket.service_id)?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 font-semibold">#{ticket.position_in_queue}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => completeMutation.mutate(ticket.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Terminer
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {tickets.filter((t) => ["en_attente", "appelé"].includes(t.status)).length === 0 && (
              <div className="text-center py-12 text-gray-500">Aucun ticket actif</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-2xl p-6 shadow-lg`}>
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}

function ServiceAdminCard({ service, onEdit, onCallNext }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-primary">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{service.name}</h3>
          <p className="text-sm text-gray-500">{service.category}</p>
        </div>
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">File:</span>
          <span className="font-bold">{service.current_queue_size} personnes</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Attente:</span>
          <span className="font-bold">{service.estimated_wait_time} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Statut:</span>
          <span className={`font-bold ${service.status === "ouvert" ? "text-green-600" : "text-red-600"}`}>
            {service.status}
          </span>
        </div>
      </div>

      <button
        onClick={onCallNext}
        className="w-full py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark flex items-center justify-center space-x-2"
      >
        <Bell className="w-4 h-4" />
        <span>Appeler prochain</span>
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-800",
    appelé: "bg-green-100 text-green-800",
    en_service: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}