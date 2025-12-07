'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import type { Restaurant } from '@/types';
import { ArrowLeft, Search, Plus, Store, MapPin, Edit, Trash2, Check, X } from 'lucide-react';

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/restaurants');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchRestaurants();
    }
  }, [isAuthenticated, user, search, activeFilter]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const params: { search?: string; is_active?: boolean } = {};
      if (search) params.search = search;
      if (activeFilter === 'active') params.is_active = true;
      if (activeFilter === 'inactive') params.is_active = false;

      const response = await adminApi.getRestaurants(params);
      setRestaurants(response.results);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await adminApi.updateRestaurant(id, { is_active: !currentStatus });
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    try {
      await adminApi.deleteRestaurant(id);
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Restoranlar</h1>
              <p className="text-gray-500">Barcha restoranlarni boshqarish</p>
            </div>
          </div>
          <Link
            href="/admin/restaurants/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yangi restoran
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Barchasi' },
                { value: 'active', label: 'Faol' },
                { value: 'inactive', label: 'Nofaol' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                    activeFilter === option.value
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

        {/* Restaurants List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-black/5 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Restoranlar topilmadi</h3>
            <p className="text-gray-500">Hozircha restoranlar yo'q</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {restaurant.images && restaurant.images.length > 0 ? (
                      <img
                        src={restaurant.images[0].url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            restaurant.is_active
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {restaurant.is_active ? (
                              <>
                                <Check className="w-3 h-3" />
                                Faol
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                Nofaol
                              </>
                            )}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{restaurant.type}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(restaurant.id, restaurant.is_active ?? true)}
                          className={`p-2 rounded-lg transition-colors ${
                            restaurant.is_active
                              ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                          }`}
                          title={restaurant.is_active ? "O'chirish" : 'Yoqish'}
                        >
                          {restaurant.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </button>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(restaurant.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
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
