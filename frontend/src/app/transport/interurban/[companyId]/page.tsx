'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, MapPin, Users, Wifi, Coffee, ArrowLeft, ChevronRight } from 'lucide-react';
import { transportAPI } from '@/lib/api';
import Link from 'next/link';
import BookingFlow from '@/components/transport/BookingFlow';

interface Departure {
    id: number;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    car_type: 'VIP' | 'Classique';
    available_seats: number;
    status: string;
}

export default function CompanyPage() {
    const params = useParams();
    const [departures, setDepartures] = useState<Departure[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);

    useEffect(() => {
        loadDepartures();
    }, [params.companyId]);

    const loadDepartures = async () => {
        try {
            // Pour la démo, on charge tous les départs (dans la réalité on filtrerait par compagnie)
            const response = await transportAPI.searchDepartures('', '');
            setDepartures(response.data);
        } catch (error) {
            console.error('Error loading departures:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getDuration = (start: string, end: string) => {
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h${minutes > 0 ? minutes : ''}`;
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-6 px-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto">
                    <Link href="/transport/interurban" className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux compagnies
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                            UTB
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Union des Transports de Bouaké</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Gare Adjamé</span>
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <Clock className="w-4 h-4" /> 3 départs aujourd'hui
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Departures List */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="font-bold text-lg text-gray-900 mb-6">Prochains départs disponibles</h2>

                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse"></div>
                        ))
                    ) : (
                        departures.map((dep) => (
                            <div key={dep.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-yellow-300 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                                    {/* Time & Route */}
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">{formatTime(dep.departure_time)}</span>
                                                <div className="h-px w-12 bg-gray-300 relative">
                                                    <div className="absolute -top-1 right-0 w-2 h-2 bg-gray-300 rounded-full"></div>
                                                </div>
                                                <span className="text-xl font-medium text-gray-500">{formatTime(dep.arrival_time)}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                {getDuration(dep.departure_time, dep.arrival_time)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <span>{dep.origin}</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180 text-gray-300" />
                                                <span>{dep.destination}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info & Price */}
                                    <div className="flex items-center justify-between w-full md:w-auto gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${dep.car_type === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {dep.car_type}
                                                </span>
                                                {dep.car_type === 'VIP' && (
                                                    <div className="flex gap-1">
                                                        <Wifi className="w-3 h-3 text-gray-400" />
                                                        <Coffee className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Users className="w-4 h-4" />
                                                <span className={dep.available_seats < 5 ? 'text-red-500 font-bold' : ''}>
                                                    {dep.available_seats} places
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xl font-bold text-yellow-600">{dep.price.toLocaleString()} F</div>
                                            <button
                                                onClick={() => setSelectedDeparture(dep)}
                                                className="mt-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm hover:shadow flex items-center gap-1"
                                            >
                                                Réserver <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {selectedDeparture && (
                <BookingFlow
                    departure={selectedDeparture}
                    onClose={() => setSelectedDeparture(null)}
                />
            )}
        </div>
    );
}
