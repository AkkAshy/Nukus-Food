'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, ChevronRight } from 'lucide-react';

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.totalPrice());
  const totalQty = useCartStore((s) => s.totalQuantity());

  // Group by restaurant for UI
  const byRestaurant: Record<string, typeof items> = {};
  items.forEach((it) => {
    const key = String(it.restaurant_id);
    (byRestaurant[key] ??= []).push(it);
  });

  const deliveryFee = items.length > 0 ? 15000 : 0;
  const grandTotal = total + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              Savatcha
            </h1>
            <p className="text-sm text-gray-500">{totalQty} ta taom</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => clear()}
              className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-black/5 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-orange-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Savatcha boʻsh</h2>
            <p className="text-gray-500 mb-6">Restoran tanlang va taom qoʻshing</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              Restoranlarni koʻrish
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byRestaurant).map(([rid, group]) => (
              <div key={rid} className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <Link
                    href={`/place/${group[0].restaurant_slug}`}
                    className="text-sm font-medium text-gray-700 hover:text-orange-600"
                  >
                    {group[0].restaurant_name}
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.map((it) => (
                    <div key={it.menu_item_id} className="flex items-center gap-3 p-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {it.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{it.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatPrice(it.price)} soʻm
                          {it.weight ? ` · ${it.weight}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setQty(it.menu_item_id, it.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-7 text-center font-medium">{it.quantity}</span>
                        <button
                          onClick={() => setQty(it.menu_item_id, it.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 text-orange-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(it.menu_item_id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taomlar uchun</span>
                <span>{formatPrice(total)} soʻm</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Yetkazib berish</span>
                <span>{formatPrice(deliveryFee)} soʻm</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-100">
                <span className="text-gray-900">Jami</span>
                <span className="text-orange-600">{formatPrice(grandTotal)} soʻm</span>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-3 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 transition-all"
              >
                Buyurtma rasmiylashtirish
              </button>
            </div>

            <p className="text-xs text-center text-gray-400 mt-2">
              ⚠️ Demo rejim: haqiqiy toʻlov amalga oshmaydi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
