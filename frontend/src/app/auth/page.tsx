"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
        const response = await authAPI.register({
          email: form.email,
          password: form.password,
          full_name: form.full_name || undefined,
          phone: form.phone || undefined,
        });
        
        localStorage.setItem("access_token", response.data.tokens.access_token);
        localStorage.setItem("refresh_token", response.data.tokens.refresh_token);
        
        toast.success("Compte créé avec succès !");
        
        if (response.data.user.role === "admin" || response.data.user.role === "super") {
          router.push("/admin");
        } else {
          router.push("/services");
        }
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
      const message = error.response?.data?.detail || "Erreur lors de l'authentification";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFD43B] to-[#FFC107] rounded-3xl shadow-lg mb-4">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ViteViteApp</h1>
          <p className="text-gray-600">Gestion intelligente des files d'attente</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                mode === "register"
                  ? "bg-gradient-to-r from-[#FFD43B] to-[#FFC107] text-gray-900 shadow-lg"
                  : "text-gray-600"
              }`}
            >
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
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#FFD43B] focus:ring-2 focus:ring-[#FFD43B]/20 transition-all outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone (optionnel)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#FFD43B] focus:ring-2 focus:ring-[#FFD43B]/20 transition-all outline-none"
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
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#FFD43B] focus:ring-2 focus:ring-[#FFD43B]/20 transition-all outline-none"
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
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#FFD43B] focus:ring-2 focus:ring-[#FFD43B]/20 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#FFD43B] to-[#FFC107] text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Chargement..." : mode === "register" ? "S'inscrire" : "Se connecter"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              {mode === "register" ? "Déjà inscrit ? " : "Pas de compte ? "}
              <button
                type="button"
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="text-[#FFD43B] font-semibold hover:underline"
              >
                {mode === "register" ? "Se connecter" : "S'inscrire"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}