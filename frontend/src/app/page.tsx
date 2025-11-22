"use client";

import Link from "next/link";
import { Zap, ArrowRight, CheckCircle2, Clock, Users, Building2, ShieldCheck, Ticket, Activity, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI } from "@/lib/api";
import { Service } from "@/types";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FFF8E7] pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Disponible à Abidjan</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
              Fini les files d'attente <span className="text-primary relative inline-block">
                interminables
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Prenez votre ticket virtuel, recevez une notification quand c'est votre tour, et gagnez
              des heures chaque mois.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/services"
                className="group px-8 py-4 bg-primary text-white font-bold rounded-2xl text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl text-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Comment ça marche ?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Live Status Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-lg opacity-20 animate-pulse"></div>
              <Activity className="w-6 h-6 text-red-500 relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">État des services en temps réel <span className="text-xs font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">IA Live</span></h2>
          </div>

          <LiveServiceGrid />
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-gray-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">15h<span className="text-2xl text-gray-500">/mois</span></div>
              <div className="text-gray-400 font-medium">Temps gagné en moyenne</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">5,000+</div>
              <div className="text-gray-400 font-medium">Utilisateurs actifs</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">50+</div>
              <div className="text-gray-400 font-medium">Services partenaires</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              4 étapes simples pour ne plus jamais perdre de temps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", icon: <CheckCircle2 className="w-8 h-8 text-primary" />, title: "Choisissez", desc: "Sélectionnez votre service parmi nos partenaires." },
              { step: "02", icon: <Ticket className="w-8 h-8 text-primary" />, title: "Réservez", desc: "Prenez votre ticket virtuel en quelques secondes." },
              { step: "03", icon: <Clock className="w-8 h-8 text-primary" />, title: "Patientez", desc: "Vaquez à vos occupations, on vous notifie." },
              { step: "04", icon: <Building2 className="w-8 h-8 text-primary" />, title: "Arrivez", desc: "Présentez-vous au guichet au bon moment." },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative"
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 border border-gray-100">
                  {feature.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-wider uppercase">ÉTAPE {feature.step}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-gray-50 py-24 border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 leading-tight">
                Pourquoi choisir <span className="text-primary">ViteviteApp</span> ?
              </h2>
              <div className="space-y-5">
                {[
                  "Gagnez jusqu'à 15h par mois de temps libre",
                  "Prédictions précises du temps d'attente",
                  "Notifications SMS et Push en temps réel",
                  "100% gratuit pour les usagers",
                  "Disponible 24/7 sur tous les appareils",
                  "Partenariats officiels avec les administrations"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Fiabilité garantie</h3>
                    <p className="text-sm text-gray-500">Service disponible 99.9% du temps</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Satisfaction client</span>
                    <span className="text-gray-900 font-bold">98%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Temps d'attente réduit</span>
                    <span className="text-gray-900 font-bold">-85%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Prêt à gagner du temps ?</h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                Rejoignez des milliers d'Ivoiriens qui ont déjà adopté ViteviteApp et profitez de votre temps libre.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary font-black rounded-2xl text-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Prendre mon premier ticket
                <ArrowRight className="w-6 h-6" />
              </Link>
              <p className="mt-6 text-white/70 text-sm font-medium">
                Aucune carte bancaire requise • Inscription en 30 secondes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-900 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">ViteviteApp</span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                La première plateforme de gestion de files d'attente intelligente en Côte d'Ivoire.
                Notre mission est de vous redonner le contrôle de votre temps.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Liens rapides</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Accueil</Link></li>
                <li><Link href="/services" className="text-gray-400 hover:text-primary transition-colors">Services</Link></li>
                <li><Link href="/auth" className="text-gray-400 hover:text-primary transition-colors">Connexion</Link></li>
                <li><Link href="/auth" className="text-gray-400 hover:text-primary transition-colors">Inscription</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Légal</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Mentions légales</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2024 ViteviteApp. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500">Fait avec ❤️ à Abidjan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LiveServiceGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "live"],
    queryFn: async () => {
      const response = await servicesAPI.getAll();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const services: Service[] = data?.services?.slice(0, 4) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.map((service) => {
        const isSaturated = service.current_queue_size > 50;
        const isClosed = service.status !== "ouvert";

        let statusColor = "bg-green-50 text-green-700 border-green-100";
        let statusText = "Fluide";
        let statusIcon = <CheckCircle2 className="w-4 h-4" />;

        if (isClosed) {
          statusColor = "bg-gray-50 text-gray-500 border-gray-100";
          statusText = "Fermé";
          statusIcon = <Clock className="w-4 h-4" />;
        } else if (isSaturated) {
          statusColor = "bg-red-50 text-red-700 border-red-100";
          statusText = "Saturé";
          statusIcon = <AlertCircle className="w-4 h-4" />;
        } else if (service.current_queue_size > 20) {
          statusColor = "bg-orange-50 text-orange-700 border-orange-100";
          statusText = "Chargé";
          statusIcon = <Users className="w-4 h-4" />;
        }

        return (
          <Link
            key={service.id}
            href={`/services?id=${service.id}`}
            className="group block bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900 truncate pr-2">{service.name}</h3>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                {statusIcon}
                {statusText}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                <span className="font-bold text-gray-900">{service.current_queue_size}</span> en attente
              </div>
              <div className="text-gray-500">
                ~<span className="font-bold text-gray-900">{service.estimated_wait_time}</span> min
              </div>
            </div>

            {/* AI Insight */}
            {!isClosed && (
              <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-primary font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-3 h-3" />
                IA: {isSaturated ? "Évitez maintenant" : "Bon moment"}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
