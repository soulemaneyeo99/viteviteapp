"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface AffluenceChartProps {
    type?: 'global' | 'specific';
    title?: string;
    subtitle?: string;
    className?: string;
}

// Realistic data pattern for a typical administration day
// Peaks at 10am and 3pm, dip at lunch (1pm)
const GLOBAL_DATA = [
    { time: '07:30', value: 10, label: 'Ouverture' },
    { time: '08:00', value: 25, label: '' },
    { time: '09:00', value: 65, label: 'Montée' },
    { time: '10:00', value: 95, label: 'Pic Matin' },
    { time: '11:00', value: 85, label: '' },
    { time: '12:00', value: 60, label: '' },
    { time: '13:00', value: 40, label: 'Pause Déj' },
    { time: '14:00', value: 75, label: 'Reprise' },
    { time: '15:00', value: 90, label: 'Pic Après-midi' },
    { time: '16:00', value: 55, label: '' },
    { time: '17:00', value: 20, label: 'Fermeture' },
];

// Slightly more volatile data for a specific service
const SPECIFIC_DATA = [
    { time: '07:30', value: 5, label: 'Ouverture' },
    { time: '08:00', value: 15, label: '' },
    { time: '09:00', value: 45, label: '' },
    { time: '10:00', value: 85, label: 'Saturé' },
    { time: '11:00', value: 70, label: '' },
    { time: '12:00', value: 45, label: '' },
    { time: '13:00', value: 30, label: 'Calme' },
    { time: '14:00', value: 65, label: '' },
    { time: '15:00', value: 80, label: 'Forte affluence' },
    { time: '16:00', value: 40, label: '' },
    { time: '17:00', value: 10, label: 'Fermeture' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-700">
                <p className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    {label}
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full"></div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Affluence</p>
                        <p className="text-2xl font-black text-white">{payload[0].value}%</p>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">
                    {payload[0].value > 80 ? "Très forte affluence" :
                        payload[0].value > 50 ? "Affluence moyenne" : "Peu d'attente"}
                </p>
            </div>
        );
    }
    return null;
};

export default function AffluenceChart({
    type = 'global',
    title = "Affluence en temps réel",
    subtitle = "Basé sur l'historique et les données actuelles",
    className = ""
}: AffluenceChartProps) {
    const data = type === 'global' ? GLOBAL_DATA : SPECIFIC_DATA;
    const currentHour = new Date().getHours();

    // Calculate current stats for the header
    const currentStat = 65; // Hardcoded for demo stability
    const trend = "+12%";

    return (
        <div className={`bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-orange-500" />
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-orange-50 rounded-2xl border border-orange-100">
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-0.5">Actuellement</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-slate-900">{currentStat}%</span>
                            <span className="text-xs font-bold text-red-500 mb-1.5 flex items-center">
                                {trend} <TrendingUp className="w-3 h-3 ml-0.5" />
                            </span>
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-slate-100"></div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Fluide
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            Moyen
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Saturé
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-[300px] w-full p-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAffluence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5 5' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#f97316"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorAffluence)"
                            animationDuration={2000}
                        />

                        {/* Current Time Line (Simulated at 14:30 for demo) */}
                        <ReferenceLine x="14:00" stroke="#ef4444" strokeDasharray="3 3">
                            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full absolute -top-8 left-1/2 transform -translate-x-1/2">
                                Maintenant
                            </div>
                        </ReferenceLine>
                    </AreaChart>
                </ResponsiveContainer>

                {/* Live Indicator */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-700">EN DIRECT</span>
                </div>
            </div>
        </div>
    );
}
