'use client';

import { useState } from 'react';
import { ShoppingBag, Truck, Store, CreditCard, CheckCircle, Clock, MapPin, ChevronRight, AlertTriangle } from 'lucide-react';
import { pharmacyAPI } from '@/lib/api';
import { toast } from 'sonner';

interface OrderFlowProps {
    medicine: {
        id: number;
        name: string;
        price: number;
        dosage: string;
    };
    pharmacyId: number;
    onClose: () => void;
}

export default function OrderFlow({ medicine, pharmacyId, onClose }: OrderFlowProps) {
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
    const [paymentMethod, setPaymentMethod] = useState('mobile_money');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const total = medicine.price * quantity;

    const handleOrder = async () => {
        setLoading(true);
        try {
            await pharmacyAPI.createOrder({
                pharmacy_id: pharmacyId,
                items: [{ medicine_id: medicine.id, quantity }],
                type: orderType,
                payment_method: paymentMethod
            });
            setSuccess(true);
            toast.success('Commande effectuée avec succès !');
        } catch (error) {
            console.error('Order error:', error);
            toast.error('Erreur lors de la commande');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Commande Confirmée !</h2>
                    <p className="text-slate-600 mb-8">
                        Votre commande a été transmise à la pharmacie. Vous recevrez une notification dès qu'elle sera prête.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                        Terminer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                        Commander un médicament
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">Fermer</button>
                </div>

                {/* Steps Indicator */}
                <div className="flex border-b border-slate-100">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${step >= s ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                                }`}
                        >
                            Étape {s}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Step 1: Quantity */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{medicine.name}</h3>
                                    <p className="text-sm text-slate-500">{medicine.dosage}</p>
                                    <p className="font-bold text-emerald-600 mt-1">{medicine.price.toLocaleString()} FCFA</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Quantité</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl font-bold hover:bg-slate-50"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl font-bold hover:bg-slate-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">
                                    Commande préparée en moyenne sous <span className="font-bold">15 minutes</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Delivery Method */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Mode de récupération</label>

                            <button
                                onClick={() => setOrderType('pickup')}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${orderType === 'pickup'
                                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                        : 'border-slate-200 hover:border-emerald-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${orderType === 'pickup' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <Store className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Retrait en pharmacie</div>
                                    <div className="text-sm text-slate-500">Gratuit • Prêt dans 15 min</div>
                                </div>
                                {orderType === 'pickup' && <CheckCircle className="w-5 h-5 text-emerald-600 ml-auto" />}
                            </button>

                            <button
                                onClick={() => setOrderType('delivery')}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${orderType === 'delivery'
                                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                        : 'border-slate-200 hover:border-emerald-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${orderType === 'delivery' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Livraison à domicile</div>
                                    <div className="text-sm text-slate-500">+ 1,500 FCFA • ~45 min</div>
                                </div>
                                {orderType === 'delivery' && <CheckCircle className="w-5 h-5 text-emerald-600 ml-auto" />}
                            </button>

                            {orderType === 'delivery' && (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Adresse de livraison</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Votre quartier, repère..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex justify-between mb-2 text-sm text-slate-600">
                                    <span>Sous-total</span>
                                    <span>{total.toLocaleString()} FCFA</span>
                                </div>
                                {orderType === 'delivery' && (
                                    <div className="flex justify-between mb-2 text-sm text-slate-600">
                                        <span>Livraison</span>
                                        <span>1,500 FCFA</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-slate-200 mt-2">
                                    <span>Total à payer</span>
                                    <span>{(total + (orderType === 'delivery' ? 1500 : 0)).toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Moyen de paiement</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['mobile_money', 'card', 'cash'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === method
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {method === 'mobile_money' && 'Mobile Money'}
                                            {method === 'card' && 'Carte Bancaire'}
                                            {method === 'cash' && 'Espèces'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 text-xs text-amber-800">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <p>En confirmant, vous vous engagez à récupérer ou payer cette commande.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-slate-500 font-medium hover:text-slate-800 px-4 py-2"
                        >
                            Retour
                        </button>
                    ) : (
                        <div></div>
                    )}

                    <button
                        onClick={() => step < 3 ? setStep(step + 1) : handleOrder()}
                        disabled={loading}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            'Traitement...'
                        ) : step < 3 ? (
                            <>
                                Suivant <ChevronRight className="w-4 h-4" />
                            </>
                        ) : (
                            `Payer ${(total + (orderType === 'delivery' ? 1500 : 0)).toLocaleString()} FCFA`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
