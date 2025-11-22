'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Service } from '@/types';
import L from 'leaflet';
import { ExternalLink, Clock, Users } from 'lucide-react';

// Fix Leaflet default icon issue
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function ServiceMap({ services }: { services: Service[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-[400px] w-full bg-slate-100 rounded-3xl animate-pulse"></div>;
    }

    // Centre par défaut sur Abidjan
    const center: [number, number] = [5.3364, -4.0267];

    return (
        <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 z-0 relative">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {services.map((service) => (
                    service.location && (
                        <Marker
                            key={service.id}
                            position={[service.location.lat, service.location.lng]}
                            icon={icon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[200px]">
                                    <h3 className="font-bold text-slate-900 mb-1">{service.name}</h3>
                                    <p className="text-xs text-slate-500 mb-2">{service.location.address}</p>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                            <Users className="w-3 h-3" />
                                            {service.current_queue_size} pers.
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                            <Clock className="w-3 h-3" />
                                            {service.estimated_wait_time} min
                                        </div>
                                    </div>

                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${service.location.lat},${service.location.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        Itinéraire
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}
