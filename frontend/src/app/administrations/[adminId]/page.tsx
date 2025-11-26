'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { administrationsAPI } from '@/lib/api';
import {
    MapPin, Clock, Users, Phone, Mail, Globe, Building2, ArrowRight,
    Navigation, CheckCircle, AlertCircle, Sparkles, Activity, FileText, DollarSign,
    TrendingUp, Calendar
} from 'lucide-react';
import Link from 'next/link';
import AffluenceChart from '@/components/charts/AffluenceChart';

export default function AdministrationDetailPage() {
    const params = useParams();
    const administrationId = params.adminId as string;

    const { data: adminData, isLoading: adminLoading } = useQuery({
        queryKey: ['administration', administrationId],
        queryFn: async () => {
            const response = await administrationsAPI.getById(administrationId);
            return response.data;
        },
    });

    const { data: queueData, isLoading: queueLoading } = useQuery({
        queryKey: ['administration-queue', administrationId],
        queryFn: async () => {
            const response = await administrationsAPI.getQueueStatus(administrationId);
            return response.data;
        },
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    if (adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    const administration = adminData?.administration;
    const services = adminData?.services || [];
    const queueDetails = queueData?.queue_details || [];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-32 pb-16 px-6 overflow-hidden">
                {/* Background Image */}
                {administration?.main_image_url && (
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src={administration.main_image_url}
                            alt={administration.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90"></div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-300 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span>/</span>
                        <Link href="/administrations" className="hover:text-white transition-colors">Administrations</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{administration?.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            {/* Type Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-4 backdrop-blur-sm">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-white/90 uppercase tracking-wide">{administration?.type}</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                {administration?.name}
                            </h1>

                            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
                                {administration?.description}
                            </p>

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-4">
                                {/* Specific Number for AI Competition */}
                                <a
                                    href="tel:0778280515"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark border border-primary rounded-xl transition-colors shadow-lg shadow-primary/20"
                                >
                                    <Phone className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">07 78 28 05 15</span>
                                </a>

                                {administration?.website && (
                                    <a
                                        href={administration.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors backdrop-blur-sm"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm font-medium">Site web</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 min-w-[280px]">
                            <div className="flex items-center gap-3 mb-4">
                                {administration?.is_open ? (
                                    <>
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-lg font-bold">Ouvert maintenant</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <span className="text-lg font-bold">Fermé</span>
                                    </>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-white/10">
                                    <span className="text-sm text-slate-300">File d'attente</span>
                                    <span className="text-xl font-black">{administration?.total_queue_size}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/10">
                                    <span className="text-sm text-slate-300">Temps d'attente</span>
                                    <span className="text-xl font-black">{administration?.average_wait_time}min</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-300">Guichets actifs</span>
                                    <span className="text-xl font-black">{administration?.total_active_counters}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">

                {/* AI Insights Section - NEW */}
                <div className="bg-white rounded-3xl shadow-xl border border-primary-100 p-8 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Intelligence Artificielle</h2>
                            <p className="text-sm text-gray-500">Prédictions et recommandations en temps réel</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {/* Prediction 1: Best Time */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-primary-700 font-bold text-sm uppercase tracking-wide">
                                <Clock className="w-4 h-4" />
                                Meilleur créneau
                            </div>
                            <div className="text-2xl font-black text-gray-900 mb-1">Demain 09:00</div>
                            <p className="text-xs text-gray-500">Affluence estimée : <span className="text-green-600 font-bold">Faible</span></p>
                        </div>

                        {/* Prediction 2: Forecast */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-primary-700 font-bold text-sm uppercase tracking-wide">
                                <TrendingUp className="w-4 h-4" />
                                Prévision (1h)
                            </div>
                            <div className="text-2xl font-black text-gray-900 mb-1">+15%</div>
                            <p className="text-xs text-gray-500">L'affluence va augmenter</p>
                        </div>

                        {/* Prediction 3: Recommendation */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 text-primary-700 font-bold text-sm uppercase tracking-wide">
                                <Calendar className="w-4 h-4" />
                                Recommandation
                            </div>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                Évitez de venir entre 12h et 14h. Privilégiez les matinées pour vos démarches administratives.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Global Affluence Chart - NEW */}
                <div className="mb-8">
                    <AffluenceChart
                        type="global"
                        title="Affluence Globale"
                        subtitle="Moyenne de tous les services de l'administration"
                    />
                </div>

                {/* Services Section */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Services disponibles</h2>
                            <p className="text-gray-500">Sélectionnez le service dont vous avez besoin</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl">
                            <Activity className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold text-primary-900">{services.length} services</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service: any) => {
                            const queueInfo = queueDetails.find((q: any) => q.service_id === service.id);

                            return (
                                <Link
                                    key={service.id}
                                    href={`/administrations/${administrationId}/services/${service.id}`}
                                    className="group bg-gray-50 hover:bg-primary-50 rounded-2xl p-6 border-2 border-transparent hover:border-primary-200 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 mb-1 transition-colors">
                                                {service.name}
                                            </h3>
                                            {service.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                                            )}
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ml-3 ${service.status === 'ouvert' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${service.status === 'ouvert' ? 'bg-green-500' : 'bg-red-500'
                                                }`}></span>
                                            {service.status === 'ouvert' ? 'Ouvert' : 'Fermé'}
                                        </span>
                                    </div>

                                    {/* Queue Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-white rounded-xl p-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-semibold uppercase">File</span>
                                            </div>
                                            <div className="text-lg font-black text-gray-900">{queueInfo?.queue_size || 0}</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-semibold uppercase">Attente</span>
                                            </div>
                                            <div className="text-lg font-black text-gray-900">{queueInfo?.wait_time || 0}min</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Activity className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-semibold uppercase">Guichets</span>
                                            </div>
                                            <div className="text-lg font-black text-gray-900">{queueInfo?.active_counters || 0}</div>
                                        </div>
                                    </div>

                                    {/* Documents & Fees */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            {service.required_documents?.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>{service.required_documents.length} docs</span>
                                                </div>
                                            )}
                                            {service.fees && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    <span>{service.fees.base} FCFA</span>
                                                </div>
                                            )}
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Location & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Location */}
                    {administration?.location && (
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-primary" />
                                Localisation
                            </h3>
                            <p className="text-gray-600 mb-4">{administration.location.address}</p>
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
                                <Navigation className="w-5 h-5" />
                                Obtenir l'itinéraire
                            </button>
                        </div>
                    )}

                    {/* Operating Hours */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary" />
                            Horaires d'ouverture
                        </h3>
                        {administration?.operating_hours ? (
                            <div className="space-y-2">
                                {Object.entries(administration.operating_hours).map(([day, hours]) => (
                                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                                        <span className="text-sm font-bold text-gray-900">{hours as string}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Horaires non disponibles</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
