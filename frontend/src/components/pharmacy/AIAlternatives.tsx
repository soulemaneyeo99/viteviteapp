'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { pharmacyAPI } from '@/lib/api';

interface Alternative {
    name: string;
    molecule: string;
    type: string;
    dosage: string;
    confidence: number;
    warning?: string;
}

interface AIAlternativesProps {
    medicineName: string;
    dosage: string;
    onClose: () => void;
}

export default function AIAlternatives({ medicineName, dosage, onClose }: AIAlternativesProps) {
    const [alternatives, setAlternatives] = useState<Alternative[]>([]);
    const [loading, setLoading] = useState(true);
    const [advice, setAdvice] = useState('');

    useEffect(() => {
        loadAlternatives();
    }, [medicineName, dosage]);

    const loadAlternatives = async () => {
        setLoading(true);
        try {
            const response = await pharmacyAPI.getAlternatives(medicineName, dosage);
            setAlternatives(response.data.alternatives);
            setAdvice(response.data.advice);
        } catch (error) {
            console.error('Error loading alternatives:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span className="font-bold uppercase tracking-wider text-xs bg-white/20 px-2 py-1 rounded">IA Suggestion</span>
                    </div>
                    <h2 className="text-xl font-bold">Alternatives trouvées</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                        Pour remplacer : <span className="font-semibold">{medicineName} {dosage}</span>
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-800">{advice}</p>
                            </div>

                            <div className="space-y-3">
                                {alternatives.map((alt, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50 transition-all group cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-700">{alt.name}</h3>
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                                        {alt.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">Molécule : {alt.molecule} • {alt.dosage}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                    {Math.round(alt.confidence * 100)}% match
                                                </span>
                                            </div>
                                        </div>

                                        {alt.warning && (
                                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {alt.warning}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Pharmacies ayant ce produit
                                </h4>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {['Pharmacie des Arts', 'Pharmacie Mermoz'].map((pharm, i) => (
                                        <button key={i} className="flex-shrink-0 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all whitespace-nowrap">
                                            {pharm} (1.2 km)
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
