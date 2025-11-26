'use client';

import Link from 'next/link';
import { Bus, MapPin, ArrowRight, Clock, Users, ShieldCheck } from 'lucide-react';

export default function TransportPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-gray-900 text-white pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Transport & Mobilité</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Voyagez en toute sérénité. Réservez vos tickets de car ou consultez les horaires SOTRA en temps réel.
                    </p>
                </div>
            </div>

            {/* Main Categories */}
            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cars Interurbains */}
                    <Link
                        href="/transport/interurban"
                        className="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:border-yellow-300 transition-all hover:-translate-y-1"
                    >
                        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Bus className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                            Cars Interurbains
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Voyages vers l'intérieur du pays. Comparez les compagnies, choisissez votre siège et réservez en ligne.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-gray-600">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <span>Compagnies vérifiées (UTB, STIF...)</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <MapPin className="w-5 h-5 text-green-500" />
                                <span>Toutes destinations (Bouaké, Korhogo...)</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <Clock className="w-5 h-5 text-green-500" />
                                <span>Horaires et places en temps réel</span>
                            </li>
                        </ul>
                        <div className="flex items-center text-yellow-600 font-bold group-hover:gap-2 transition-all">
                            Réserver un billet <ArrowRight className="w-5 h-5 ml-1" />
                        </div>
                    </Link>

                    {/* SOTRA */}
                    <Link
                        href="/transport/sotra"
                        className="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:border-yellow-300 transition-all hover:-translate-y-1"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-gray-900" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                            SOTRA & Urbain
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Déplacez-vous malin à Abidjan. Suivez les bus en temps réel et évitez les arrêts bondés.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-gray-600">
                                <Clock className="w-5 h-5 text-yellow-500" />
                                <span>Temps d'attente précis</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <MapPin className="w-5 h-5 text-yellow-500" />
                                <span>Position des bus sur la carte</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <Users className="w-5 h-5 text-yellow-500" />
                                <span>Niveau d'affluence estimé</span>
                            </li>
                        </ul>
                        <div className="flex items-center text-gray-900 font-bold group-hover:gap-2 transition-all">
                            Voir les lignes <ArrowRight className="w-5 h-5 ml-1" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-6xl mx-auto px-4 mt-16">
                <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Pourquoi utiliser ViteVite Transport ?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4 text-2xl">🎫</div>
                        <h4 className="font-bold text-gray-900 mb-2">Zéro Attente</h4>
                        <p className="text-sm text-gray-500">Plus besoin de faire la queue en gare. Votre place est garantie.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4 text-2xl">📱</div>
                        <h4 className="font-bold text-gray-900 mb-2">100% Mobile</h4>
                        <p className="text-sm text-gray-500">Payez par Mobile Money et recevez votre ticket QR Code instantanément.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4 text-2xl">🔔</div>
                        <h4 className="font-bold text-gray-900 mb-2">Alertes Smart</h4>
                        <p className="text-sm text-gray-500">Soyez notifié des retards, embouteillages et de l'arrivée de votre bus.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
