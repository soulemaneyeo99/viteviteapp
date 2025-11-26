"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search, ArrowRight, MapPin, Clock, Users,
  Building2, Hospital, Pill, Bus, ShieldCheck,
  ChevronRight, Star
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

  // Categories with Real Images - Simplified
  const categories = [
    {
      id: "administrations",
      name: "Administrations",
      image: "/images/administrations/mairie_cocody.png",
      icon: Building2,
      href: "/administrations",
    },
    {
      id: "hospitals",
      name: "Santé",
      image: "/images/administrations/chu_cocody.png",
      icon: Hospital,
      href: "/urgences",
    },
    {
      id: "transport",
      name: "Transport",
      image: "/images/administrations/mairie_plateau.png",
      icon: Bus,
      href: "/transport",
    },
    {
      id: "pharmacies",
      name: "Pharmacies",
      image: "/images/administrations/cnps_plateau.png",
      icon: Pill,
      href: "/pharmacies",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Hero Section - Strategic & Clean */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Tagline - The Core Message */}
          <h1 className="text-4xl md:text-6xl font-medium text-slate-900 mb-8 tracking-tight leading-tight">
            Gagnez du temps<br />
            <span className="text-yellow-500">évitez les files</span>
          </h1>

          {/* Search Bar - The Primary Action */}
          <div className="max-w-2xl mx-auto mb-16 relative group">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <form onSubmit={handleSearch} className="relative flex items-center bg-white p-2 rounded-full shadow-xl border border-slate-100 transition-shadow hover:shadow-2xl">
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
              <button type="submit" className="bg-yellow-500 text-white px-8 py-4 rounded-full font-medium hover:bg-yellow-600 transition-all flex items-center gap-2">
                Rechercher
              </button>
            </form>
          </div>

          {/* Trust Indicators - Subtle */}
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-yellow-500" />
              <span>Officiel & Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span>Temps réel</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-500" />
              <span>Partout à Abidjan</span>
            </div>
          </div>

        </div>

        {/* Background Decorative Elements - Very Subtle */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl opacity-60"></div>
        </div>
      </section>

      {/* Categories Section - Minimalist Grid */}
      <section className="py-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all text-center"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                  <category.icon className="w-8 h-8 text-slate-400 group-hover:text-yellow-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 group-hover:text-yellow-700 transition-colors">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Queue Section - Proof of Value */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-slate-900">En direct des files d'attente</h2>
            <p className="text-slate-500 mt-2">Consultez l'affluence avant de vous déplacer</p>
          </div>

          <LiveQueueStatus />

          <div className="text-center mt-12">
            <Link href="/services" className="inline-flex items-center gap-2 text-yellow-600 font-medium hover:text-yellow-700 hover:underline underline-offset-4">
              Voir tous les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="py-12 border-t border-slate-100 bg-white text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm text-slate-400">© 2024 ViteviteApp. Simplifiez votre vie à Abidjan.</p>
        </div>
      </footer>
    </div>
  );
}

// Live Queue Component - Clean Cards
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
          <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
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
          className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-yellow-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <h4 className="font-medium text-slate-900 group-hover:text-yellow-600 transition-colors">{service.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {service.current_queue_size}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.estimated_wait_time} min</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-yellow-500 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
