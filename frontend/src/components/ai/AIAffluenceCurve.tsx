"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { aiAPI } from "@/lib/api";
import { TrendingUp, Clock, Sun, Moon, Calendar } from "lucide-react";

interface AIAffluenceCurveProps {
    serviceId: string;
}

export default function AIAffluenceCurve({ serviceId }: AIAffluenceCurveProps) {
    const { data: prediction } = useQuery({
        queryKey: ["ai-best-time", serviceId],
        queryFn: async () => {
            const response = await aiAPI.getBestTime(serviceId);
            return response.data.data;
        },
        refetchInterval: 300000, // 5 minutes
    });

    const peakHours = prediction?.peak_hours_today || ["9h-11h", "14h-16h"];
    const bestTimeToday = prediction?.best_time_today;
    const bestTimeTomorrow = prediction?.best_time_tomorrow || "8h-9h";

    // Simulated hourly data for visualization
    const hourlyData = [
        { hour: "8h", level: 30, label: "Ouverture" },
        { hour: "9h", level: 70, label: "Pic matin" },
        { hour: "10h", level: 85, label: "Très chargé" },
        { hour: "11h", level: 75, label: "Chargé" },
        { hour: "12h", level: 50, label: "Pause déjeuner" },
        { hour: "13h", level: 40, label: "Calme" },
        { hour: "14h", level: 65, label: "Reprise" },
        { hour: "15h", level: 80, label: "Pic après-midi" },
        { hour: "16h", level: 60, label: "Modéré" },
        { hour: "17h", level: 35, label: "Fermeture" },
    ];

    const maxLevel = Math.max(...hourlyData.map((d) => d.level));

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Courbe d'affluence</h3>
                    <p className="text-xs text-slate-500">Prédictions IA pour aujourd'hui</p>
                </div>
            </div>

            {/* Chart */}
            <div className="mb-6">
                <div className="flex items-end justify-between gap-2 h-48">
                    {hourlyData.map((item, index) => {
                        const heightPercent = (item.level / maxLevel) * 100;
                        const isPeak = peakHours.some((peak: string) => item.hour.startsWith(peak.split("-")[0]));
                        const isBest = bestTimeToday && item.hour.startsWith(bestTimeToday.split("-")[0]);

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                {/* Bar */}
                                <div className="w-full flex flex-col justify-end h-full">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${isBest
                                            ? "bg-gradient-to-t from-green-400 to-green-600"
                                            : isPeak
                                                ? "bg-gradient-to-t from-red-400 to-red-600"
                                                : "bg-gradient-to-t from-blue-400 to-blue-600"
                                            }`}
                                        style={{ height: `${heightPercent}%` }}
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                            {item.label} - {item.level}%
                                        </div>
                                    </div>
                                </div>

                                {/* Hour Label */}
                                <span className="text-xs font-medium text-slate-600">{item.hour}</span>

                                {/* Icon for best time */}
                                {isBest && <Sun className="w-3 h-3 text-green-600" />}
                                {isPeak && !isBest && <Moon className="w-3 h-3 text-red-600" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                    <Sun className="w-4 h-4 text-green-600" />
                    <div className="text-xs">
                        <p className="font-bold text-green-900">Meilleur moment</p>
                        <p className="text-green-700">{bestTimeToday || "Après 14h"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <Moon className="w-4 h-4 text-red-600" />
                    <div className="text-xs">
                        <p className="font-bold text-red-900">Heures de pic</p>
                        <p className="text-red-700">{peakHours.join(", ")}</p>
                    </div>
                </div>
            </div>

            {/* Tomorrow Recommendation */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Demain
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                        Meilleur créneau: <span className="text-blue-600">{bestTimeTomorrow}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
