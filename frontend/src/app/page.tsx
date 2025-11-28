"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search, ArrowRight, MapPin, Clock, Users,
  Building2, Hospital, Pill, Bus, ShieldCheck,
  ChevronRight, Star, Zap, CheckCircle2
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
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

  // Categories with Real Images
  const categories = [
    {
      id: "administrations",
      name: "Administrations",
      image: "/images/administrations/mairie_cocody.png",
      icon: Building2,
      href: "/administrations",
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "hospitals",
      name: "Santé",
      image: "/images/administrations/chu_cocody.png",
      icon: Hospital,
      href: "/urgences",
      color: "bg-red-50 text-red-600",
    },
    {
      id: "transport",
      name: "Transport",
      image: "/images/administrations/mairie_plateau.png",
      icon: Bus,
      href: "/transport",
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "pharmacies",
      name: "Pharmacies",
      image: "/images/administrations/cnps_plateau.png",
      icon: Pill,
      href: "/pharmacies",
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">

      {/* Hero Section - Vibrant & Professional */}
      <section className="relative pt-32 pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary-50/80 via-white to-white rounded-full blur-3xl opacity-80"></div>
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-yellow-100/50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-100 shadow-sm mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">La référence à Abidjan</span>
          </div>

          {/* Tagline */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Gagnez du temps,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">évitez les files.</span>
          </h1>

          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Prenez votre ticket à distance pour les mairies, banques et hôpitaux.
            <span className="block mt-1 font-medium text-slate-700">Suivez votre tour en temps réel.</span>
          </p>

          {/* Search Bar - Premium */}
          <div className="max-w-2xl mx-auto mb-20 relative group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <form onSubmit={handleSearch} className="relative flex items-center bg-white p-2 rounded-full shadow-custom-xl border border-slate-100 transition-all hover:scale-[1.01]">
              <div className="pl-6 pr-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Quelle administration cherchez-vous ?"
                className="w-full py-4 text-lg bg-transparent border-none focus:ring-0 placeholder:text-slate-400 text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2 transform active:scale-95">
                Rechercher
              </button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 border-t border-slate-100/50 pt-12">
            <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">100% Sécurisé</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Gain de temps</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Temps réel</span>
            </div>
          </div>

        </div>
      </section>

      {/* How it Works - New Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comment ça marche ?</h2>
            <p className="text-slate-500">Simple, rapide et efficace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-primary-200 to-slate-200 -z-10"></div>

            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-custom-md border border-slate-100 flex items-center justify-center mb-6 relative z-10">
                <Search className="w-10 h-10 text-primary-500" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-slate-50">1</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cherchez</h3>
              <p className="text-slate-500 leading-relaxed">Trouvez l'administration ou le service dont vous avez besoin.</p>
            </div>

            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-custom-md border border-slate-100 flex items-center justify-center mb-6 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20"></div>
                  <Zap className="w-10 h-10 text-primary-600 relative" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-slate-50">2</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Réservez</h3>
              <p className="text-slate-500 leading-relaxed">Prenez votre ticket numérique en un clic, sans vous déplacer.</p>
            </div>

            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-custom-md border border-slate-100 flex items-center justify-center mb-6 relative z-10">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-slate-50">3</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Passez</h3>
              <p className="text-slate-500 leading-relaxed">Présentez-vous uniquement quand c'est votre tour.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Explorez par catégorie</h2>
              <p className="text-slate-500">Accédez rapidement aux services les plus demandés</p>
            </div>
            <Link href="/services" className="hidden md:flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Tout voir <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-custom-sm hover:shadow-custom-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${category.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                <div className="p-8 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 mb-6 rounded-2xl ${category.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <category.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-slate-400 font-medium">Voir les services</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Queue Section - Proof of Value */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Dark Theme Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-white">En direct</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Files d'attente en temps réel</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Nos capteurs et notre IA analysent l'affluence en continu pour vous donner les estimations les plus précises.
            </p>
          </div>

          <LiveQueueStatus />

          <div className="text-center mt-16">
            <Link
              href="/services"
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-primary-50 transition-all hover:scale-105"
            >
              Voir tous les services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Simple & Clean */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <span className="font-bold text-slate-900 text-lg">ViteviteApp</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 ViteviteApp. Fait avec ❤️ à Abidjan.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-primary-600 transition-colors">À propos</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Live Queue Component - Dark Theme Cards
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse border border-white/10"></div>
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
          className="group relative flex flex-col p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 hover:border-primary-500/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {service.icon === 'hospital' ? '🏥' : service.icon === 'building-columns' ? '🏦' : '🏢'}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg group-hover:text-primary-400 transition-colors">{service.name}</h4>
                <p className="text-sm text-slate-400">{service.category}</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${service.status === 'ouvert' ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Users className="w-3 h-3" /> File
              </div>
              <div className="text-xl font-bold text-white">{service.current_queue_size}</div>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Clock className="w-3 h-3" /> Attente
              </div>
              <div className="text-xl font-bold text-primary-400">{formatDuration(service.estimated_wait_time)}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
