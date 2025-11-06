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
    <div className="space-y-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-[#FFD43B] to-[#FFC107] rounded-2xl shadow-xl">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bienvenue sur ViteviteApp
          </h1>
          <p className="text-xl text-gray-800 mb-8">
            Éliminez le stress et la perte de temps liés aux files d'attente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="btn-primary text-lg">
              📱 Voir les services
            </Link>
            <Link href="/admin" className="btn-secondary text-lg">
              🎯 Dashboard Admin
            </Link>
          </div>
        </div>
      </section>

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

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Comment ça marche ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="w-12 h-12 bg-[#FFD43B] rounded-full flex items-center justify-center text-2xl mb-4">
              1️⃣
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Choisissez un service</h3>
            <p className="text-gray-600">
              Sélectionnez le service dont vous avez besoin parmi nos partenaires
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-[#FFD43B] rounded-full flex items-center justify-center text-2xl mb-4">
              2️⃣
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Prenez votre ticket</h3>
            <p className="text-gray-600">
              Obtenez un ticket virtuel sans vous déplacer
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-[#FFD43B] rounded-full flex items-center justify-center text-2xl mb-4">
              3️⃣
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Recevez une notification</h3>
            <p className="text-gray-600">
              Soyez alerté quand votre tour approche
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 bg-[#FFD43B] rounded-full flex items-center justify-center text-2xl mb-4">
              4️⃣
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Présentez-vous</h3>
            <p className="text-gray-600">
              Arrivez au bon moment avec tous vos documents
            </p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Services disponibles</h2>
          <Link href="/services" className="text-[#FFD43B] hover:underline font-semibold">
            Voir tous →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.slice(0, 3).map((service) => (
            <Link 
              key={service.id} 
              href={`/services`}
              className="card p-6 hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">🏢</div>
                <span className={`badge ${
                  service.status === 'ouvert' ? 'badge-success' : 'badge-danger'
                }`}>
                  {service.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  ⏱️ {service.estimated_wait_time} min
                </span>
                <span className={`badge ${
                  service.affluence_level === 'faible' ? 'affluence-low' :
                  service.affluence_level === 'modérée' ? 'affluence-moderate' :
                  service.affluence_level === 'élevée' ? 'affluence-high' :
                  'affluence-very-high'
                }`}>
                  {service.affluence_level}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-900 text-white rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Le problème que nous résolvons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold mb-2">Files interminables</h3>
            <p className="text-gray-400">
              60-70% des citoyens perdent 3-5 heures dans les services publics
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2">Déplacements inutiles</h3>
            <p className="text-gray-400">
              50% perdent 2-4 heures vers des services fermés
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Documents manquants</h3>
            <p className="text-gray-400">
              Retours forcés par manque d'informations
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">Prêt à gagner du temps ?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Rejoignez des milliers d'utilisateurs qui ont déjà adopté ViteviteApp
        </p>
        <Link href="/services" className="btn-primary text-lg">
          Commencer maintenant
        </Link>
      </section>
    </div>
  );
}