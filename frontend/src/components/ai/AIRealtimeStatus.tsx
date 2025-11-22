"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { aiAPI } from "@/lib/api";
import { Clock, TrendingUp, Users, AlertCircle, Sparkles } from "lucide-react";

interface AIRealtimeStatusProps {
    serviceId: string;
    serviceName: string;
    currentQueueSize: number;
    estimatedWaitTime: number;
}

export default function AIRealtimeStatus({
    serviceId,
    serviceName,
    currentQueueSize,
    estimatedWaitTime,
}: AIRealtimeStatusProps) {
    // Fetch AI prediction
    const { data: prediction, isLoading } = useQuery({
        queryKey: ["ai-prediction", serviceId],
        queryFn: async () => {
            const response = await aiAPI.predictAffluence(serviceId);
            return response.data.data;
        },
        refetchInterval: 60000, // Refresh every minute
        staleTime: 30000,
    });

    const affluenceColors = {
        faible: "bg-green-100 text-green-700 border-green-200",
        modérée: "bg-yellow-100 text-yellow-700 border-yellow-200",
        élevée: "bg-orange-100 text-orange-700 border-orange-200",
        très_élevée: "bg-red-100 text-red-700 border-red-200",
    };

    const affluenceIcons = {
        faible: "😊",
        modérée: "😐",
        élevée: "😰",
        très_élevée: "🔥",
    };

    const currentAffluence = prediction?.current_affluence || "modérée";
    const predictedWaitTime = prediction?.predicted_wait_time || estimatedWaitTime;
    const confidence = prediction?.confidence || 0.7;
    const trend = prediction?.trend || "stable";

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{serviceName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            En temps réel
                        </p>
                    </div>
                </div>

                {/* Affluence Badge */}
                <div
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${affluenceColors[currentAffluence as keyof typeof affluenceColors]
                        } flex items-center gap-1.5`}
                >
                    <span>{affluenceIcons[currentAffluence as keyof typeof affluenceIcons]}</span>
                    {currentAffluence.charAt(0).toUpperCase() + currentAffluence.slice(1)}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Queue Size */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                        <Users className="w-3 h-3" />
                        File
                    </div>
                    <div className="text-2xl font-black text-slate-900">{currentQueueSize}</div>
                    <div className="text-xs text-slate-400">personnes</div>
                </div>

                {/* Wait Time */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        Attente
                    </div>
                    <div className="text-2xl font-black text-blue-600">{predictedWaitTime}</div>
                    <div className="text-xs text-slate-400">minutes</div>
                </div>

                {/* Confidence */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                        <Sparkles className="w-3 h-3" />
                        Précision
                    </div>
                    <div className="text-2xl font-black text-purple-600">
                        {Math.round(confidence * 100)}%
                    </div>
                    <div className="text-xs text-slate-400">IA</div>
                </div>
            </div>

            {/* Trend Indicator */}
            {trend && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
                    <TrendingUp
                        className={`w-4 h-4 ${trend === "increasing"
                                ? "text-red-500 rotate-45"
                                : trend === "decreasing"
                                    ? "text-green-500 -rotate-45"
                                    : "text-slate-500"
                            }`}
                    />
                    <span className="text-sm text-slate-700">
                        Tendance:{" "}
                        <span className="font-bold">
                            {trend === "increasing"
                                ? "En hausse"
                                : trend === "decreasing"
                                    ? "En baisse"
                                    : "Stable"}
                        </span>
                    </span>
                </div>
            )}

            {/* Best Time Recommendation */}
            {prediction?.best_time_today && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="font-bold text-blue-900 mb-0.5">💡 Conseil IA</p>
                        <p className="text-blue-700">
                            Meilleur moment aujourd'hui: <span className="font-bold">{prediction.best_time_today}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Recommendation */}
            {prediction?.recommendation && !prediction?.best_time_today && (
                <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-700">
                        <span className="font-bold">💬 </span>
                        {prediction.recommendation}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
