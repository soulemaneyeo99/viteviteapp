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

  // Categories with Real Images
  const categories = [
    {
      id: "administrations",
      name: "Administrations",
      image: "/images/administrations/mairie_cocody.png",
      icon: Building2,
      description: "Mairies, Préfectures, CNPS...",
      href: "/administrations",
      count: "12 services"
    },
    {
      id: "hospitals",
      name: "Santé",
      image: "/images/administrations/chu_cocody.png",
      icon: Hospital,
      description: "Hôpitaux, Urgences, Cliniques",
      href: "/urgences",
      count: "8 services"
    },
    {
      id: "transport",
      name: "Transport",
      image: "/images/administrations/mairie_plateau.png", // Placeholder until transport images generated
      icon: Bus,
      description: "SOTRA, Interurbain",
      href: "/transport",
      count: "15 lignes"
    },
    {
      id: "pharmacies",
      name: "Pharmacies",
      image: "/images/administrations/cnps_plateau.png", // Placeholder
      icon: Pill,
      description: "Pharmacies de garde",
      href: "/pharmacies",
      count: "24 pharmacies"
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero Section - Clean & Professional */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Disponible à Abidjan</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Vos démarches,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">
                  sans l'attente.
                </span>
              </h1>

              <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed mx-auto lg:mx-0">
                La plateforme officielle pour consulter les files d'attente en temps réel et prendre vos tickets à distance.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto lg:mx-0 relative group">
                <div className="absolute inset-0 bg-yellow-200 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <form onSubmit={handleSearch} className="relative flex items-center bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                  <Search className="w-6 h-6 text-gray-400 ml-4" />
                  <input
                    type="text"
                    placeholder="Quelle administration cherchez-vous ?"
                    className="w-full px-4 py-4 text-lg bg-transparent border-none focus:ring-0 placeholder:text-gray-400 font-medium text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-12">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform">
                    <div className="h-40 relative rounded-xl overflow-hidden mb-3">
                      <Image src="/images/administrations/mairie_cocody.png" alt="Mairie" fill className="object-cover" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Mairie Cocody</span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Fluide</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform">
                    <div className="h-32 relative rounded-xl overflow-hidden mb-3">
                      <Image src="/images/administrations/prefecture_abidjan.png" alt="Préfecture" fill className="object-cover" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Préfecture</span>
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">15 min</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform">
                    <div className="h-32 relative rounded-xl overflow-hidden mb-3">
                      <Image src="/images/administrations/cnps_plateau.png" alt="CNPS" fill className="object-cover" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">CNPS Plateau</span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Ouvert</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform">
                    <div className="h-40 relative rounded-xl overflow-hidden mb-3">
                      <Image src="/images/administrations/chu_cocody.png" alt="CHU" fill className="object-cover" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">CHU Cocody</span>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Saturé</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-yellow-100/50 to-transparent rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Explorez par catégorie</h2>
              <p className="text-gray-500">Accédez rapidement aux services dont vous avez besoin</p>
            </div>
            <Link href="/services" className="hidden md:flex items-center gap-2 text-yellow-600 font-bold hover:text-yellow-700 transition-colors">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="h-48 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 z-20 text-white">
                    <category.icon className="w-6 h-6 mb-2 text-yellow-400" />
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm text-white/80">{category.count}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm line-clamp-2">{category.description}</p>
                  <div className="mt-4 flex items-center text-yellow-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                    Explorer <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Queue Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-2xl font-black text-gray-900">En direct des files d'attente</h2>
          </div>

          <LiveQueueStatus />
        </div>
      </section>

      {/* Trust/Footer Section */}
      <section className="py-12 border-t border-gray-100 bg-white text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-gray-400" />
              <span className="font-bold text-gray-600">Sécurisé & Officiel</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <p className="text-gray-500">Partenaire des Administrations Publiques de Côte d'Ivoire</p>
          </div>
          <p className="mt-8 text-sm text-gray-400">© 2024 ViteviteApp. Fait avec ❤️ à Abidjan.</p>
        </div>
      </section>
    </div>
  );
}

// Live Queue Component
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
          <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>
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
          className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-yellow-200 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
            {service.category === 'Santé' ? <Hospital className="w-6 h-6 text-gray-400 group-hover:text-yellow-600" /> :
              service.category === 'Transport' ? <Bus className="w-6 h-6 text-gray-400 group-hover:text-yellow-600" /> :
                <Building2 className="w-6 h-6 text-gray-400 group-hover:text-yellow-600" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">{service.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <Users className="w-3 h-3" />
                {service.current_queue_size} pers.
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <Clock className="w-3 h-3" />
                {service.estimated_wait_time} min
              </div>
            </div>
          </div>

          <div className={`w-2 h-2 rounded-full ${service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </Link>
      ))}
    </div>
  );
}
