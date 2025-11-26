'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { transportAPI } from '@/lib/api';
import Link from 'next/link';

interface SotraLine {
    id: number;
    number: string;
    origin: string;
    destination: string;
    color: string;
}

export default function SotraPage() {
    const [lines, setLines] = useState<SotraLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadLines();
    }, []);

    const loadLines = async () => {
        try {
            const response = await transportAPI.getSotraLines();
            setLines(response.data);
        } catch (error) {
            console.error('Error loading lines:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLines = lines.filter(l =>
        l.number.includes(search) ||
        l.origin.toLowerCase().includes(search.toLowerCase()) ||
        l.destination.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-gray-900 pb-24 pt-24 px-4 rounded-b-[3rem]">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h1 className="text-3xl font-bold mb-4">SOTRA Temps Réel</h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                        Consultez les horaires, suivez les bus sur la carte et évitez les files d'attente.
                    </p>

                    <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 max-w-lg mx-auto">
                        <Search className="w-6 h-6 text-gray-400 ml-2" />
                        <input
                            type="text"
                            placeholder="Rechercher une ligne (ex: 19, 47)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full outline-none font-medium text-gray-900 placeholder:text-gray-400 text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="max-w-4xl mx-auto px-4 -mt-8 mb-8">
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-yellow-800 text-sm">Perturbation Trafic</h3>
                        <p className="text-sm text-yellow-700">Ralentissements signalés sur le Boulevard Latrille. Prévoyez 15 min de plus.</p>
                    </div>
                </div>
            </div>

            {/* Lines List */}
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="font-bold text-lg text-gray-900 mb-6">Lignes disponibles</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-32 animate-pulse"></div>
                        ))
                    ) : (
                        filteredLines.map((line) => (
                            <Link
                                href={`/transport/sotra/${line.id}`}
                                key={line.id}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-yellow-300 transition-all group hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-md"
                                        style={{ backgroundColor: line.color || '#FDB913' }}
                                    >
                                        {line.number}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        Prochain: 5 min
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                                    <span>{line.origin}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                    <span>{line.destination}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Users className="w-3 h-3" />
                                        Affluence moyenne
                                    </div>
                                    <span className="text-sm font-bold text-green-600 group-hover:underline">
                                        Voir carte
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
