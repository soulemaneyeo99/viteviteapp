"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesAPI, aiAPI } from "@/lib/api";
import { Service } from "@/types";
import {
    Ambulance,
    MapPin,
    Clock,
    Phone,
    AlertTriangle,
    HeartPulse,
    Stethoscope,
    ArrowRight,
    Navigation
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function UrgencesPage() {
    const [symptoms, setSymptoms] = useState("");
    const [triageResult, setTriageResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Fetch services (filtering for Health/Santé in a real app, here we simulate)
    const { data, isLoading } = useQuery({
        queryKey: ["services", "health"],
        queryFn: async () => {
            const response = await servicesAPI.getAll();
            // Filter for health related services or mock them if not enough
            return response.data;
        },
    });

    const services: Service[] = data?.services?.filter((s: Service) => s.category === "Santé" || s.category === "Hôpital") || [];

    // Mock hospitals if none found (for demo)
    const hospitals = services.length > 0 ? services : [
        {
            id: "h1",
            name: "CHU de Cocody - Urgences",
            category: "Santé",
            status: "ouvert",
            current_queue_size: 45,
            estimated_wait_time: 120,
            location: { address: "Cocody, Abidjan", lat: 5.3, lng: -4.0 },
            phone: "0101010101"
        },
        {
            id: "h2",
            name: "Clinique Pisam",
            category: "Santé",
            status: "ouvert",
            current_queue_size: 12,
            estimated_wait_time: 15,
            location: { address: "Cocody, Abidjan", lat: 5.3, lng: -4.0 },
            phone: "0202020202"
        },
        {
            id: "h3",
            name: "Hôpital Mère-Enfant",
            category: "Santé",
            status: "ouvert",
            current_queue_size: 28,
            estimated_wait_time: 45,
            location: { address: "Bingerville", lat: 5.3, lng: -3.9 },
            phone: "0303030303"
        }
    ];

    const handleTriage = async () => {
        if (!symptoms.trim()) return;

        setIsAnalyzing(true);
        try {
            // Call AI triage service
            const response = await aiAPI.medicalTriage(symptoms, undefined, true);
            const triageData = response.data.data;

            // Format result message
            let resultMessage = ``;

            // Urgency level with emoji
            const urgencyEmojis: Record<string, string> = {
                "urgence_vitale": "🚨",
                "urgente": "⚠️",
                "normale": "ℹ️",
                "non_urgente": "✅"
            };

            const urgencyLabels: Record<string, string> = {
                "urgence_vitale": "URGENCE VITALE",
                "urgente": "URGENCE",
                "normale": "CONSULTATION NORMALE",
                "non_urgente": "NON-URGENT"
            };

            const emoji = urgencyEmojis[triageData.urgency_level] || "ℹ️";
            const label = urgencyLabels[triageData.urgency_level] || triageData.urgency_level;

            resultMessage += `${emoji} **${label}**\n\n`;
            resultMessage += `**Action requise:** ${triageData.action_required}\n\n`;

            if (triageData.recommended_hospital) {
                resultMessage += `**Hôpital recommandé:** ${triageData.recommended_hospital.name}\n`;
                resultMessage += `*${triageData.recommended_hospital.reason}*\n\n`;
            }

            if (triageData.primary_concern) {
                resultMessage += `**Préoccupation principale:** ${triageData.primary_concern}\n\n`;
            }

            if (triageData.advice) {
                resultMessage += `💡 ${triageData.advice}\n\n`;
            }

            resultMessage += `\n⚠️ ${triageData.disclaimer}`;

            setTriageResult(resultMessage);

            // If urgence vitale, show alert
            if (triageData.urgency_level === "urgence_vitale") {
                toast.error("URGENCE VITALE DÉTECTÉE - Appelez le SAMU (185) immédiatement !", {
                    duration: 10000
                });
            }

        } catch (error) {
            console.error("Erreur triage:", error);
            // Fallback to simple logic
            if (symptoms.toLowerCase().includes("coeur") || symptoms.toLowerCase().includes("poitrine")) {
                setTriageResult("🚨 URGENCE VITALE POSSIBLE. Dirigez-vous immédiatement vers le CHU de Cocody (Cardiologie) ou appelez le SAMU (185).");
            } else if (symptoms.toLowerCase().includes("tête") || symptoms.toLowerCase().includes("fièvre")) {
                setTriageResult("⚠️ Consultation générale recommandée. La Clinique Pisam a le moins d'attente (15 min).");
            } else {
                setTriageResult("ℹ️ Basé sur vos symptômes, nous recommandons une consultation médicale. L'Hôpital Mère-Enfant est disponible.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header Alert */}
                <div className="bg-red-600 rounded-3xl p-8 text-white mb-10 relative overflow-hidden shadow-xl shadow-red-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse">
                                <Ambulance className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black mb-2">Urgences Santé</h1>
                                <p className="text-red-100 text-lg">Trouvez l'hôpital le moins chargé en temps réel.</p>
                            </div>
                        </div>
                        <a href="tel:185" className="px-8 py-4 bg-white text-red-600 font-black rounded-xl hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            APPELER LE SAMU (185)
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Triage AI */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-28">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Stethoscope className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">IA Triage</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Décrivez vos symptômes</label>
                                    <textarea
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                                        placeholder="Ex: Douleur poitrine, fièvre 39°C..."
                                    />
                                </div>

                                <button
                                    onClick={handleTriage}
                                    disabled={isAnalyzing || !symptoms}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Analyse en cours...
                                        </>
                                    ) : (
                                        <>
                                            <HeartPulse className="w-5 h-5" />
                                            Analyser l'urgence
                                        </>
                                    )}
                                </button>

                                {triageResult && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl animate-fade-in">
                                        <p className="text-sm text-blue-800 font-medium leading-relaxed">
                                            {triageResult}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Hospital List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-slate-900">Disponibilités en temps réel</h2>
                            <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                                Trié par temps d'attente
                            </span>
                        </div>

                        {hospitals.sort((a, b) => (a.estimated_wait_time || 0) - (b.estimated_wait_time || 0)).map((hospital: any) => (
                            <div key={hospital.id} className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-red-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-red-500 transition-colors"></div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pl-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{hospital.name}</h3>
                                            {hospital.estimated_wait_time < 30 && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                    Rapide
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {hospital.location?.address || "Abidjan"}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-4 h-4" />
                                                {hospital.phone || "Non disponible"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Attente</div>
                                            <div className={`text-2xl font-black ${hospital.estimated_wait_time < 30 ? "text-green-600" :
                                                hospital.estimated_wait_time < 60 ? "text-orange-500" : "text-red-600"
                                                }`}>
                                                {hospital.estimated_wait_time} <span className="text-sm font-medium text-slate-400">min</span>
                                            </div>
                                        </div>

                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location?.lat},${hospital.location?.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <Navigation className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
