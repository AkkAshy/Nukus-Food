'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import {
  Users, Store, Calendar, TrendingUp, ChevronRight,
  Shield, Settings, BarChart3, UserPlus, Building2
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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        loadStats();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-500">Tizimni boshqarish</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                  <p className="text-sm text-gray-500">Foydalanuvchilar</p>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-orange-600">{stats.users.owners} owner</span>
                <span className="text-blue-600">{stats.users.admins} admin</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.restaurants.total}</p>
                  <p className="text-sm text-gray-500">Restoranlar</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-green-600">{stats.restaurants.active} faol</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.reservations.total}</p>
                  <p className="text-sm text-gray-500">Jami bronlar</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-orange-600">{stats.reservations.today} bugun</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.reservations.pending}</p>
                  <p className="text-sm text-gray-500">Kutilmoqda</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Foydalanuvchilar</h3>
                  <p className="text-sm text-gray-500">Ro'yxat va boshqarish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/admin/restaurants"
            className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Building2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Restoranlar</h3>
                  <p className="text-sm text-gray-500">Barcha joylarni boshqarish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/admin/reservations"
            className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Calendar className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Bronlar</h3>
                  <p className="text-sm text-gray-500">Barcha bronlarni ko'rish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/admin/users/create"
            className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <UserPlus className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Yangi foydalanuvchi</h3>
                  <p className="text-sm text-gray-500">Owner yoki admin qo'shish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/admin/restaurants/create"
            className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Store className="w-7 h-7 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Yangi restoran</h3>
                  <p className="text-sm text-gray-500">Joy qo'shish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
            </div>
          </Link>

          <Link
            href="/admin/stats"
            className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <BarChart3 className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Statistika</h3>
                  <p className="text-sm text-gray-500">Batafsil hisobotlar</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
