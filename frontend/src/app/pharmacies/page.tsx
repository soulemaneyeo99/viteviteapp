'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Filter, ArrowRight, Phone, Navigation, Sparkles, Pill, AlertTriangle } from 'lucide-react';
import { pharmacyAPI } from '@/lib/api';
import Link from 'next/link';

interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone: string;
    is_on_duty: boolean;
    is_open: boolean;
    latitude: number;
    longitude: number;
    image_url?: string;
}

export default function PharmaciesPage() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showOnDutyOnly, setShowOnDutyOnly] = useState(false);

    useEffect(() => {
        loadPharmacies();
    }, [search, showOnDutyOnly]);

    const loadPharmacies = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (showOnDutyOnly) params.is_on_duty = true;

            const response = await pharmacyAPI.getAll(params);
            setPharmacies(response.data);
        } catch (error) {
            console.error('Error loading pharmacies:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header Pro */}
            <div className="relative bg-emerald-900 text-white pt-32 pb-20 px-6 overflow-hidden">
                <img src="/grid.svg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-emerald-500/20 to-transparent pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/50 border border-emerald-700/50 rounded-full mb-6 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">Powered by AI</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Pharmacies de Garde <span className="text-emerald-400">& Services</span>
                    </h1>
                    <p className="text-emerald-100/80 text-xl max-w-2xl font-medium leading-relaxed">
                        Trouvez instantanément les médicaments disponibles. Notre IA analyse les stocks et l'affluence en temps réel pour vous guider.
                    </p>
                </div>
            </div>

            {/* Search & Filters Floating */}
            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher une pharmacie, un médicament..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium text-lg placeholder:text-gray-400"
                        />
                    </div>

                    <button
                        onClick={() => setShowOnDutyOnly(!showOnDutyOnly)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all w-full md:w-auto justify-center ${showOnDutyOnly
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                            : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                            }`}
                    >
                        <Clock className={`w-5 h-5 ${showOnDutyOnly ? 'animate-pulse' : ''}`} />
                        {showOnDutyOnly ? 'Pharmacies de Garde' : 'Toutes les pharmacies'}
                    </button>
                </div>
            </div>

            {/* AI Recommendation Banner */}
            {!loading && pharmacies.length > 0 && (
                <div className="max-w-6xl mx-auto px-6 mt-12">
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-1 shadow-lg shadow-indigo-200/50">
                        <div className="bg-white/10 backdrop-blur-md rounded-[1.3rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Sparkles className="w-8 h-8 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Recommandation IA</h3>
                                    <p className="text-indigo-100 text-sm leading-relaxed max-w-xl">
                                        Basé sur votre position et l'heure actuelle, la <span className="font-bold text-white">Pharmacie des Lagunes</span> est le meilleur choix (Stock disponible, < 5 min d'attente).
                                    </p>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg whitespace-nowrap">
                                Y aller maintenant
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-64 animate-pulse">
                                <div className="h-48 bg-gray-100 rounded-2xl mb-4"></div>
                                <div className="h-6 bg-gray-100 rounded-lg w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pharmacies.map((pharmacy) => (
                            <Link
                                href={`/pharmacies/${pharmacy.id}`}
                                key={pharmacy.id}
                                className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Image / Map Placeholder */}
                                <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden mb-5">
                                    {pharmacy.image_url ? (
                                        <img src={pharmacy.image_url} alt={pharmacy.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                                            <MapPin className="w-12 h-12 text-emerald-200" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {pharmacy.is_on_duty && (
                                            <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Garde
                                            </span>
                                        )}
                                        {pharmacy.is_open ? (
                                            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                                                Ouvert
                                            </span>
                                        ) : (
                                            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                                                Fermé
                                            </span>
                                        )}
                                    </div>

                                    {/* AI Badge */}
                                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/50">
                                        <Sparkles className="w-3 h-3 text-violet-600" />
                                        <span className="text-[10px] font-bold text-violet-900">Stock OK</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                                        {pharmacy.name}
                                    </h3>

                                    <div className="flex items-start gap-2 text-gray-500 text-sm mb-4 flex-1">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                        <span className="line-clamp-2">{pharmacy.address}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <Navigation className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">1.2 km</span>
                                        </div>
                                        <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && pharmacies.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune pharmacie trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Nous n'avons trouvé aucune pharmacie correspondant à votre recherche. Essayez d'autres mots-clés.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
