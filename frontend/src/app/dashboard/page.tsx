"use client";

import { useQuery } from "@tanstack/react-query";
import { ticketsAPI, authAPI } from "@/lib/api";
import { Ticket } from "@/types";
import { Clock, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-black">ViteviteApp</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/services"
              className="px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark"
            >
              Nouveau ticket
            </Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            Bonjour {userData?.full_name || userData?.email} 👋
          </h1>
          <p className="text-xl text-gray-600">Voici vos tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            value={activeTickets.length}
            label="Tickets actifs"
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<CheckCircle2 className="w-8 h-8" />}
            value={completedTickets.length}
            label="Terminés"
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            value={tickets.length}
            label="Total tickets"
            color="from-blue-500 to-indigo-500"
          />
          <StatCard
            icon={<XCircle className="w-8 h-8" />}
            value={tickets.filter((t) => t.status === "annulé").length}
            label="Annulés"
            color="from-red-500 to-pink-500"
          />
        </div>

        {/* Active Tickets */}
        {activeTickets.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Tickets actifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </section>
        )}

        {/* All Tickets */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Historique</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-bold mb-2">Aucun ticket</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore pris de ticket
                </p>
                <Link
                  href="/services"
                  className="inline-block px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark"
                >
                  Prendre un ticket
                </Link>
              </div>
            ) : (
              <div className="divide-y">
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
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-2xl p-6 shadow-lg`}>
      <div className="mb-3">{icon}</div>
      <div className="text-4xl font-black mb-1">{value}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const statusColors: Record<string, string> = {
    en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    appelé: "bg-green-100 text-green-800 border-green-300",
    en_service: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <Link
      href={`/ticket/${ticket.id}`}
      className="block bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-2 border-transparent hover:border-primary"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl font-black text-primary">{ticket.ticket_number}</div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[ticket.status]}`}
        >
          {ticket.status === "en_attente"
            ? "En attente"
            : ticket.status === "appelé"
            ? "Appelé"
            : "En service"}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Position:</span>
          <span className="font-bold">#{ticket.position_in_queue}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Attente:</span>
          <span className="font-bold">{ticket.estimated_wait_time} min</span>
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
  };

  return (
    <Link
      href={`/ticket/${ticket.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
    >
      <div className="flex items-center space-x-4">
        <div className="text-2xl">{statusIcons[ticket.status]}</div>
        <div>
          <div className="font-bold">{ticket.ticket_number}</div>
          <div className="text-sm text-gray-600">
            {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">Position</div>
        <div className="font-bold">#{ticket.position_in_queue}</div>
      </div>
    </Link>
  );
}