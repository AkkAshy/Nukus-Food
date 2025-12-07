'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { ownerApi } from '@/lib/api';
import type { Restaurant, OwnerStats, OwnerReservation } from '@/types';
import {
  Store, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, ChevronRight, Settings, Building2, BarChart3, Phone, FileText
} from 'lucide-react';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [todayReservations, setTodayReservations] = useState<OwnerReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/owner');
      } else if (user?.role !== 'owner' && user?.role !== 'admin') {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [restaurantData, statsData, reservationsData] = await Promise.all([
        ownerApi.getMyRestaurant(),
        ownerApi.getStats(),
        ownerApi.getReservations({ date: new Date().toISOString().split('T')[0] }),
      ]);
      setRestaurant(restaurantData);
      setStats(statsData);
      setTodayReservations(reservationsData.results as OwnerReservation[]);
    } catch (err) {
      console.error('Failed to load owner data:', err);
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await ownerApi.updateReservation(id, { status });
      loadData();
    } catch (err) {
      console.error('Failed to update reservation:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Kutilmoqda</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Tasdiqlangan</span>;
      case 'canceled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Bekor qilingan</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Yakunlangan</span>;
      case 'no_show':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Kelmadi</span>;
      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Xatolik</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Boshqaruv paneli
            </h1>
            {restaurant && (
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Store className="w-4 h-4" />
                {restaurant.name}
              </p>
            )}
          </div>
          <Link
            href="/owner/settings"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="hidden sm:inline">Sozlamalar</span>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Bugun</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.today.total}</p>
              <p className="text-sm text-gray-500 mt-1">bronlar</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">Kutilmoqda</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.today.pending}</p>
              <p className="text-sm text-gray-500 mt-1">tasdiqlash kerak</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Tasdiqlangan</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.today.confirmed}</p>
              <p className="text-sm text-gray-500 mt-1">bugun</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Bu oy</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.month.total}</p>
              <p className="text-sm text-gray-500 mt-1">jami bronlar</p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/owner/reservations"
            className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bronlar</h3>
                  <p className="text-sm text-gray-500">Barcha bronlarni ko'rish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/owner/places"
            className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Joylar</h3>
                  <p className="text-sm text-gray-500">Stollar va kabinkalar</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/owner/about"
            className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Biz haqimizda</h3>
                  <p className="text-sm text-gray-500">Tavsif va rasmlar</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/owner/settings"
            className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sozlamalar</h3>
                  <p className="text-sm text-gray-500">Joy ma'lumotlari</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Today's Reservations */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Bugungi bronlar
            </h2>
            <Link
              href="/owner/reservations"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Hammasini ko'rish
            </Link>
          </div>

          {todayReservations.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bronlar yo'q</h3>
              <p className="text-gray-500">Bugun hali bron qilinmagan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayReservations.map((reservation) => (
                <div key={reservation.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {reservation.time_from.slice(0, 5)}
                        </span>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {reservation.guest_count} kishi
                        </span>
                        {reservation.place_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {reservation.place_name}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-gray-900">{reservation.user_name}</span>
                        <a
                          href={`tel:${reservation.user_phone}`}
                          className="ml-3 text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {reservation.user_phone}
                        </a>
                      </div>
                      {reservation.notes && (
                        <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                          {reservation.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {reservation.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Tasdiqlash"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'canceled')}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Bekor qilish"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {reservation.status === 'confirmed' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'completed')}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Yakunlash
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'no_show')}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Kelmadi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Month Stats */}
        {stats && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4">Bu oylik statistika</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{stats.month.total}</p>
                <p className="text-sm text-gray-500">Jami bronlar</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{stats.month.completed}</p>
                <p className="text-sm text-gray-500">Yakunlangan</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{stats.month.canceled}</p>
                <p className="text-sm text-gray-500">Bekor qilingan</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-600">{stats.month.no_show}</p>
                <p className="text-sm text-gray-500">Kelmagan</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
