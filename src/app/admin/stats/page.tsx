'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import type { Restaurant, Reservation } from '@/types';
import {
  ArrowLeft, Users, Store, Calendar, TrendingUp,
  BarChart3, Clock, MapPin, Activity
} from 'lucide-react';

interface AdminStats {
  users: {
    total: number;
    owners: number;
    admins: number;
  };
  restaurants: {
    total: number;
    active: number;
  };
  reservations: {
    total: number;
    today: number;
    pending: number;
  };
}

interface ReservationsByStatus {
  pending: number;
  confirmed: number;
  canceled: number;
  completed: number;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [reservationsByStatus, setReservationsByStatus] = useState<ReservationsByStatus>({
    pending: 0,
    confirmed: 0,
    canceled: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/stats');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [statsData, restaurantsData, reservationsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRestaurants(),
        adminApi.getReservations(),
      ]);

      setStats(statsData);
      setRestaurants(restaurantsData.results);
      setRecentReservations(reservationsData.results.slice(0, 10));

      // Calculate reservations by status
      const byStatus: ReservationsByStatus = {
        pending: 0,
        confirmed: 0,
        canceled: 0,
        completed: 0,
      };
      reservationsData.results.forEach((r: Reservation) => {
        if (r.status in byStatus) {
          byStatus[r.status as keyof ReservationsByStatus]++;
        }
      });
      setReservationsByStatus(byStatus);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-600',
      confirmed: 'bg-green-50 text-green-600',
      canceled: 'bg-red-50 text-red-600',
      completed: 'bg-blue-50 text-blue-600',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      canceled: 'Bekor qilingan',
      completed: 'Yakunlangan',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalReservations = reservationsByStatus.pending + reservationsByStatus.confirmed +
                           reservationsByStatus.canceled + reservationsByStatus.completed;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistika</h1>
              <p className="text-gray-500">Batafsil hisobotlar va tahlil</p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Foydalanuvchilar</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-gray-500">{stats.users.owners} owner</span>
                <span className="text-gray-500">{stats.users.admins} admin</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Restoranlar</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.restaurants.total}</p>
              <div className="mt-2 text-xs">
                <span className="text-green-600">{stats.restaurants.active} faol</span>
                <span className="text-gray-400 mx-1">·</span>
                <span className="text-gray-500">{stats.restaurants.total - stats.restaurants.active} nofaol</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Jami bronlar</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.reservations.total}</p>
              <div className="mt-2 text-xs">
                <span className="text-orange-600">{stats.reservations.today} bugun</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Kutilmoqda</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.reservations.pending}</p>
              <div className="mt-2 text-xs">
                <span className="text-yellow-600">Tasdiqlash kutilmoqda</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reservations by Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Bronlar holati
            </h2>
            <div className="space-y-4">
              {[
                { key: 'pending', label: 'Kutilmoqda', color: 'bg-yellow-500' },
                { key: 'confirmed', label: 'Tasdiqlangan', color: 'bg-green-500' },
                { key: 'canceled', label: 'Bekor qilingan', color: 'bg-red-500' },
                { key: 'completed', label: 'Yakunlangan', color: 'bg-blue-500' },
              ].map((item) => {
                const count = reservationsByStatus[item.key as keyof ReservationsByStatus];
                const percentage = totalReservations > 0 ? (count / totalReservations) * 100 : 0;
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restaurant Types */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Restoranlar turlari
            </h2>
            <div className="space-y-3">
              {(() => {
                const typeLabels: Record<string, string> = {
                  restaurant: 'Restoran',
                  cafe: 'Kafe',
                  teahouse: 'Choyxona',
                  fastfood: 'Fast Food',
                };
                const typeCounts: Record<string, number> = {};
                restaurants.forEach((r) => {
                  typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
                });
                const total = restaurants.length;

                return Object.entries(typeLabels).map(([type, label]) => {
                  const count = typeCounts[type] || 0;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">{label}</div>
                      <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(percentage, 10)}%` }}
                        >
                          <span className="text-xs font-medium text-white">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                So'nggi bronlar
              </h2>
              <Link href="/admin/reservations" className="text-sm text-indigo-600 hover:underline">
                Barchasini ko'rish
              </Link>
            </div>
            {recentReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Bronlar yo'q</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Mijoz</th>
                      <th className="pb-3 font-medium">Restoran</th>
                      <th className="pb-3 font-medium">Sana</th>
                      <th className="pb-3 font-medium">Vaqt</th>
                      <th className="pb-3 font-medium">Mehmonlar</th>
                      <th className="pb-3 font-medium">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentReservations.map((reservation) => (
                      <tr key={reservation.id} className="text-sm">
                        <td className="py-3">
                          <div className="font-medium text-gray-900">{reservation.user_name || 'Noma\'lum'}</div>
                          <div className="text-gray-500 text-xs">{reservation.user_phone || reservation.phone || '-'}</div>
                        </td>
                        <td className="py-3 text-gray-600">{reservation.restaurant_name}</td>
                        <td className="py-3 text-gray-600">{formatDate(reservation.date)}</td>
                        <td className="py-3 text-gray-600">{reservation.time?.slice(0, 5)}</td>
                        <td className="py-3 text-gray-600">{reservation.guest_count}</td>
                        <td className="py-3">{getStatusBadge(reservation.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Restaurants */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-green-600" />
                Restoranlar ro'yxati
              </h2>
              <Link href="/admin/restaurants" className="text-sm text-indigo-600 hover:underline">
                Barchasini ko'rish
              </Link>
            </div>
            {restaurants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Restoranlar yo'q</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.slice(0, 6).map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Store className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{restaurant.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{restaurant.address}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${restaurant.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
