'use client';

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import RecentTicketsTable from "@/components/admin/RecentTicketsTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex font-inter">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <AdminHeader title="Tableau de bord" onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tickets en attente"
              value={stats.active_tickets}
              icon={<Users className="w-6 h-6" />}
              color="orange"
              trend={{ value: 12, label: "vs hier", isPositive: false }}
            />
            <StatCard
              title="Temps d'attente moyen"
              value={`${stats.average_wait_time} min`}
              icon={<Clock className="w-6 h-6" />}
              color="blue"
              trend={{ value: 5, label: "vs hier", isPositive: true }}
            />
            <StatCard
              title="Tickets traités"
              value={stats.total_tickets_today}
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
              trend={{ value: 8, label: "vs hier", isPositive: true }}
            />
            <StatCard
              title="Taux de satisfaction"
              value="98%"
              icon={<CheckCircle2 className="w-6 h-6" />}
              color="green"
              trend={{ value: 2, label: "vs hier", isPositive: true }}
            />
          </div>

          {/* Recent Activity & Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart / Table Area */}
            <div className="lg:col-span-2 space-y-8">
              <RecentTicketsTable />
            </div>

            {/* Side Widgets (e.g., Service Status) */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">État des services</h3>
                <div className="space-y-4">
                  {['Mairie de Cocody', 'Préfecture Abidjan', 'CIE Plateau', 'SODECI Treichville'].map((service, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-slate-700">{service}</span>
                      </div>
                      <span className="text-xs text-slate-400">Opérationnel</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-2">Besoin d'aide ?</h3>
                <p className="text-sm text-slate-400 mb-4">Consultez la documentation administrateur pour plus de détails.</p>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}