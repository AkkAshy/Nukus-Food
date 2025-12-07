'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reservationsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { Restaurant, Place, PlaceAvailability } from '@/types';
import { Check, Calendar, Minus, Plus, Clock, AlertCircle, LogIn } from 'lucide-react';

interface BookingFormProps {
  restaurant: Restaurant;
  places: Place[];
}

export default function BookingForm({ restaurant, places }: BookingFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [date, setDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const [availability, setAvailability] = useState<PlaceAvailability[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (date && guestCount) {
      loadAvailability();
    }
  }, [date, guestCount]);

  const loadAvailability = async () => {
    try {
      setIsLoadingSlots(true);
      setError('');
      const response = await reservationsApi.getAvailability(
        restaurant.slug,
        date,
        guestCount
      );

      if (response.is_closed) {
        setError('Bu kunda joy yopiq');
        setAvailability([]);
      } else {
        setAvailability(response.places);
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
      setError('Vaqtlarni yuklashda xatolik');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/place/${restaurant.slug}`));
      return;
    }

    if (!date || !selectedTime) {
      setError('Sana va vaqtni tanlang');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await reservationsApi.create({
        restaurant: restaurant.id,
        place: selectedPlace || undefined,
        date,
        time_from: selectedTime,
        guest_count: guestCount,
        notes,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/cabinet/reservations');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string | string[]> } };
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat();
        setError(messages.join('. '));
      } else {
        setError('Bron qilishda xatolik yuz berdi');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="font-bold text-xl text-green-800">Bron qilindi!</h3>
        <p className="text-green-600 mt-2">Tez orada bronlaringizga o'tasiz...</p>
        <div className="mt-4">
          <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Stol band qilish</h2>
          <p className="text-sm text-gray-500">Tez va oson</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sana tanlang
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedTime('');
                setSelectedPlace(null);
              }}
              min={today}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50 hover:bg-white"
              required
            />
          </div>
        </div>

        {/* Guest count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mehmonlar soni
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <Minus className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-gray-900">{guestCount}</span>
              <span className="text-gray-500 ml-2">kishi</span>
            </div>
            <button
              type="button"
              onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Time slots */}
        {date && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaqt va joy
            </label>

            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Vaqtlar tekshirilmoqda...</span>
                </div>
              </div>
            ) : availability.length > 0 ? (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {availability.map((place) => (
                  <div
                    key={place.id}
                    className={`border rounded-xl p-4 transition-all ${
                      selectedPlace === place.id
                        ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-500/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{place.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          {place.capacity} kishi
                        </span>
                      </div>
                      {selectedPlace === place.id && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                          Tanlandi
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {place.slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => {
                            setSelectedPlace(place.id);
                            setSelectedTime(slot.time);
                          }}
                          className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                            selectedPlace === place.id && selectedTime === slot.time
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                              : slot.available
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {slot.time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !error ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Bu kunga mos joy topilmadi</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Izoh (ixtiyoriy)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Maxsus so'rovlar, allergiyalar yoki boshqa ma'lumotlar..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50 hover:bg-white resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !date || !selectedTime}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Yuborilmoqda...
            </span>
          ) : isAuthenticated ? (
            <span className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Band qilish
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Kirish va band qilish
            </span>
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-sm text-gray-500">
            Akkauntingiz yo'qmi?{' '}
            <a href="/auth/register" className="text-orange-600 hover:text-orange-700 font-medium">
              Ro'yxatdan o'ting
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
