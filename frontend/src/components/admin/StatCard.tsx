'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    color?: string; // Tailwind color class prefix (e.g., "blue", "green")
}

export default function StatCard({ title, value, icon, trend, color = "blue" }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend.isPositive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}>
                        {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
}
