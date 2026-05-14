'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Truck,
} from 'lucide-react';

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

type PaymentMethod = 'cash' | 'card' | 'payme' | 'click';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.totalPrice());
  const clear = useCartStore((s) => s.clear);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [name, setName] = useState(user?.full_name ?? '');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = items.length > 0 ? 15000 : 0;
  const grandTotal = total + deliveryFee;

  const submit = async () => {
    setError(null);
    if (items.length === 0) {
      setError('Savatcha boʻsh');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Ism, telefon va manzilni toʻldiring');
      return;
    }

    setSubmitting(true);
    // Mock payment delay
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSuccess(true);
    clear();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buyurtma qabul qilindi!</h1>
          <p className="text-gray-500 mb-6">
            Yetkazib berish 30-45 daqiqa ichida amalga oshiriladi.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            ⚠️ Demo rejim — bu test buyurtma, haqiqiy yetkazib berish amalga oshmaydi
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 transition-all"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Buyurtma rasmiylashtirish</h1>
        </div>

        <div className="space-y-4">
          {/* Delivery */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" /> Yetkazib berish
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ism *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aliyev Anvar"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Telefon *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Manzil *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nukus, Doʻstlik koʻchasi, 15"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Izoh</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Domofon, qavat, alohida soʻrovlar..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" /> Toʻlov usuli
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: 'cash', label: 'Naqd pul', emoji: '💵' },
                { v: 'card', label: 'Karta', emoji: '💳' },
                { v: 'payme', label: 'Payme', emoji: '🟢' },
                { v: 'click', label: 'Click', emoji: '🔵' },
              ] as { v: PaymentMethod; label: string; emoji: string }[]).map((m) => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setPayment(m.v)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    payment === m.v
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="font-medium text-sm text-gray-800">{m.label}</span>
                </button>
              ))}
            </div>
            {payment !== 'cash' && (
              <p className="text-xs text-gray-400 mt-3 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Demo: haqiqiy toʻlov soʻralmaydi
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Buyurtmangiz</h2>
            <ul className="divide-y divide-gray-100 mb-4">
              {items.map((it) => (
                <li key={it.menu_item_id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700">
                    {it.name} × {it.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(it.price * it.quantity)} soʻm
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Yetkazib berish</span>
              <span>{formatPrice(deliveryFee)} soʻm</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-3 mt-2 border-t border-gray-100">
              <span>Jami</span>
              <span className="text-orange-600">{formatPrice(grandTotal)} soʻm</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            disabled={submitting || items.length === 0}
            onClick={submit}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Toʻlov...
              </span>
            ) : (
              `Toʻlash · ${formatPrice(grandTotal)} soʻm`
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            ⚠️ Demo rejim: bu test sahifa, haqiqiy yetkazib berish amalga oshmaydi
          </p>
        </div>
      </div>
    </div>
  );
}
