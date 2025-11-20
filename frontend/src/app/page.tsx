// frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f3f3]">
      {/* Header */}
      <header className="bg-[#3d3d3d] border-b border-black sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#FFD43B] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black text-white">ViteviteApp</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth"
              className="px-4 py-2 text-sm font-semibold text-white hover:text-[#FFD43B] transition"
            >
              Connexion
            </Link>
            <Link
              href="/auth"
              className="px-6 py-2 bg-[#FFD43B] text-black font-bold rounded-lg hover:bg-[#FFC107] transition"
            >
              Prendre un ticket
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-6">
            Fini les files d'attente interminables
          </h1>
          <p className="text-xl md:text-2xl text-black mb-8">
            Prenez votre ticket virtuel, recevez une notification quand c'est votre tour, et gagnez
            des heures chaque mois.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="group px-8 py-4 bg-[#FFD43B] text-black font-bold rounded-xl text-lg hover:bg-[#FFC107] transition flex items-center justify-center space-x-2"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 border-2 border-black text-black font-bold rounded-xl text-lg hover:border-[#FFD43B] hover:text-[#FFD43B] transition"
            >
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#2b2b2b] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-black text-[#FFD43B] mb-2">15h/mois</div>
              <div className="text-white text-sm">Temps gagné en moyenne</div>
            </div>
            <div>
              <div className="text-5xl font-black text-[#FFD43B] mb-2">5,000+</div>
              <div className="text-white text-sm">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-5xl font-black text-[#FFD43B] mb-2">50+</div>
              <div className="text-white text-sm">Services partenaires</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-black">
          Comment ça marche ?
        </h2>
        <p className="text-xl text-black text-center mb-16 max-w-2xl mx-auto">
          4 étapes simples pour ne plus jamais perdre de temps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", icon: "🎯", title: "Choisissez", desc: "Sélectionnez votre service parmi des dizaines de partenaires" },
            { step: "02", icon: "🎫", title: "Réservez", desc: "Prenez votre ticket virtuel en 10 secondes" },
            { step: "03", icon: "⏰", title: "Relaxez", desc: "Notification quand c'est bientôt votre tour" },
            { step: "04", icon: "✨", title: "Arrivez", desc: "Présentez-vous pile au bon moment" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-[#262525] border-2 border-[#2b2b2b] hover:border-[#FFD43B] rounded-3xl p-8 transition-all"
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <div className="text-xs font-bold text-[#FFD43B] mb-2">ÉTAPE {feature.step}</div>
              <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-white text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="bg-[#232323] py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 text-white">Pourquoi ViteviteApp ?</h2>
              <div className="space-y-4">
                {[
                  "Gagnez jusqu'à 15h par mois",
                  "Prédictions IA du temps d'attente",
                  "Notifications en temps réel",
                  "100% gratuit pour les usagers",
                  "Disponible 24/7 sur tous les appareils",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFD43B] flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-sm">✓</span>
                    </div>
                    <span className="text-white text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-8xl text-center">🚀</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-[#FFD43B] rounded-3xl p-12">
          <h2 className="text-4xl font-black text-black mb-4">Prêt à gagner du temps ?</h2>
          <p className="text-xl text-black mb-8">
            Rejoignez des milliers d'Ivoiriens qui ont déjà adopté ViteviteApp
          </p>
          <Link
            href="/auth"
            className="inline-block px-10 py-5 bg-black text-[#FFD43B] font-bold rounded-xl text-lg hover:bg-gray-900 transition"
          >
            Prendre mon premier ticket gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-black py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-[#FFD43B]" />
            <span className="text-xl font-bold text-white">ViteviteApp</span>
          </div>
          <p className="text-white mb-4">Révolutionner les files d'attente en Côte d'Ivoire</p>
          <p className="text-sm text-white">© 2024 ViteviteApp. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
