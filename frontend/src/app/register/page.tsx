"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!form.email) {
      newErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email invalide";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Mot de passe requis";
    } else if (form.password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    } else if (!/(?=.*[a-z])/.test(form.password)) {
      newErrors.password = "Doit contenir une minuscule";
    } else if (!/(?=.*[A-Z])/.test(form.password)) {
      newErrors.password = "Doit contenir une majuscule";
    } else if (!/(?=.*\d)/.test(form.password)) {
      newErrors.password = "Doit contenir un chiffre";
    }

    // Phone (optionnel mais validation si rempli)
    if (form.phone && !/^\+?225\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Format: +225XXXXXXXXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }

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
      router.push("/dashboard");
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error("Erreur lors de la création du compte");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <span className="text-2xl font-black">ViteviteApp</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
          <p className="text-gray-600">Rejoignez ViteviteApp gratuitement</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Nom complet */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nom complet</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Jean Kouassi"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold mb-2">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.phone ? "border-red-500" : ""
              }`}
              placeholder="+225 XX XX XX XX XX"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none pr-12 ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    form.password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span>Minimum 8 caractères</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    /(?=.*[a-z])/.test(form.password) ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span>Une minuscule</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    /(?=.*[A-Z])/.test(form.password) ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span>Une majuscule</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    /(?=.*\d)/.test(form.password) ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span>Un chiffre</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark disabled:opacity-50 transition"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}