'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Filter, ArrowRight, Phone, Navigation } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Pharmacies de Garde & Services</h1>
                    <p className="text-emerald-100 text-lg max-w-2xl">
                        Trouvez rapidement les médicaments dont vous avez besoin dans les pharmacies les plus proches.
                        Disponibilité en temps réel et commande en ligne.
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une pharmacie, un quartier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowOnDutyOnly(!showOnDutyOnly)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all w-full md:w-auto justify-center ${showOnDutyOnly
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Clock className="w-5 h-5" />
                        {showOnDutyOnly ? 'Pharmacies de Garde' : 'Toutes les pharmacies'}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-48 animate-pulse">
                                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pharmacies.map((pharmacy) => (
                            <Link
                                href={`/pharmacies/${pharmacy.id}`}
                                key={pharmacy.id}
                                className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                                            {pharmacy.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                            <MapPin className="w-4 h-4" />
                                            {pharmacy.address}
                                        </div>
                                    </div>
                                    {pharmacy.is_on_duty && (
                                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            GARDE
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${pharmacy.is_open
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {pharmacy.is_open ? 'Ouvert' : 'Fermé'}
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {pharmacy.phone}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                        <Navigation className="w-4 h-4" />
                                        1.2 km
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                        Voir stocks
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && pharmacies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune pharmacie trouvée</h3>
                        <p className="text-slate-500">Essayez de modifier vos critères de recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
