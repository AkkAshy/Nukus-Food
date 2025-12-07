'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { ownerApi } from '@/lib/api';
import type { OwnerReservation } from '@/types';
import {
  ArrowLeft, Calendar, Users, Building2, Phone, Clock,
  CheckCircle, XCircle, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

const statusFilters = [
  { value: '', label: 'Hammasi' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'confirmed', label: 'Tasdiqlangan' },
  { value: 'completed', label: 'Yakunlangan' },
  { value: 'canceled', label: 'Bekor qilingan' },
  { value: 'no_show', label: 'Kelmadi' },
];

export default function OwnerReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [reservations, setReservations] = useState<OwnerReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/owner/reservations');
      } else if (user?.role !== 'owner' && user?.role !== 'admin') {
        router.push('/');
      } else {
        loadReservations();
      }
    }
  }, [authLoading, isAuthenticated, user, router, selectedDate, statusFilter]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const params: { date?: string; status?: string } = {};
      if (selectedDate) params.date = selectedDate;
      if (statusFilter) params.status = statusFilter;

      const data = await ownerApi.getReservations(params);
      setReservations(data.results as OwnerReservation[]);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await ownerApi.updateReservation(id, { status });
      loadReservations();
    } catch (err) {
      console.error('Failed to update reservation:', err);
    }
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Kutilmoqda</span>;
      case 'confirmed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Tasdiqlangan</span>;
      case 'canceled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Bekor qilingan</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Yakunlangan</span>;
      case 'no_show':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Kelmadi</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Bugun';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Ertaga';
    }
    return date.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/owner" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bronlar</h1>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-lg">{formatDate(selectedDate)}</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-black/5 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bronlar topilmadi</h3>
            <p className="text-gray-500">Bu sana uchun bronlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Time and Status */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-xl font-bold text-gray-900">
                          {reservation.time_from.slice(0, 5)}
                        </span>
                        {reservation.time_to && (
                          <span className="text-gray-400">
                            - {reservation.time_to.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    {/* Guest Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        {reservation.guest_count} kishi
                      </span>
                      {reservation.place_name && (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {reservation.place_name}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-medium text-gray-900">{reservation.user_name}</span>
                      <a
                        href={`tel:${reservation.user_phone}`}
                        className="text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5 text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        {reservation.user_phone}
                      </a>
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
                        {reservation.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'canceled')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Bekor qilish
                        </button>
                      </>
                    )}

                    {reservation.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'completed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Yakunlash
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'no_show')}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Kelmadi
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'canceled')}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Bekor qilish
                        </button>
                      </>
                    )}
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
