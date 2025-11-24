"use client";

import Link from "next/link";
import {
  Zap, ArrowRight, Search, Clock, Users,
  ShieldCheck, Activity, MapPin, ChevronRight,
  Smartphone, Star, Sparkles
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-primary/20 selection:text-primary">

      {/* Hero Section - Compact & Impactful */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Système opérationnel à Abidjan</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Votre temps est <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">précieux</span>.
            <br />Ne le perdez plus.
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            La plateforme officielle pour prendre vos tickets à distance dans les administrations et services publics de Côte d'Ivoire.
          </p>

          {/* Floating Search Bar */}
          <div className="max-w-2xl mx-auto relative z-20 mb-16">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Rechercher un service (ex: Mairie, CIE, SODECI...)"
                  className="w-full px-4 py-4 text-lg bg-transparent border-none focus:ring-0 placeholder:text-gray-400 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary transition-colors flex items-center gap-2">
                  <span>Go</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500 font-medium">
              <span>Populaire :</span>
              <Link href="/services?search=mairie" className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors">🏛️ Mairie</Link>
              <Link href="/services?search=cie" className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors">⚡ CIE</Link>
              <Link href="/services?search=sodeci" className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors">💧 SODECI</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* 1. Live Status (Large) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold">En direct des files</h3>
              </div>

              <div className="flex-grow">
                <LiveServiceList />
              </div>

              <Link href="/services" className="mt-6 inline-flex items-center text-primary font-bold hover:gap-2 transition-all">
                Voir tous les services <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* 2. Primary Action (Medium) */}
          <Link href="/services" className="col-span-1 md:col-span-1 lg:col-span-1 bg-gray-900 rounded-3xl p-8 text-white hover:bg-gray-800 transition-colors flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Prendre un ticket</h3>
              <p className="text-gray-400 text-sm">Sans inscription obligatoire.</p>
            </div>
            <div className="self-end w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* 3. Stat (Medium) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-black text-primary mb-2">15h</div>
            <p className="text-gray-600 font-medium">économisées par mois en moyenne</p>
          </div>

          {/* 4. AI Insights (New - Wide) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200 group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <h3 className="font-bold text-lg">Intelligence Artificielle</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Prédiction</span>
                    <span className="text-xs text-white/70">Il y a 2 min</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">
                    📉 <span className="font-bold">Mairie de Cocody</span> : Affluence en baisse prévue dans 45 min. Idéal pour vos démarches !
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-green-300 uppercase tracking-wider">Suggestion</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">
                    💡 <span className="font-bold">Astuce</span> : Évitez la CIE entre 12h et 14h aujourd'hui (Pic attendu).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Pharmacies (Wide) */}
          <Link href="/pharmacies" className="col-span-1 md:col-span-2 lg:col-span-2 bg-green-50 rounded-3xl p-8 border border-green-100 hover:border-green-200 transition-colors flex items-center justify-between group">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-200 text-green-800 text-[10px] font-bold uppercase tracking-wider rounded-full">Nouveau</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pharmacies de garde</h3>
              <p className="text-gray-500 text-sm">Trouvez les médicaments disponibles près de chez vous.</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </Link>

          {/* 5. Mobile App (Small) */}
          <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center justify-center">
            <Smartphone className="w-8 h-8 text-gray-400 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Application Mobile</h3>
            <p className="text-xs text-gray-400">Bientôt sur iOS & Android</p>
          </div>

          {/* 6. Trust (Small) */}
          <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center justify-center">
            <div className="flex -space-x-2 mb-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
              ))}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-sm">4.9/5</span>
            </div>
            <p className="text-xs text-gray-400">5000+ avis</p>
          </div>

        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 border-t border-gray-100 bg-white text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-bold">Partenaire Officiel des Administrations</span>
        </div>
        <p className="text-gray-400 text-sm">© 2024 ViteviteApp. Fait avec ❤️ à Abidjan.</p>
      </footer>
    </div>
  );
}

function LiveServiceList() {
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const services: Service[] = data?.services?.slice(0, 3) || [];

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services?id=${service.id}`}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <div className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{service.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {service.current_queue_size}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{service.estimated_wait_time} min</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
        </Link>
      ))}
    </div>
  );
}
