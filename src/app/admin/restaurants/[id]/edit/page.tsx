'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import type { Restaurant } from '@/types';
import { ArrowLeft, Store, AlertCircle, MapPin, Check } from 'lucide-react';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface Owner {
  id: number;
  username: string;
  full_name: string;
}

export default function AdminEditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = Number(params.id);
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'restaurant',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    is_active: true,
  });
  const [owners, setOwners] = useState<Owner[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push(`/auth/login?redirect=/admin/restaurants/${restaurantId}/edit`);
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router, restaurantId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchRestaurant();
      fetchOwners();
    }
  }, [isAuthenticated, user, restaurantId]);

  // Load Yandex Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => {
          setMapLoaded(true);
        });
      };
      document.head.appendChild(script);
    } else if (window.ymaps) {
      window.ymaps.ready(() => {
        setMapLoaded(true);
      });
    }
  }, []);

  // Initialize map when data is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude) || 42.4619;
      const lng = parseFloat(formData.longitude) || 59.6166;

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        controls: ['zoomControl', 'searchControl'],
      });

      placemarkRef.current = new window.ymaps.Placemark(
        [lat, lng],
        { hintContent: 'Restoran joylashuvi' },
        {
          draggable: true,
          preset: 'islands#redDotIcon',
        }
      );

      mapInstanceRef.current.geoObjects.add(placemarkRef.current);

      placemarkRef.current.events.add('dragend', () => {
        const coords = placemarkRef.current.geometry.getCoordinates();
        updateLocationFromCoords(coords[0], coords[1]);
      });

      mapInstanceRef.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        placemarkRef.current.geometry.setCoordinates(coords);
        updateLocationFromCoords(coords[0], coords[1]);
      });
    }
  }, [mapLoaded, formData.latitude, formData.longitude]);

  const updateLocationFromCoords = useCallback(async (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

    try {
      const result = await window.ymaps.geocode([lat, lng]);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        const address = firstGeoObject.getAddressLine();
        setFormData((prev) => ({
          ...prev,
          address: address,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  }, []);

  const fetchRestaurant = async () => {
    try {
      setIsFetching(true);
      const data = await adminApi.getRestaurant(restaurantId);
      setRestaurant(data);
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        type: data.type || 'restaurant',
        address: data.address || '',
        latitude: data.latitude?.toString() || '42.4619',
        longitude: data.longitude?.toString() || '59.6166',
        phone: data.phone || '',
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setError('Restoran topilmadi');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await adminApi.getUsers({ role: 'owner' });
      setOwners(response.results as Owner[]);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Restoran nomini kiriting');
      return;
    }

    try {
      setIsLoading(true);
      await adminApi.updateRestaurant(restaurantId, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: formData.type,
        address: formData.address,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        phone: formData.phone,
        is_active: formData.is_active,
      });
      setSuccess('Restoran muvaffaqiyatli yangilandi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string | string[]> } };
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat();
        setError(messages.join('. '));
      } else {
        setError('Restoranni yangilashda xatolik');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restoran topilmadi</h1>
          <Link href="/admin/restaurants" className="text-purple-600 hover:underline">
            Restoranlar ro'yxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/restaurants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restoranni tahrirlash</h1>
            <p className="text-gray-500">{restaurant.name}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">Joylashuv</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Xaritada bosing yoki markerni suring
            </p>
            <div
              ref={mapRef}
              className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-100"
            />
            {formData.address && (
              <div className="mt-3 p-3 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Manzil:</span> {formData.address}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {formData.latitude}, {formData.longitude}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Restoran nomi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="restoran-nomi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option value="restaurant">Restoran</option>
                  <option value="cafe">Kafe</option>
                  <option value="teahouse">Choyxona</option>
                  <option value="fastfood">Fast Food</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Restoran haqida qisqacha"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Faol (saytda ko'rinadi)
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Link
                  href="/admin/restaurants"
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Orqaga
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Store className="w-5 h-5" />
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
