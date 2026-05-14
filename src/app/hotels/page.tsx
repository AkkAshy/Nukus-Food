'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { hotelsApi } from '@/lib/api';
import HotelCard from '@/components/hotel/HotelCard';
import type { Hotel, HotelType } from '@/types';
import {
  Hotel as HotelIcon,
  Building2,
  Home,
  Building,
  Search,
  Map,
  List,
  Package,
  X,
  Star,
} from 'lucide-react';

const HotelsMap = dynamic(() => import('@/components/map/HotelsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Xarita yuklanmoqda...</span>
      </div>
    </div>
  ),
});

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const types: { value: '' | HotelType; label: string; icon: React.ReactNode }[] = [
  { value: '', label: 'Barchasi', icon: <Building2 className="w-4 h-4" /> },
  { value: 'hotel', label: 'Mehmonxonalar', icon: <HotelIcon className="w-4 h-4" /> },
  { value: 'hostel', label: 'Xostellar', icon: <Building className="w-4 h-4" /> },
  { value: 'guesthouse', label: 'Mehmon uylari', icon: <Home className="w-4 h-4" /> },
  { value: 'apart', label: 'Apartamentlar', icon: <Building2 className="w-4 h-4" /> },
];

export default function HotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'' | HotelType>('');
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const params: Record<string, string | number> = {};
        if (selectedType) params.type = selectedType;
        if (selectedStars) params.stars = selectedStars;
        if (debouncedSearch) params.search = debouncedSearch;

        const response = await hotelsApi.getAll(
          Object.keys(params).length > 0 ? params : undefined
        );
        setHotels(response.results);
      } catch (error) {
        console.error('Failed to load hotels:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedType, selectedStars, debouncedSearch]);

  const handleHotelClick = (hotel: Hotel) => {
    router.push(`/hotel/${hotel.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      {/* Hero */}
      <div className="relative z-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 pt-8 pb-8 lg:pb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Nukus shahridagi mehmonxonalar
            </h1>
            <p className="text-white/90 text-lg lg:text-xl max-w-2xl mx-auto">
              Mehmonxonalar, xostellar va apartamentlarni toping va xona band qiling
            </p>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mehmonxona qidiring..."
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

          {/* Type filters */}
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

          {/* Stars filter */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedStars(null)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedStars === null
                  ? 'bg-white text-gray-900 shadow'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            >
              Har qanday
            </button>
            {[3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStars(s)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedStars === s
                    ? 'bg-white text-gray-900 shadow'
                    : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                }`}
              >
                {s}
                <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-full h-12 lg:h-16">
            <path
              d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* View toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{hotels.length}</span>
            <span className="text-gray-500">ta mehmonxona topildi</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'map' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map className="w-4 h-4" />
              Xarita
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              Ro&#39;yxat
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            <span className="text-gray-500">Yuklanmoqda...</span>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col lg:flex-row gap-6 h-[600px] lg:h-[700px]">
            <div className="flex-1 h-[400px] lg:h-full rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              <HotelsMap hotels={hotels} onHotelClick={handleHotelClick} />
            </div>

            <div className="lg:w-[380px] h-[300px] lg:h-full overflow-y-auto bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Yaqin atrofdagi joylar</h2>
                <span className="text-sm text-gray-400">{hotels.length} ta</span>
              </div>
              <div className="space-y-3">
                {hotels.map((hotel, index) => (
                  <div
                    key={hotel.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <HotelCard hotel={hotel} compact />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <div
                key={hotel.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>

          {hotels.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hech narsa topilmadi</h3>
              <p className="text-gray-500">Boshqa filtrni tanlang yoki qidiruvni o&#39;zgartiring</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
