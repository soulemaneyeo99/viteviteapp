// frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { Clock, Users, Zap, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD43B] to-[#FFC107] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black text-white">ViteviteApp</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition"
            >
              Connexion
            </Link>
            <Link
              href="/services"
              className="px-6 py-2 bg-gradient-to-r from-[#FFD43B] to-[#FFC107] text-black font-bold rounded-lg hover:shadow-lg transition"
            >
              Prendre un ticket
            </Link>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            Fini les files d'attente interminables
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            Prenez votre ticket virtuel, recevez une notification quand c'est votre tour, 
            et gagnez des heures chaque mois.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="group px-8 py-4 bg-gradient-to-r from-[#FFD43B] to-[#FFC107] text-black font-bold rounded-xl text-lg hover:shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 border-2 border-gray-700 text-white font-bold rounded-xl text-lg hover:border-[#FFD43B] transition"
            >
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-black text-[#FFD43B] mb-2">15h/mois</div>
              <div className="text-gray-400">Temps gagné en moyenne</div>
            </div>
            <div>
              <div className="text-5xl font-black text-[#FFD43B] mb-2">5,000+</div>
              <div className="text-gray-400">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-5xl font-black text-[#FFD43B] mb-2">50+</div>
              <div className="text-gray-400">Services partenaires</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-white">
          Comment ça marche ?
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          4 étapes simples pour ne plus jamais perdre de temps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              icon: "🎯",
              title: "Choisissez",
              desc: "Sélectionnez votre service parmi des dizaines de partenaires",
            },
            {
              step: "02",
              icon: "🎫",
              title: "Réservez",
              desc: "Prenez votre ticket virtuel en 10 secondes",
            },
            {
              step: "03",
              icon: "⏰",
              title: "Relaxez",
              desc: "Notification quand c'est bientôt votre tour",
            },
            {
              step: "04",
              icon: "✨",
              title: "Arrivez",
              desc: "Présentez-vous pile au bon moment",
            },
          ].map((feature, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD43B] to-[#FFC107] rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-800 hover:border-[#FFD43B]">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <div className="text-sm font-bold text-gray-500 mb-2">
                  ÉTAPE {feature.step}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 text-white">
                Pourquoi ViteviteApp ?
              </h2>
              <div className="space-y-4">
                {[
                  "Gagnez jusqu'à 15h par mois",
                  "Prédictions IA du temps d'attente",
                  "Notifications en temps réel",
                  "100% gratuit pour les usagers",
                  "Disponible 24/7 sur tous les appareils",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-[#FFD43B] flex-shrink-0" />
                    <span className="text-lg text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-8xl text-center">
              🚀
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#FFD43B] via-[#FFC107] to-[#FFD43B] rounded-3xl p-12">
          <h2 className="text-4xl font-black text-black mb-4">
            Prêt à gagner du temps ?
          </h2>
          <p className="text-xl text-gray-900 mb-8">
            Rejoignez des milliers d'Ivoiriens qui ont déjà adopté ViteviteApp
          </p>
          <Link
            href="/services"
            className="inline-block px-10 py-5 bg-black text-white font-bold rounded-xl text-lg hover:bg-gray-900 transition"
          >
            Prendre mon premier ticket gratuitement
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-[#FFD43B]" />
            <span className="text-xl font-bold text-white">ViteviteApp</span>
          </div>
          <p className="text-gray-400 mb-4">
            Révolutionner les files d'attente en Côte d'Ivoire
          </p>
          <p className="text-sm text-gray-500">
            © 2024 ViteviteApp. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}