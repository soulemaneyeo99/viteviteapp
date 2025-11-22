"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCircle2, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [accountType, setAccountType] = useState<"citoyen" | "admin">("citoyen");
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
          role: accountType,
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
      console.error("Auth error:", error);
      let message = mode === "register" ? "Erreur lors de la création" : "Erreur lors de la connexion";

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((e: any) => e.msg || e.message || String(e)).join(", ");
        } else if (typeof detail === "object") {
          message = detail.message || JSON.stringify(detail);
        }
      } else if (error.message) {
        message = error.message;
      }

      console.error("Error message:", message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 font-sans">
      <div className="w-full max-w-[95%] sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg mb-3 sm:mb-4 transform rotate-3 hover:rotate-6 transition-all">
            <span className="text-2xl sm:text-3xl text-white">⚡</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">ViteViteApp</h1>
          <p className="text-gray-500 text-xs sm:text-sm px-2">Bienvenue sur votre plateforme de gestion des files d'attente</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-custom-xl border border-gray-100 p-5 sm:p-6 md:p-8 relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative">
            <div className="flex p-1 mb-6 sm:mb-8 bg-gray-50 rounded-xl border border-gray-100">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${mode === "login"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${mode === "register"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                      Nom complet
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="input-field pl-12"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                      Téléphone (optionnel)
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field pl-12"
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field pl-12"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === "register" && (
                  <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                  </p>
                )}
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3 ml-1">Type de compte</label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setAccountType("citoyen")}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 sm:gap-2 ${accountType === "citoyen"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-full ${accountType === "citoyen" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
                        <UserCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-center">
                        <span className={`block text-xs sm:text-sm font-bold ${accountType === "citoyen" ? "text-gray-900" : "text-gray-500"}`}>Citoyen</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Prendre des tickets</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("admin")}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 sm:gap-2 ${accountType === "admin"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-full ${accountType === "admin" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-center">
                        <span className={`block text-xs sm:text-sm font-bold ${accountType === "admin" ? "text-gray-900" : "text-gray-500"}`}>Administration</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Gérer les services</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-5 sm:mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Chargement...
                  </span>
                ) : (
                  mode === "register" ? "S'inscrire" : "Se connecter"
                )}
              </button>

              <p className="text-center text-xs sm:text-sm text-gray-500 mt-5 sm:mt-6">
                {mode === "register" ? "Déjà inscrit ? " : "Pas de compte ? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "register" ? "login" : "register")}
                  className="text-primary font-bold hover:text-primary-dark hover:underline transition-colors"
                >
                  {mode === "register" ? "Se connecter" : "S'inscrire"}
                </button>
              </p>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-6 sm:mt-8 px-4">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
}