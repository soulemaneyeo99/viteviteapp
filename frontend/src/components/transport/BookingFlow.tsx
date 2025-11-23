'use client';

import { useState } from 'react';
import { CheckCircle, CreditCard, User, Armchair, X } from 'lucide-react';
import { transportAPI } from '@/lib/api';
import { toast } from 'sonner';

interface BookingFlowProps {
    departure: any;
    onClose: () => void;
}

export default function BookingFlow({ departure, onClose }: BookingFlowProps) {
    const [step, setStep] = useState(1);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [passenger, setPassenger] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [qrCode, setQrCode] = useState('');

    // Simulation des sièges (4 rangées de 4)
    const seats = Array.from({ length: 16 }, (_, i) => ({
        id: `${i + 1}`,
        status: Math.random() > 0.7 ? 'occupied' : 'available' // Simulation places occupées
    }));

    const handleBooking = async () => {
        if (!selectedSeat || !passenger.name || !passenger.phone) return;

        setLoading(true);
        try {
            const response = await transportAPI.createBooking({
                departure_id: departure.id,
                passenger_name: passenger.name,
                passenger_phone: passenger.phone,
                seat_number: selectedSeat
            });
            setQrCode(response.data.qr_code);
            setSuccess(true);
            toast.success('Réservation confirmée !');
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Erreur lors de la réservation');
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
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Bon voyage !</h2>
                    <p className="text-slate-600 mb-6">
                        Votre place <span className="font-bold text-slate-800">#{selectedSeat}</span> est réservée.
                        Présentez ce code à l'embarquement.
                    </p>

                    <div className="bg-slate-100 p-4 rounded-xl mb-6 font-mono text-center tracking-widest font-bold text-slate-700 border-2 border-dashed border-slate-300">
                        {qrCode}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
                    <div>
                        <h2 className="font-bold text-lg text-slate-800">Réservation</h2>
                        <p className="text-xs text-slate-500">{departure.origin} → {departure.destination}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Steps */}
                <div className="flex border-b border-slate-100">
                    {['Siège', 'Passager', 'Paiement'].map((s, i) => (
                        <div
                            key={s}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${step >= i + 1 ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'
                                }`}
                        >
                            {s}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Step 1: Seat Selection */}
                    {step === 1 && (
                        <div className="text-center">
                            <p className="text-slate-500 mb-6">Choisissez votre place dans le car</p>

                            <div className="inline-grid grid-cols-4 gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                                {seats.map((seat) => (
                                    <button
                                        key={seat.id}
                                        disabled={seat.status === 'occupied'}
                                        onClick={() => setSelectedSeat(seat.id)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${seat.status === 'occupied'
                                                ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                                                : selectedSeat === seat.id
                                                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'
                                            }`}
                                    >
                                        {seat.status === 'occupied' ? 'X' : seat.id}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center gap-6 mt-6 text-xs font-medium text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-white border border-slate-300 rounded"></div> Libre
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-300 rounded"></div> Occupé
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-600 rounded"></div> Sélection
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Passenger Info */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={passenger.name}
                                        onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ex: Kouassi Jean"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-slate-400 font-bold text-sm">+225</span>
                                    <input
                                        type="tel"
                                        value={passenger.phone}
                                        onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                                        className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="07 07 07 07 07"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex justify-between mb-2 text-sm text-slate-600">
                                    <span>Billet {departure.car_type}</span>
                                    <span>{departure.price.toLocaleString()} F</span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm text-slate-600">
                                    <span>Siège</span>
                                    <span>#{selectedSeat}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-slate-200 mt-2">
                                    <span>Total</span>
                                    <span>{departure.price.toLocaleString()} F</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Payer avec</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Orange Money', 'MTN Money', 'Moov Money', 'Wave'].map((method) => (
                                        <button
                                            key={method}
                                            className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-sm font-medium"
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
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
                        onClick={() => {
                            if (step === 1 && !selectedSeat) return;
                            if (step === 2 && (!passenger.name || !passenger.phone)) return;
                            step < 3 ? setStep(step + 1) : handleBooking();
                        }}
                        disabled={loading || (step === 1 && !selectedSeat)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Traitement...' : step < 3 ? 'Suivant' : 'Payer et Réserver'}
                    </button>
                </div>
            </div>
        </div>
    );
}
