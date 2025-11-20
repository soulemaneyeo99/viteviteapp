// frontend/src/app/auth/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, UserPlus, LogIn } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<"user" | "admin">("user");
  
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        await authAPI.register(form);
        toast.success("Compte créé avec succès !");
        setMode("login");
      } else {
        const response = await authAPI.login({
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("access_token", response.data.tokens.access_token);
        localStorage.setItem("refresh_token", response.data.tokens.refresh_token);
        toast.success("Connexion réussie !");
        
        if (response.data.user.role === "admin" || response.data.user.role === "super") {
          router.push("/admin");
        } else {
          router.push("/services");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg mb-4">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ViteViteApp</h1>
          <p className="text-gray-600">
            Bienvenue sur votre plateforme de gestion des files d'attente
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === "register"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType("user")}
                    className={`py-4 px-4 rounded-xl border-2 transition-all ${
                      accountType === "user"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-gray-900 mb-1">Citoyen</div>
                      <div className="text-xs text-gray-600">Prendre des tickets</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("admin")}
                    className={`py-4 px-4 rounded-xl border-2 transition-all ${
                      accountType === "admin"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-gray-900 mb-1">Administration</div>
                      <div className="text-xs text-gray-600">Gérer les services</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Chargement..." : mode === "register" ? "S'inscrire" : "Se connecter"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              {mode === "register" ? "Déjà inscrit ? " : "Pas de compte ? "}
              <button
                type="button"
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="text-orange-600 font-semibold hover:text-orange-700"
              >
                {mode === "register" ? "Se connecter" : "S'inscrire"}
              </button>
            </p>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}