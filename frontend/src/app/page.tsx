"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search, ArrowRight, MapPin, Clock, Users,
  Building2, Hospital, Pill, Bus, ShieldCheck,
  ChevronRight, Star, Zap, CheckCircle2,
  Smartphone
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
      image: "/images/administrations/mairie_plateau.png",
      icon: Building2,
      href: "/administrations",
      color: "bg-blue-500",
    },
    {
      id: "hospitals",
      name: "Santé",
      image: "/images/administrations/chu_cocody.png",
      icon: Hospital,
      href: "/urgences",
      color: "bg-red-500",
    },
    {
      id: "transport",
      name: "Transport",
      image: "/images/administrations/mairie_abobo.png",
      icon: Bus,
      href: "/transport",
      color: "bg-orange-500",
    },
    {
      id: "pharmacies",
      name: "Pharmacies",
      image: "/images/administrations/cnps_plateau.png",
      icon: Pill,
      href: "/pharmacies",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">

      {/* Hero Section - Premium & Real */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Photorealistic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_bg_jury_ready.png"
            alt="Abidjan Life - Queue vs Solution"
            fill
            className="object-cover object-center"
            priority
            quality={95}
          />
          {/* Professional Overlay - Adjusted for visibility of background queue */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
              </span>
              <span className="text-sm font-semibold text-white tracking-wide">La solution n°1 à Abidjan</span>
            </div>

            {/* Headline - Strategic & Impactful */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
              Ne perdez plus<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">votre temps.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl leading-relaxed font-light drop-shadow-md">
              Prenez votre ticket à distance. Suivez votre tour en direct.
              <span className="block mt-2 font-medium text-white">Vivez mieux votre ville.</span>
            </p>

            {/* Search Bar - Glassmorphism & Premium - Optimized for Mobile */}
            <div className="max-w-2xl relative group">
              <div className="absolute -inset-1 bg-primary-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <form onSubmit={handleSearch} className="relative flex items-center bg-white/95 backdrop-blur-xl p-1.5 md:p-2 rounded-full shadow-2xl border border-white/20 transition-transform hover:scale-[1.01]">
                <div className="pl-4 pr-2 md:pl-6 md:pr-4 text-slate-400">
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Mairie, Banque, Hôpital..."
                  className="w-full py-3 md:py-4 text-base md:text-lg bg-transparent border-none focus:ring-0 placeholder:text-slate-400 text-slate-900 font-medium truncate"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-primary-500 text-white w-12 h-12 md:w-auto md:h-auto md:px-8 md:py-4 rounded-full font-bold hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 shrink-0">
                  <span className="hidden md:inline">Rechercher</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Quick Stats - Social Proof */}
            <div className="mt-12 flex items-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                <span className="font-medium">+10k Utilisateurs</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-400" />
                <span className="font-medium">50+ Partenaires</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Authority */}
      <section className="py-10 border-b border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholders for logos - Text for now but styled like logos */}
            <span className="text-xl font-bold text-slate-600">Mairie de Cocody</span>
            <span className="text-xl font-bold text-slate-600">CHU de Treichville</span>
            <span className="text-xl font-bold text-slate-600">SOTRA</span>
            <span className="text-xl font-bold text-slate-600">CIE</span>
            <span className="text-xl font-bold text-slate-600">SODECI</span>
          </div>
        </div>
      </section>

      {/* Categories Section - Clean & Strategic */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Services disponibles</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Accédez instantanément aux services essentiels de votre quotidien.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative flex flex-col items-center overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-custom-sm hover:shadow-custom-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image Background with Overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full h-full p-8 flex flex-col items-center text-center pt-48 justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{category.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-primary-400 transition-colors drop-shadow-sm">
                    <span>Explorer</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Plus simple, c'est impossible.</h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                Notre technologie s'occupe de la file d'attente pour vous. Vous ne venez que lorsque c'est nécessaire.
              </p>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-xl font-bold text-primary-600 shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Choisissez votre service</h3>
                    <p className="text-slate-500">Trouvez l'administration ou l'hôpital le plus proche.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-xl font-bold text-primary-600 shrink-0">2</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Prenez votre ticket</h3>
                    <p className="text-slate-500">Obtenez un numéro numérique instantanément.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center text-xl font-bold text-primary-600 shrink-0">3</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Suivez en temps réel</h3>
                    <p className="text-slate-500">Recevez une notification quand c'est à votre tour.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 relative">
              {/* Abstract Phone Representation or Illustration */}
              <div className="relative w-[300px] h-[600px] mx-auto bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                <div className="relative h-full w-full bg-white flex flex-col">
                  <div className="h-1/2 bg-primary-500 flex items-center justify-center text-white p-8 text-center">
                    <div>
                      <div className="text-6xl font-bold mb-2">A-12</div>
                      <div className="text-white/80">Votre numéro</div>
                    </div>
                  </div>
                  <div className="h-1/2 p-8 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-slate-400">Attente estimée</span>
                      <span className="text-2xl font-bold text-slate-900">15 min</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                      <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                    </div>
                    <p className="text-center text-sm text-slate-400 mt-4">C'est bientôt à vous !</p>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute top-20 -right-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
                  <div>
                    <div className="font-bold text-slate-900">Ticket validé</div>
                    <div className="text-xs text-slate-500">À l'instant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Queue Section - Dark Theme (Premium Tech Feel) */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-white tracking-wide">EN DIRECT</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">L'affluence en temps réel.</h2>
              <p className="text-slate-400 max-w-xl text-lg">
                Consultez l'état des files d'attente avant même de quitter votre domicile.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-primary-50 transition-all hover:scale-105 shadow-lg shadow-white/10"
            >
              Voir tous les services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <LiveQueueStatus />
        </div>
      </section>

      {/* Footer - Clean */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">V</div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">ViteviteApp</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">© 2024 ViteviteApp</p>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-primary-600 transition-colors">À propos</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Live Queue Component - Premium Dark Cards
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
          <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5"></div>
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
          className="group relative flex flex-col p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-primary-500/50 transition-all duration-500 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shadow-inner">
                {service.icon === 'hospital' ? '🏥' : service.icon === 'building-columns' ? '🏦' : '🏢'}
              </div>
              <div>
                <h4 className="font-bold text-white text-xl group-hover:text-primary-400 transition-colors">{service.name}</h4>
                <p className="text-sm text-slate-400 font-medium">{service.category}</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${service.status === 'ouvert' ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Users className="w-3 h-3" /> File
              </div>
              <div className="text-2xl font-bold text-white">{service.current_queue_size}</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3" /> Attente
              </div>
              <div className="text-2xl font-bold text-primary-400">{formatDuration(service.estimated_wait_time)}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
