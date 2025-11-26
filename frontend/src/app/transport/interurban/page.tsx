'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Star, ArrowRight, Filter } from 'lucide-react';
import { transportAPI } from '@/lib/api';
import Link from 'next/link';

interface Company {
    id: number;
    name: string;
    logo_url: string;
    rating: number;
    contact_phone: string;
}

export default function InterurbanPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const response = await transportAPI.getCompanies();
            setCompanies(response.data);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header & Search */}
            <div className="bg-gray-900 pb-24 pt-24 px-4 rounded-b-[3rem]">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8 text-center">Où souhaitez-vous aller ?</h1>

                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Départ</label>
                                <div className="flex items-center gap-2 border-b-2 border-gray-100 py-2 focus-within:border-yellow-500 transition-colors">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Abidjan"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        className="w-full outline-none font-medium text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destination</label>
                                <div className="flex items-center gap-2 border-b-2 border-gray-100 py-2 focus-within:border-yellow-500 transition-colors">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Bouaké, Yamoussoukro..."
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full outline-none font-medium text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                <div className="flex items-center gap-2 border-b-2 border-gray-100 py-2 focus-within:border-yellow-500 transition-colors">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full outline-none font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-yellow-500 text-white py-4 rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" />
                            Rechercher un départ
                        </button>
                    </div>
                </div>
            </div>

            {/* Companies List */}
            <div className="max-w-6xl mx-auto px-4 -mt-12">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-bold text-gray-900">Compagnies Partenaires</h2>
                    <button className="text-sm text-yellow-600 font-medium flex items-center gap-1">
                        <Filter className="w-4 h-4" /> Filtrer
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm h-40 animate-pulse"></div>
                        ))
                    ) : (
                        companies.map((company) => (
                            <Link
                                href={`/transport/interurban/${company.id}`}
                                key={company.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-400">
                                        {company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-lg" /> : company.name[0]}
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-yellow-700 text-sm">{company.rating}</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                                    {company.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Départs quotidiens vers l'intérieur
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        Dispo. aujourd'hui
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
