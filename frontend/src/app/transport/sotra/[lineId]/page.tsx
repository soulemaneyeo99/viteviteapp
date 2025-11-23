'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Users, Navigation } from 'lucide-react';
import { transportAPI } from '@/lib/api';
import Link from 'next/link';

// Composant Carte simulé (placeholder pour Google Maps)
const MapPlaceholder = ({ buses, stops }: { buses: any[], stops: any[] }) => (
    <div className="w-full h-full bg-slate-100 relative overflow-hidden rounded-2xl border border-slate-200">
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-2xl select-none pointer-events-none">
            CARTE GOOGLE MAPS
        </div>

        {/* Simulation Stops */}
        {stops.map((stop, i) => (
            <div
                key={stop.id}
                className="absolute w-4 h-4 bg-white border-2 border-slate-400 rounded-full shadow-sm"
                style={{ top: `${30 + (i * 15)}%`, left: `${20 + (i * 10)}%` }}
                title={stop.name}
            />
        ))}

        {/* Simulation Buses */}
        {buses.map((bus) => (
            <div
                key={bus.id}
                className="absolute w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"
                style={{ top: `${bus.lat * 1000 % 80 + 10}%`, left: `${bus.lng * 1000 % 80 + 10}%` }}
            >
                <Navigation className="w-4 h-4 -rotate-45" />
            </div>
        ))}
    </div>
);

export default function SotraLinePage() {
    const params = useParams();
    const [lineData, setLineData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStop, setSelectedStop] = useState<any>(null);
    const [arrivals, setArrivals] = useState<any[]>([]);

    useEffect(() => {
        loadLineData();
        const interval = setInterval(loadLineData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [params.lineId]);

    const loadLineData = async () => {
        try {
            const response = await transportAPI.getLineRealtime(Number(params.lineId));
            setLineData(response.data);
            // Select first stop by default
            if (!selectedStop && response.data.stops.length > 0) {
                handleStopClick(response.data.stops[0]);
            }
        } catch (error) {
            console.error('Error loading line data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStopClick = async (stop: any) => {
        setSelectedStop(stop);
        try {
            const response = await transportAPI.getStopArrivals(stop.id);
            setArrivals(response.data);
        } catch (error) {
            console.error('Error loading arrivals:', error);
        }
    };

    if (loading || !lineData) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/transport/sotra" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-sm"
                        style={{ backgroundColor: lineData.line.color }}
                    >
                        {lineData.line.number}
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800 text-sm md:text-base">{lineData.line.origin} → {lineData.line.destination}</h1>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Trafic fluide
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content (Map + Panel) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-200">
                    <MapPlaceholder buses={lineData.buses} stops={lineData.stops} />

                    {/* Mobile Bottom Sheet Trigger (Visible only on mobile) */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg md:hidden">
                        <h3 className="font-bold text-slate-800 mb-2">Prochains passages</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <span className="text-2xl font-bold text-slate-800">5 min</span>
                            </div>
                            <span className="text-sm text-slate-500">Arrêt Sorbonne</span>
                        </div>
                    </div>
                </div>

                {/* Info Panel (Sidebar on Desktop) */}
                <div className="w-full md:w-96 bg-white border-l border-slate-200 overflow-y-auto hidden md:block">
                    <div className="p-6">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            Arrêts de la ligne
                        </h2>

                        <div className="space-y-2 relative">
                            {/* Ligne verticale de connexion */}
                            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200"></div>

                            {lineData.stops.map((stop: any) => (
                                <button
                                    key={stop.id}
                                    onClick={() => handleStopClick(stop)}
                                    className={`relative flex items-center gap-4 w-full p-3 rounded-xl transition-all text-left ${selectedStop?.id === stop.id
                                            ? 'bg-emerald-50 border border-emerald-100'
                                            : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${selectedStop?.id === stop.id
                                            ? 'bg-emerald-600 border-emerald-100 text-white'
                                            : 'bg-white border-slate-300 text-slate-400'
                                        }`}>
                                        <div className="w-2 h-2 bg-current rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className={`font-bold ${selectedStop?.id === stop.id ? 'text-emerald-800' : 'text-slate-700'}`}>
                                            {stop.name}
                                        </div>
                                        {selectedStop?.id === stop.id && (
                                            <div className="text-xs text-emerald-600 font-medium mt-0.5">
                                                Sélectionné
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedStop && (
                            <div className="mt-8 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-4">
                                <h3 className="font-bold text-slate-800 mb-4">Prochains passages à {selectedStop.name}</h3>
                                <div className="space-y-3">
                                    {arrivals.map((arr, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="font-bold text-slate-800 text-lg">{arr.minutes} min</div>
                                                <div className="text-xs text-slate-500">
                                                    Vers {arr.destination}
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${arr.load === 'low' ? 'bg-emerald-100 text-emerald-700' :
                                                    arr.load === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                <Users className="w-3 h-3 inline mr-1" />
                                                {arr.load === 'low' ? 'Peu de monde' : arr.load === 'medium' ? 'Normal' : 'Bondé'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
