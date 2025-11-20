// frontend/src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCircle2, ShieldCheck } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await axios.post(`${API_URL}/api/v1/auth/register`, {
        email: form.email,
        password: form.password,
        full_name: form.full_name || undefined,
        phone: form.phone || undefined,
        role: accountType,
      });

      localStorage.setItem("access_token", response.data.tokens.access_token);
      localStorage.setItem("refresh_token", response.data.tokens.refresh_token);
      localStorage.setItem("user_role", accountType);

      toast.success("Compte créé avec succès !");
      
      setTimeout(() => {
        router.push(accountType === "admin" ? "/admin" : "/services");
      }, 500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail;
      if (Array.isArray(errorMsg)) {
        errorMsg.forEach((err: any) => {
          toast.error(err.msg || "Erreur de validation");
        });
      } else if (typeof errorMsg === "string") {
        toast.error(errorMsg);
      } else {
        toast.error("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF8C00] to-[#FF6F00] rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ViteViteApp</h1>
          <p className="text-gray-600">Créer votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Votre nom"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="+225 XX XX XX XX XX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Type de compte *</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF8C00] hover:bg-[#FF6F00] text-white font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-[#FF8C00] font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}