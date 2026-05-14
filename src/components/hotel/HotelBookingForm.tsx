'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hotelBookingsApi, hotelsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { Hotel, HotelAvailability, HotelAvailabilityRoom } from '@/types';
import { Calendar, Users, MessageSquare, CheckCircle2, AlertCircle, Loader2, BedDouble } from 'lucide-react';

interface Props {
  hotel: Hotel;
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export default function HotelBookingForm({ hotel }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(tomorrowISO());
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [availability, setAvailability] = useState<HotelAvailability | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nights = useMemo(() => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  useEffect(() => {
    setSelectedRoomId(null);
    if (!checkIn || !checkOut || nights <= 0) {
      setAvailability(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoadingAvail(true);
        setError(null);
        const data = await hotelsApi.getAvailability(hotel.slug, checkIn, checkOut, guests);
        if (!cancelled) setAvailability(data);
      } catch {
        if (!cancelled) setError('Не удалось загрузить доступность номеров.');
      } finally {
        if (!cancelled) setLoadingAvail(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [hotel.slug, checkIn, checkOut, guests, nights]);

  const selectedRoom = useMemo<HotelAvailabilityRoom | null>(() => {
    if (!selectedRoomId || !availability) return null;
    return availability.rooms.find((r) => r.id === selectedRoomId) ?? null;
  }, [selectedRoomId, availability]);

  const totalPrice = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const submit = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?next=/hotel/${hotel.slug}`);
      return;
    }
    if (!selectedRoomId) {
      setError('Выберите номер.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await hotelBookingsApi.create({
        hotel: hotel.id,
        room: selectedRoomId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guest_count: guests,
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (e) {
      const err = e as { response?: { data?: Record<string, string[] | string> } };
      const data = err.response?.data;
      const message =
        (typeof data === 'object' && data
          ? Object.values(data)
              .map((v) => (Array.isArray(v) ? v.join(', ') : String(v)))
              .join('; ')
          : null) ?? 'Не удалось создать бронь.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 lg:p-8">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Заявка отправлена!</h3>
          <p className="text-gray-500">
            {hotel.reservation_mode === 'auto'
              ? 'Бронь автоматически подтверждена.'
              : 'Отель свяжется с вами для подтверждения.'}
          </p>
          <button
            onClick={() => router.push('/cabinet/reservations')}
            className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors"
          >
            Мои брони
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 lg:p-8 space-y-5">
      <h3 className="text-lg font-semibold text-gray-900">Забронировать номер</h3>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> Заезд
          </span>
          <input
            type="date"
            value={checkIn}
            min={todayISO()}
            onChange={(e) => {
              const v = e.target.value;
              setCheckIn(v);
              if (v >= checkOut) {
                const next = new Date(v);
                next.setDate(next.getDate() + 1);
                setCheckOut(next.toISOString().slice(0, 10));
              }
            }}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> Выезд
          </span>
          <input
            type="date"
            value={checkOut}
            min={(() => {
              const d = new Date(checkIn);
              d.setDate(d.getDate() + 1);
              return d.toISOString().slice(0, 10);
            })()}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </label>
      </div>

      {/* Guests */}
      <label className="block">
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Users className="w-3.5 h-3.5" /> Гостей
        </span>
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </label>

      {/* Rooms */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Доступные номера</p>
        {loadingAvail ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Проверяем доступность...
          </div>
        ) : !availability || availability.rooms.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Нет подходящих номеров.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {availability.rooms.map((room) => {
              const disabled = !room.available;
              const selected = selectedRoomId === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected
                      ? 'border-teal-500 bg-teal-50'
                      : disabled
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-teal-500" /> {room.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        до {room.capacity} {room.capacity === 1 ? 'гостя' : 'гостей'}
                        {disabled ? ' · занят на эти даты' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-teal-600">{formatPrice(room.price_per_night)}</p>
                      <p className="text-xs text-gray-400">сум / ночь</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <label className="block">
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Особые пожелания
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Поздний заезд, детская кроватка..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </label>

      {/* Total */}
      {selectedRoom && nights > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              {formatPrice(selectedRoom.price_per_night)} × {nights} {nights === 1 ? 'ночь' : 'ночей'}
            </span>
            <span>{formatPrice(totalPrice)} сум</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-teal-100 mt-2">
            <span>Итого</span>
            <span className="text-teal-700">{formatPrice(totalPrice)} сум</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        disabled={submitting || !selectedRoomId || nights <= 0}
        onClick={submit}
        className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-teal-500/30 transition-all"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
          </span>
        ) : isAuthenticated ? (
          'Забронировать'
        ) : (
          'Войти и забронировать'
        )}
      </button>
    </div>
  );
}
