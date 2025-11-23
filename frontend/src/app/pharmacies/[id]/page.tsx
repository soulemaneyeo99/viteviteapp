'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search, MapPin, Clock, Phone, ShoppingCart, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { pharmacyAPI } from '@/lib/api';
import Link from 'next/link';
import AIAlternatives from '@/components/pharmacy/AIAlternatives';

interface Medicine {
    id: number;
    name: string;
    dosage: string;
    category: string;
    requires_prescription: boolean;
}

interface Stock {
    id: number;
    quantity: number;
    price: number;
    status: 'available' | 'low' | 'out_of_stock';
    medicine: Medicine;
}

export default function PharmacyDetailPage() {
    const params = useParams();
    const [stock, setStock] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [orderingMedicine, setOrderingMedicine] = useState<any | null>(null);

    useEffect(() => {
        if (params.id) {
            loadStock();
        }
    }, [params.id, search, category]);

    const loadStock = async () => {
        setLoading(true);
        try {
            const queryParams: any = {};
            if (search) queryParams.search = search;
            if (category !== 'all') queryParams.category = category;

            const response = await pharmacyAPI.getStock(Number(params.id), queryParams);
            setStock(response.data);
        } catch (error) {
            console.error('Error loading stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'low': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'out_of_stock': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <CheckCircle className="w-4 h-4" />;
            case 'low': return <AlertTriangle className="w-4 h-4" />;
            case 'out_of_stock': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available': return 'Disponible';
            case 'low': return 'Stock Faible';
            case 'out_of_stock': return 'Rupture';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 pt-24 pb-6 px-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto">
                    <Link href="/pharmacies" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux pharmacies
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pharmacie Sainte-Marie</h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Cocody, Riviera 2</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Ouvert • Ferme à 20h00</span>
                                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> +225 07 07 07 07 07</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Panier (0)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Categories */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un médicament (ex: Doliprane, Amoxicilline)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm"
                        />
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                    >
                        <option value="all">Toutes catégories</option>
                        <option value="Antibiotique">Antibiotiques</option>
                        <option value="Antipaludéen">Antipaludéens</option>
                        <option value="Antalgique">Antalgiques</option>
                        <option value="Anti-inflammatoire">Anti-inflammatoires</option>
                    </select>
                </div>

                {/* Medicine List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Médicament</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Catégorie</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Prix</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Statut</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement des stocks...</td>
                                    </tr>
                                ) : stock.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucun médicament trouvé</td>
                                    </tr>
                                ) : (
                                    stock.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{item.medicine.name}</div>
                                                <div className="text-sm text-slate-500">{item.medicine.dosage}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                                                    {item.medicine.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                {item.price.toLocaleString()} FCFA
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                                                    {getStatusIcon(item.status)}
                                                    {getStatusText(item.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status === 'out_of_stock' ? (
                                                    <button
                                                        onClick={() => setSelectedMedicine(item.medicine)}
                                                        className="text-emerald-600 font-medium hover:underline text-sm flex items-center gap-1 justify-end ml-auto"
                                                    >
                                                        <Sparkles className="w-3 h-3" />
                                                        Voir alternatives IA
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setOrderingMedicine({
                                                            id: item.medicine.id,
                                                            name: item.medicine.name,
                                                            price: item.price,
                                                            dosage: item.medicine.dosage
                                                        })}
                                                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm hover:shadow"
                                                    >
                                                        Commander
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Alternatives Modal */}
                {selectedMedicine && (
                    <AIAlternatives
                        medicineName={selectedMedicine.name}
                        dosage={selectedMedicine.dosage}
                        onClose={() => setSelectedMedicine(null)}
                    />
                )}
            </div>
        </div>
    );
}
