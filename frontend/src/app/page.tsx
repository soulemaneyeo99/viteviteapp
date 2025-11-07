'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Service } from '@/lib/types';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ servicesOpen: 0, activeTickets: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, statsData] = await Promise.all([
        api.getServices(),
        api.getAdminStats()
      ]);
      setServices(servicesData);
      setStats({
        servicesOpen: statsData.services_open,
        activeTickets: statsData.active_tickets
      });
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.servicesOpen}</h3>
          <p className="text-gray-600">Services ouverts</p>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">🎫</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.activeTickets}</h3>
          <p className="text-gray-600">Tickets actifs</p>
        </div>
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Temps réel</h3>
          <p className="text-gray-600">Notifications instantanées</p>
        </div>
      </section>

      {/* Features Section - Design moderne */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            4 étapes simples pour gagner des heures chaque semaine
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              icon: "🎯",
              title: "Choisissez",
              desc: "Sélectionnez votre service parmi des dizaines de partenaires",
              color: "from-blue-500 to-blue-600"
            },
            {
              step: "02",
              icon: "🎫",
              title: "Réservez",
              desc: "Prenez votre ticket virtuel en 10 secondes chrono",
              color: "from-purple-500 to-purple-600"
            },
            {
              step: "03",
              icon: "⚡",
              title: "Relaxez",
              desc: "Recevez une notification quand c'est bientôt votre tour",
              color: "from-orange-500 to-orange-600"
            },
            {
              step: "04",
              icon: "✨",
              title: "Arrivez",
              desc: "Présentez-vous pile au bon moment avec vos documents",
              color: "from-green-500 to-green-600"
            }
          ].map((feature, idx) => (
            <div key={idx} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD43B] to-[#FFC107] rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#FFD43B] hover:-translate-y-2">
                <div className={`absolute top-6 right-6 text-6xl font-black text-gray-100`}>
                  {feature.step}
                </div>
                <div className="text-6xl mb-6 relative z-10">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Preview - Cards modernes */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Services populaires</h2>
            <p className="text-gray-600">Nos partenaires les plus demandés</p>
          </div>
          <Link 
            href="/services" 
            className="group flex items-center space-x-2 text-[#FFD43B] hover:text-[#FFC107] font-bold transition"
          >
            <span>Voir tous</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.slice(0, 3).map((service) => (
            <Link 
              key={service.id} 
              href={`/services`}
              className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD43B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFD43B] to-[#FFC107] rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {service.icon === 'hospital' ? '🏥' : 
                     service.icon === 'building-columns' ? '🏦' : '🏢'}
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                    service.status === 'ouvert' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {service.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FFC107] transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {service.estimated_wait_time}
                      </div>
                      <div className="text-xs text-gray-500">minutes</div>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {service.current_queue_size}
                      </div>
                      <div className="text-xs text-gray-500">en file</div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    service.affluence_level === 'faible' ? 'bg-green-100 text-green-700' :
                    service.affluence_level === 'modérée' ? 'bg-yellow-100 text-yellow-700' :
                    service.affluence_level === 'élevée' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {service.affluence_level}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Problem Section - Version premium */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-12 md:p-16">
        {/* Patterns décoratifs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD43B] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFC107] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-red-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-red-300 font-semibold">❌ Le problème</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Des millions d'heures perdues chaque année
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              En Côte d'Ivoire, les files d'attente coûtent cher à l'économie et au bien-être des citoyens
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "⏰",
                stat: "60-70%",
                title: "Files interminables",
                desc: "des citoyens perdent 3-5 heures dans les services publics chaque visite"
              },
              {
                icon: "🚗",
                stat: "50%",
                title: "Déplacements inutiles", 
                desc: "perdent 2-4 heures vers des services fermés ou sans être servis"
              },
              {
                icon: "📄",
                stat: "40%",
                title: "Documents manquants",
                desc: "doivent revenir faute d'informations sur les pièces requises"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD43B]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#FFD43B]/50 transition-all duration-300">
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <div className="text-5xl font-black text-[#FFD43B] mb-3">{item.stat}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Version impactante */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD43B] via-[#FFC107] to-[#FFAB00]"></div>
        
        {/* Patterns animés */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-lg animate-spin-slow"></div>
        </div>
        
        <div className="relative z-10 text-center py-20 px-6">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            Prêt à gagner du temps ?
          </h2>
          <p className="text-2xl text-gray-800 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont déjà adopté ViteviteApp
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            <Link 
              href="/services" 
              className="group bg-gray-900 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center space-x-3">
                <span>🚀 Commencer maintenant</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="flex items-center justify-center space-x-8 text-gray-800">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">⭐</span>
              <div className="text-left">
                <div className="font-bold">4.8/5</div>
                <div className="text-sm">Note moyenne</div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-800/20"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">👥</span>
              <div className="text-left">
                <div className="font-bold">5,000+</div>
                <div className="text-sm">Utilisateurs</div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-800/20"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🎯</span>
              <div className="text-left">
                <div className="font-bold">50+</div>
                <div className="text-sm">Partenaires</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}