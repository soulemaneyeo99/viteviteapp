// frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import ChatBotPro from "@/components/ChatBot";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <header className="bg-white border-b border-[#FF8C00] sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C00] to-[#FF6F00] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black">ViteViteApp</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black">
              Connexion
            </Link>
            <Link href="/services" className="px-6 py-2 bg-[#FF8C00] hover:bg-[#FF6F00] text-white font-bold rounded-lg transition">
              Prendre un ticket
            </Link>
          </div>
        </nav>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
            Fini les files d'attente interminables
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Prenez votre ticket virtuel, recevez une notification et gagnez des heures chaque mois
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="group px-8 py-4 bg-[#FF8C00] hover:bg-[#FF6F00] text-white font-bold rounded-xl text-lg transition flex items-center justify-center space-x-2"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-black text-[#FF8C00] mb-2">15h/mois</div>
              <div className="text-gray-300">Temps gagné en moyenne</div>
            </div>
            <div>
              <div className="text-5xl font-black text-[#FF8C00] mb-2">5,000+</div>
              <div className="text-gray-300">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-5xl font-black text-[#FF8C00] mb-2">50+</div>
              <div className="text-gray-300">Services partenaires</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-[#FF8C00]" />
            <span className="text-xl font-bold">ViteViteApp</span>
          </div>
          <p className="text-gray-400 mb-4">
            Révolutionner les files d'attente en Côte d'Ivoire
          </p>
          <p className="text-sm text-gray-500">
            © 2024 ViteViteApp. Tous droits réservés.
          </p>
        </div>
      </footer>

      <ChatBotPro />
    </div>
  );
}