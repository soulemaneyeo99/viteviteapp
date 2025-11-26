'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { administrationsAPI } from '@/lib/api';
import { Search, MapPin, Clock, Users, Filter, ArrowRight, Building2, Phone, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Administration {
    id: string;
    name: string;
    type: string;
    description: string;
    main_image_url: string;
    location: {
        lat: number;
        lng: number;
        address: string;
        city: string;
    };
    phone: string;
    email: string;
    website: string;
    is_open: boolean;
    total_queue_size: number;
    average_wait_time: number;
    total_active_counters: number;
    rating: number;
    created_at: string;
}

export default function AdministrationsPage() {
    const [selectedType, setSelectedType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOpenOnly, setShowOpenOnly] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['administrations', selectedType, searchQuery, showOpenOnly],
        queryFn: async () => {
            const params: any = {};
            if (selectedType !== 'all') params.type = selectedType;
            if (searchQuery) params.search = searchQuery;
            if (showOpenOnly) params.is_open = true;

            const response = await administrationsAPI.getAll(params);
            return response.data;
        },
    });

    const administrations: Administration[] = data?.administrations || [];
    const types = ['all', 'mairie', 'prefecture', 'hospital', 'cnps', 'police', 'impots'];

    const typeLabels: Record<string, string> = {
        all: 'Tous',
        mairie: 'Mairies',
        prefecture: 'Préfectures',
        hospital: 'Hôpitaux',
        cnps: 'CNPS',
        police: 'Police',
        impots: 'Impôts'
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header - Yellow/White/Gray Theme */}
            <div className="relative bg-white text-gray-900 pt-32 pb-20 px-6 overflow-hidden border-b-4 border-yellow-500">
                {/* Yellow Accent Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FDB913' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full mb-6">
                        <Building2 className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Services Administratifs</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-gray-900">
                        Administrations <span className="text-yellow-600">&</span> Services Publics
                    </h1>
                    <p className="text-gray-600 text-xl max-w-2xl font-medium leading-relaxed">
                        Trouvez rapidement l'administration dont vous avez besoin. Files d'attente en temps réel, horaires, et services disponibles.
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-900/5 p-4 md:p-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-yellow-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher une administration..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500/20 focus:bg-white transition-all font-medium text-lg placeholder:text-gray-400"
                            />
                        </div>

                        {/* Open Only Filter */}
                        <button
                            onClick={() => setShowOpenOnly(!showOpenOnly)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${showOpenOnly
                                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-yellow-200 hover:bg-yellow-50/50'
                                }`}
                        >
                            <Filter className={`w-5 h-5 ${showOpenOnly ? 'animate-pulse' : ''}`} />
                            {showOpenOnly ? 'Ouvert maintenant' : 'Tous'}
                        </button>
                    </div>

                    {/* Type Filters */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        {types.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedType === type
                                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {typeLabels[type]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-96 animate-pulse">
                                <div className="h-48 bg-gray-100 rounded-2xl mb-4"></div>
                                <div className="h-6 bg-gray-100 rounded-lg w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {administrations.map((admin) => (
                            <Link
                                href={`/administrations/${admin.id}`}
                                key={admin.id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-900/5 hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    {admin.main_image_url ? (
                                        <img
                                            src={admin.main_image_url}
                                            alt={admin.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50">
                                            <Building2 className="w-16 h-16 text-yellow-200" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        {admin.is_open ? (
                                            <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                                                Ouvert
                                            </span>
                                        ) : (
                                            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                                                Fermé
                                            </span>
                                        )}
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                        <span className="text-[10px] font-bold text-gray-900 uppercase">{admin.type}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                                        {admin.name}
                                    </h3>

                                    <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                        <span className="line-clamp-2">{admin.location?.address}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-semibold uppercase">File</span>
                                            </div>
                                            <div className="text-lg font-black text-gray-900">{admin.total_queue_size}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-semibold uppercase">Attente</span>
                                            </div>
                                            <div className="text-lg font-black text-gray-900">{admin.average_wait_time}min</div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="w-6 h-6 rounded-full bg-yellow-50 flex items-center justify-center">
                                                <Building2 className="w-3.5 h-3.5 text-yellow-600" />
                                            </div>
                                            <span className="font-bold">{admin.total_active_counters} guichets</span>
                                        </div>
                                        <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!isLoading && administrations.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune administration trouvée</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Essayez de modifier vos filtres ou votre recherche.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
