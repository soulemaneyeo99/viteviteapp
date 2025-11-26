'use client';

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users, Clock, TrendingUp, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
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

  const { data: dashboardData } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      return response.data;
    },
    refetchInterval: 10000,
  });

  const stats = dashboardData?.overview || {
    waiting_count: 0,
    completed_today: 0,
    average_wait_time: 0,
    active_agents: 0,
    avg_processing_time: 0
  };

  const alerts = dashboardData?.alerts || [];
  const servicesStatus = dashboardData?.services_status || [];

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <AdminHeader title="Centre de Contrôle" onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          {/* Smart Alerts Section */}
          {alerts.length > 0 && (
            <div className="mb-8 space-y-3">
              {alerts.map((alert: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${alert.level === 'high'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold">{alert.message}</span>
                  </div>
                  {alert.action && (
                    <button className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded-lg text-sm font-bold transition-colors">
                      {alert.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats Grid (Step A) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="En attente"
              value={stats.waiting_count}
              icon={<Users className="w-6 h-6" />}
              color="orange"
              trend={{ value: 0, label: "personnes", isPositive: false }}
            />
            <StatCard
              title="Traités ce jour"
              value={stats.completed_today}
              icon={<CheckCircle2 className="w-6 h-6" />}
              color="green"
              trend={{ value: 0, label: "dossiers", isPositive: true }}
            />
            <StatCard
              title="Attente moyenne"
              value={`${stats.average_wait_time} min`}
              icon={<Clock className="w-6 h-6" />}
              color="blue"
              trend={{ value: 0, label: "estimé", isPositive: true }}
            />
            <StatCard
              title="Agents actifs"
              value={stats.active_agents}
              icon={<Users className="w-6 h-6" />}
              color="purple"
              trend={{ value: 0, label: "connectés", isPositive: true }}
            />
            <StatCard
              title="Temps / Dossier"
              value={`${stats.avg_processing_time} min`}
              icon={<Activity className="w-6 h-6" />}
              color="indigo"
              trend={{ value: 0, label: "moyen", isPositive: true }}
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
                  {servicesStatus.map((service: any) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                          }`}></div>
                        <span className="text-sm font-medium text-slate-700">{service.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {service.queue_size > 0 ? `${service.queue_size} en attente` : 'Calme'}
                      </span>
                    </div>
                  ))}
                  {servicesStatus.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Aucun service actif</p>
                  )}
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