"use client";

import { useQuery } from "@tanstack/react-query";
import { servicesAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Building2, Users, Clock, TrendingUp, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export default function AdminLandingPage() {
  const router = useRouter();

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await servicesAPI.getAll();
      return response.data;
    },
  });

  const services = servicesData?.services || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-xl text-white">⚡</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">ViteViteApp</h1>
                <p className="text-xs text-gray-500 font-medium">Administration</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Système opérationnel</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Centre de Contrôle</h2>
          <p className="text-gray-600">Sélectionnez un service pour accéder à son tableau de bord</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <button
              key={service.id}
              onClick={() => router.push(`/admin/services/${service.id}`)}
              className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              {/* Service Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">{service.category}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase">File</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{service.current_queue_size || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Attente</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{service.average_wait_time || 0}<span className="text-sm text-gray-500 ml-1">min</span></p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold ${service.status === "ouvert"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${service.status === "ouvert" ? "bg-green-500" : "bg-red-500"}`}></span>
                  <span>{service.status === "ouvert" ? "Ouvert" : "Fermé"}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{service.active_counters || 0} guichets</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun service disponible</h3>
            <p className="text-gray-600">Les services apparaîtront ici une fois configurés</p>
          </div>
        )}
      </main>
    </div>
  );
}