'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import type { Reservation } from '@/types';
import { ArrowLeft, Search, Calendar, Clock, Users, Store, Phone } from 'lucide-react';

export default function AdminReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/reservations');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchReservations();
    }
  }, [isAuthenticated, user, dateFilter, statusFilter]);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const params: { date?: string; status?: string } = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await adminApi.getReservations(params);
      setReservations(response.results);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      confirmed: 'bg-green-50 text-green-600 border-green-200',
      canceled: 'bg-red-50 text-red-600 border-red-200',
      completed: 'bg-blue-50 text-blue-600 border-blue-200',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      canceled: 'Bekor qilingan',
      completed: 'Yakunlangan',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bronlar</h1>
              <p className="text-gray-500">Barcha bronlarni ko'rish</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Barchasi' },
                { value: 'pending', label: 'Kutilmoqda' },
                { value: 'confirmed', label: 'Tasdiqlangan' },
                { value: 'canceled', label: 'Bekor qilingan' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                    statusFilter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-black/5 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bronlar topilmadi</h3>
            <p className="text-gray-500">Tanlangan sanada bronlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{reservation.user_name || 'Noma\'lum'}</h3>
                      {getStatusBadge(reservation.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Store className="w-4 h-4" />
                        <span>{reservation.restaurant_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(reservation.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{reservation.time?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{reservation.guest_count} kishi</span>
                      </div>
                    </div>
                    {(reservation.user_phone || reservation.phone) && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                        <Phone className="w-4 h-4" />
                        <span>{reservation.user_phone || reservation.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    #{reservation.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
