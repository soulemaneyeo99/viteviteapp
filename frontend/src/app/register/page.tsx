// frontend/src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCircle2, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"inscription" | "connexion">("inscription");
  const [accountType, setAccountType] = useState<"citoyen" | "admin">("citoyen");
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name || undefined,
        phone: form.phone || undefined,
      });

      localStorage.setItem("access_token", response.data.tokens.access_token);
      localStorage.setItem("refresh_token", response.data.tokens.refresh_token);

      toast.success("Compte créé avec succès !");
      router.push(accountType === "admin" ? "/admin" : "/services");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF8C00] to-[#FF6F00] rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ViteViteApp</h1>
          <p className="text-gray-600">Bienvenue sur votre plateforme de gestion des files d'attente</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-2 mb-6 flex shadow-sm">
          <button
            onClick={() => setActiveTab("connexion")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "connexion"
                ? "bg-[#FFF8E7] text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            🔑 Connexion
          </button>
          <button
            onClick={() => setActiveTab("inscription")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "inscription"
                ? "bg-[#FF8C00] text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            👤 Inscription
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Votre nom"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="+225 XX XX XX XX XX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Type de compte */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type de compte
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("citoyen")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accountType === "citoyen"
                    ? "border-[#FF8C00] bg-[#FFF8E7]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <UserCircle2 className="w-8 h-8 mx-auto mb-2 text-[#FF8C00]" />
                <div className="font-semibold text-gray-900">Citoyen</div>
                <div className="text-xs text-gray-500">Prendre des tickets</div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("admin")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accountType === "admin"
                    ? "border-[#FF8C00] bg-[#FFF8E7]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[#FF8C00]" />
                <div className="font-semibold text-gray-900">Administration</div>
                <div className="text-xs text-gray-500">Gérer les services</div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF8C00] hover:bg-[#FF6F00] text-white font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà inscrit ?{" "}
              <Link href="/login" className="text-[#FF8C00] font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </form>
      </div>
    </div>
  );
}