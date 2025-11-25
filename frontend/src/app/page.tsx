"use client";

import Link from "next/link";
import {
  Building2, Hospital, Pill, Bus, ArrowRight, Search, Clock, Users,
  ShieldCheck, Activity, MapPin, ChevronRight, Sparkles, TrendingDown,
  AlertCircle, Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI } from "@/lib/api";
import { Service } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Categories principales
  const categories = [
    {
      id: "administrations",
      name: "Administrations",
      icon: Building2,
      description: "Mairies, Préfectures, CNPS, Impôts...",
      color: "from-blue-600 to-indigo-600",
      href: "/administrations",
      count: "12 services"
    },
    {
      id: "hospitals",
      name: "Hôpitaux",
      icon: Hospital,
      description: "Urgences, Consultations, Analyses...",
      color: "from-red-600 to-pink-600",
      href: "/urgences",
      count: "8 services"
    },
    {
      id: "pharmacies",
      name: "Pharmacies",
      icon: Pill,
      description: "Pharmacies de garde, Médicaments...",
      color: "from-emerald-600 to-green-600",
      href: "/pharmacies",
      count: "24 pharmacies"
    },
    {
      id: "transport",
      name: "Transport",
      icon: Bus,
      description: "SOTRA, Interurbain, Réservations...",
      color: "from-orange-600 to-amber-600",
      href: "/transport",
      count: "15 lignes"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-32 pb-24 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-sm font-bold text-white/90 uppercase tracking-wide">Système opérationnel à Abidjan</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
            Fini les files d'attente.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
              Prenez votre ticket en ligne.
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
            La plateforme officielle pour gérer vos démarches administratives, médicales et de transport en Côte d'Ivoire. Files d'attente en temps réel, tickets digitaux, et recommandations IA.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-white p-2 rounded-2xl shadow-2xl border border-white/20">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Rechercher : CNI, Mairie, Passeport, CIE..."
                  className="w-full px-4 py-4 text-lg bg-transparent border-none focus:ring-0 placeholder:text-gray-400 font-medium text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  <span>Rechercher</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 py-16 -mt-12 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-white/20 group-hover:to-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-gray-700 group-hover:text-white transition-colors" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-white mb-2 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 group-hover:text-white/80 mb-4 transition-colors">
                      {category.description}
                    </p>

                    {/* Count Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 group-hover:bg-white/20 rounded-full transition-colors">
                      <span className="text-xs font-bold text-gray-700 group-hover:text-white transition-colors">
                        {category.count}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-6 right-6 w-10 h-10 bg-gray-100 group-hover:bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-all">
                      <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real-time Queue Status */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Files d'attente en direct</h2>
              <p className="text-gray-500">Statut en temps réel des administrations autour de vous</p>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <LiveQueueStatus />
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="px-6 py-16 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-1 shadow-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-[1.4rem] p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-white mb-2">Recommandations IA</h3>
                  <p className="text-violet-100">Basées sur votre localisation et l'heure actuelle</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-5 h-5 text-green-300" />
                    <span className="text-xs font-bold text-green-300 uppercase tracking-wider">Meilleur moment</span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">
                    <span className="font-black">Mairie de Cocody</span> : Affluence faible prévue dans 30 min. Temps d'attente estimé : ~10 min.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-300" />
                    <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">À éviter</span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">
                    <span className="font-black">CIE Plateau</span> : Pic d'affluence détecté. Revenez plutôt vers 15h pour éviter 45 min d'attente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-2">15h</div>
              <p className="text-gray-600 font-medium">économisées par mois en moyenne</p>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mb-2">5000+</div>
              <p className="text-gray-600 font-medium">citoyens utilisent ViteviteApp</p>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">50+</div>
              <p className="text-gray-600 font-medium">services disponibles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-slate-50 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70 hover:opacity-100 transition-opacity">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-bold">Partenaire Officiel des Administrations</span>
        </div>
        <p className="text-gray-500 text-sm">© 2024 ViteviteApp. Fait avec ❤️ à Abidjan.</p>
      </footer>
    </div>
  );
}

// Live Queue Status Component
function LiveQueueStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "live"],
    queryFn: async () => {
      const response = await servicesAPI.getAll();
      return response.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-32 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const services: Service[] = data?.services?.slice(0, 6) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services?id=${service.id}`}
          className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{service.name}</h4>
              <p className="text-xs text-gray-500">{service.category}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${service.status === 'ouvert' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
              {service.status === 'ouvert' ? 'Ouvert' : 'Fermé'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase">File</span>
              </div>
              <div className="text-lg font-black text-gray-900">{service.current_queue_size}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase">Attente</span>
              </div>
              <div className="text-lg font-black text-gray-900">{service.estimated_wait_time}min</div>
            </div>
          </div>

          {service.location && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{service.location.address}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
