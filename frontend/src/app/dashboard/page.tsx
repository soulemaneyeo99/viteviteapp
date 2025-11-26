"use client";

import { useQuery } from "@tanstack/react-query";
import { ticketsAPI, authAPI } from "@/lib/api";
import { Ticket } from "@/types";
import { Clock, TrendingUp, CheckCircle2, XCircle, User, Ticket as TicketIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Fetch user
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await authAPI.getMe();
      return response.data;
    },
  });

  // Fetch tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async () => {
      const response = await ticketsAPI.getMyTickets();
      return response.data;
    },
  });

  const tickets: Ticket[] = ticketsData?.tickets || [];
  const activeTickets = tickets.filter((t) =>
    ["en_attente", "appelé", "en_service"].includes(t.status)
  );
  const completedTickets = tickets.filter((t) => t.status === "terminé");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-24 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Mes Tickets
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Gérez et suivez vos demandes en temps réel
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <User className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <div className="text-xs text-gray-500 font-medium">Connecté en tant que</div>
              <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                {userData?.full_name || userData?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Tickets Notification */}
        {tickets.filter((t) => t.status === "refusé").length > 0 && (
          <div className="mb-6 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500 rounded-xl flex-shrink-0">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-red-900 mb-1">
                  {tickets.filter((t) => t.status === "refusé").length} ticket(s) refusé(s)
                </div>
                <div className="text-sm text-red-700">
                  Vos demandes n'ont pas été acceptées par l'administration. Veuillez vérifier les informations et réessayer.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
            value={activeTickets.length}
            label="Tickets actifs"
            bgColor="bg-yellow-50"
            iconColor="text-yellow-600"
            borderColor="border-yellow-100"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
            value={completedTickets.length}
            label="Terminés"
            bgColor="bg-green-50"
            iconColor="text-green-600"
            borderColor="border-green-100"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
            value={tickets.length}
            label="Total tickets"
            bgColor="bg-gray-50"
            iconColor="text-gray-600"
            borderColor="border-gray-100"
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            value={tickets.filter((t) => t.status === "annulé").length}
            label="Annulés"
            bgColor="bg-red-50"
            iconColor="text-red-600"
            borderColor="border-red-100"
          />
        </div>

        {/* Active Tickets */}
        {activeTickets.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Tickets actifs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </section>
        )}

        {/* All Tickets */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Historique</h2>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {tickets.length === 0 ? (
              <div className="text-center py-16 sm:py-20 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TicketIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Aucun ticket pour le moment
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                  Commencez par prendre un ticket pour un service et suivez son évolution en temps réel
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Prendre un ticket
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  bgColor,
  iconColor,
  borderColor,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}) {
  return (
    <div className={`bg-white border-2 ${borderColor} rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-yellow-500/30`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 sm:p-3 ${bgColor} rounded-xl ${iconColor}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{value}</div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const statusColors: Record<string, string> = {
    en_attente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    appelé: "bg-green-50 text-green-700 border-green-200",
    en_service: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <Link
      href={`/ticket/${ticket.id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 sm:p-6 border-2 border-gray-100 hover:border-yellow-500/30 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl sm:text-3xl font-black text-yellow-600 group-hover:text-yellow-700 transition-colors">
          {ticket.ticket_number}
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${statusColors[ticket.status]}`}
        >
          {ticket.status === "en_attente"
            ? "En attente"
            : ticket.status === "appelé"
              ? "Appelé"
              : "En service"}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600 font-medium">Position:</span>
          <span className="font-bold text-gray-900">#{ticket.position_in_queue}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600 font-medium">Attente:</span>
          <span className="font-bold text-gray-900">{ticket.estimated_wait_time} min</span>
        </div>
      </div>
    </Link>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const statusIcons: Record<string, string> = {
    en_attente: "⏳",
    appelé: "🔔",
    en_service: "⚙️",
    terminé: "✅",
    annulé: "❌",
    refusé: "🚫",
  };

  const statusColors: Record<string, string> = {
    en_attente: "text-yellow-600",
    appelé: "text-green-600",
    en_service: "text-gray-600",
    terminé: "text-gray-600",
    annulé: "text-gray-400",
    refusé: "text-red-600",
  };

  const statusLabels: Record<string, string> = {
    en_attente: "En attente",
    appelé: "Appelé",
    en_service: "En service",
    terminé: "Terminé",
    annulé: "Annulé",
    refusé: "Refusé",
  };

  return (
    <Link
      href={`/ticket/${ticket.id}`}
      className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="text-2xl sm:text-3xl">{statusIcons[ticket.status]}</div>
        <div>
          <div className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
            {ticket.ticket_number}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <span>
              {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </span>
            <span className={`font-bold ${statusColors[ticket.status]}`}>
              • {statusLabels[ticket.status]}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs sm:text-sm text-gray-500 font-medium">Position</div>
        <div className="font-bold text-gray-900 text-lg">#{ticket.position_in_queue}</div>
      </div>
    </Link>
  );
}