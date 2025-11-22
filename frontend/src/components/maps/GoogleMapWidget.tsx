"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Clock, Phone } from "lucide-react";

interface GoogleMapWidgetProps {
    services: Array<{
        id: string;
        name: string;
        location?: {
            lat: number;
            lng: number;
            address?: string;
        };
        estimated_wait_time?: number;
        current_queue_size?: number;
    }>;
    userLocation?: {
        lat: number;
        lng: number;
    };
    height?: string;
}

export default function GoogleMapWidget({
    services,
    userLocation,
    height = "400px",
}: GoogleMapWidgetProps) {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    // Calculer le centre de la carte
    const centerLat = userLocation?.lat || 5.3364;
    const centerLng = userLocation?.lng || -4.0267;

    // Filtrer services avec localisation
    const servicesWithLocation = services.filter(
        (s) => s.location?.lat && s.location?.lng
    );

    const selected = servicesWithLocation.find((s) => s.id === selectedService);

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Carte Interactive</h3>
                        <p className="text-xs text-white/80">
                            {servicesWithLocation.length} services à proximité
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative" style={{ height }}>
                {/* Placeholder for Google Maps - In production, use @react-google-maps/api */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="text-center p-8">
                        <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium mb-2">
                            Carte Google Maps Interactive
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm">
                            En production, cette zone affichera une vraie carte Google Maps avec
                            marqueurs interactifs et navigation en temps réel.
                        </p>
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                            Ajoutez NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans .env.local
                        </p>
                    </div>
                </div>

                {/* User Location Marker (simulated) */}
                {userLocation && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="relative">
                            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                                Vous êtes ici
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Services List */}
            <div className="p-4 max-h-64 overflow-y-auto">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Services disponibles
                </p>
                <div className="space-y-2">
                    {servicesWithLocation.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => setSelectedService(service.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedService === service.id
                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                    : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <h4 className="font-bold text-sm text-slate-900">
                                            {service.name}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {service.location?.address || "Abidjan"}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    {service.estimated_wait_time !== undefined && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            <span className="font-bold text-slate-700">
                                                {service.estimated_wait_time} min
                                            </span>
                                        </div>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${service.location?.lat},${service.location?.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <Navigation className="w-3 h-3" />
                                        Itinéraire
                                    </a>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Service Details */}
            {selected && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Service sélectionné
                            </p>
                            <p className="font-bold text-slate-900">{selected.name}</p>
                            <p className="text-sm text-slate-600 mt-1">
                                {selected.location?.address}
                            </p>
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.location?.lat},${selected.location?.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-bold shadow-lg"
                        >
                            <Navigation className="w-4 h-4" />
                            Y aller
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
