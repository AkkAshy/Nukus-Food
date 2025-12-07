'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { restaurantsApi } from '@/lib/api';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import type { Restaurant } from '@/types';
import { UtensilsCrossed, Utensils, Coffee, Soup, Sandwich, Search, Map, List, Package, X } from 'lucide-react';

// Dynamic import for map (client-side only)
const YandexMap = dynamic(() => import('@/components/map/YandexMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Xarita yuklanmoqda...</span>
      </div>
    </div>
  ),
});

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function HomePage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadRestaurants();
  }, [selectedType, debouncedSearch]);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const params: { type?: string; search?: string } = {};
      if (selectedType) params.type = selectedType;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await restaurantsApi.getAll(
        Object.keys(params).length > 0 ? params : undefined
      );
      setRestaurants(response.results);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    router.push(`/place/${restaurant.slug}`);
  };

  const types = [
    { value: '', label: 'Barchasi', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { value: 'restaurant', label: 'Restoranlar', icon: <Utensils className="w-4 h-4" /> },
    { value: 'cafe', label: 'Kafelar', icon: <Coffee className="w-4 h-4" /> },
    { value: 'choyxona', label: 'Choyxonalar', icon: <Soup className="w-4 h-4" /> },
    { value: 'fastfood', label: 'Fastfood', icon: <Sandwich className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <div className="relative z-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 pt-8 pb-8 lg:pb-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Nukus shahridagi eng yaxshi joylar
            </h1>
            <p className="text-white/90 text-lg lg:text-xl max-w-2xl mx-auto">
              Restoranlar, kafelar va choyxonalarni toping, stollarni band qiling
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Restoran yoki joy qidiring..."
                className="w-full px-6 py-4 pl-14 pr-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Type Filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:gap-3">
            {types.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`group flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedType === type.value
                    ? 'bg-white text-gray-900 shadow-lg shadow-black/25 scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-md shadow-black/10'
                }`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute -bottom-1 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 lg:h-16">
            <path
              d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* View Mode Toggle & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {restaurants.length}
            </span>
            <span className="text-gray-500">ta joy topildi</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-white shadow-md text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map className="w-4 h-4" />
              Xarita
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-md text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              Ro'yxat
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            <span className="text-gray-500">Yuklanmoqda...</span>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col lg:flex-row gap-6 h-[600px] lg:h-[700px]">
            {/* Map */}
            <div className="flex-1 h-[400px] lg:h-full rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              <YandexMap
                restaurants={restaurants}
                onRestaurantClick={handleRestaurantClick}
              />
            </div>

            {/* Sidebar list */}
            <div className="lg:w-[380px] h-[300px] lg:h-full overflow-y-auto bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Yaqin atrofdagi joylar</h2>
                <span className="text-sm text-gray-400">{restaurants.length} ta</span>
              </div>
              <div className="space-y-3">
                {restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <RestaurantCard restaurant={restaurant} compact />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>

          {restaurants.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hech narsa topilmadi</h3>
              <p className="text-gray-500">Boshqa kategoriyani tanlang yoki qidiruvni o'zgartiring</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
