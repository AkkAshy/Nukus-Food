'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { reservationsApi } from '@/lib/api';
import type { Reservation } from '@/types';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function ReservationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/cabinet/reservations');
    } else if (isAuthenticated) {
      loadReservations();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadReservations = async () => {
    try {
      const response = await reservationsApi.getMyReservations();
      setReservations(response.results);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bronni bekor qilishni xohlaysizmi?')) return;

    try {
      await reservationsApi.cancel(id);
      loadReservations();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('Bronni bekor qilishda xatolik');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cabinet" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mening bronlarim</h1>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bronlar yo'q</h3>
            <p className="text-gray-500 mb-4">Siz hali birorta joy band qilmagansiz</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Joy topish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{reservation.restaurant_name}</h3>
                    {reservation.place_name && (
                      <p className="text-gray-500">{reservation.place_name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                    {reservation.status_display}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Sana</span>
                    <p className="font-medium">{new Date(reservation.date).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Vaqt</span>
                    <p className="font-medium">{reservation.time_from.slice(0, 5)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Mehmonlar</span>
                    <p className="font-medium">{reservation.guest_count} kishi</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Yaratilgan</span>
                    <p className="font-medium">{new Date(reservation.created_at).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>

                {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Bekor qilish
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
