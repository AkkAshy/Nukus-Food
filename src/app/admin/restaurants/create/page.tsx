'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import { ArrowLeft, Store, AlertCircle, MapPin } from 'lucide-react';

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

export default function AdminCreateRestaurantPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'restaurant',
    address: '',
    latitude: '42.4619',
    longitude: '59.6166',
    phone: '',
    owner_id: '',
  });
  const [owners, setOwners] = useState<Owner[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/restaurants/create');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOwners();
    }
  }, [isAuthenticated, user]);

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

  // Initialize map
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const lat = parseFloat(formData.latitude) || 42.4619;
      const lng = parseFloat(formData.longitude) || 59.6166;

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        controls: ['zoomControl', 'searchControl'],
      });

      // Add placemark
      placemarkRef.current = new window.ymaps.Placemark(
        [lat, lng],
        { hintContent: 'Restoran joylashuvi' },
        {
          draggable: true,
          preset: 'islands#redDotIcon',
        }
      );

      mapInstanceRef.current.geoObjects.add(placemarkRef.current);

      // Handle placemark drag
      placemarkRef.current.events.add('dragend', () => {
        const coords = placemarkRef.current.geometry.getCoordinates();
        updateLocationFromCoords(coords[0], coords[1]);
      });

      // Handle map click
      mapInstanceRef.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        placemarkRef.current.geometry.setCoordinates(coords);
        updateLocationFromCoords(coords[0], coords[1]);
      });
    }
  }, [mapLoaded]);

  const updateLocationFromCoords = useCallback(async (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

    // Reverse geocoding
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

  const fetchOwners = async () => {
    try {
      const response = await adminApi.getUsers({ role: 'owner' });
      setOwners(response.results as Owner[]);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Restoran nomini kiriting');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Xaritadan joylashuvni tanlang');
      return;
    }

    try {
      setIsLoading(true);
      await adminApi.createRestaurant({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        type: formData.type,
        address: formData.address || `${formData.latitude}, ${formData.longitude}`,
        latitude: formData.latitude,
        longitude: formData.longitude,
        phone: formData.phone,
        owner_id: formData.owner_id ? parseInt(formData.owner_id) : undefined,
      } as Parameters<typeof adminApi.createRestaurant>[0]);
      router.push('/admin/restaurants');
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string | string[]> } };
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat();
        setError(messages.join('. '));
      } else {
        setError('Restoran yaratishda xatolik');
      }
    } finally {
      setIsLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/restaurants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yangi restoran</h1>
            <p className="text-gray-500">Restoran ma'lumotlarini kiriting</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">Joylashuvni tanlang</h2>
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
                  onChange={(e) => handleNameChange(e.target.value)}
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
                  Turi <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Egasi (Owner)
                </label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option value="">Tanlanmagan</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.full_name} (@{owner.username})
                    </option>
                  ))}
                </select>
                {owners.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Owner rolida foydalanuvchilar yo'q.{' '}
                    <Link href="/admin/users/create" className="text-purple-600 hover:underline">
                      Yangi owner yarating
                    </Link>
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Link
                  href="/admin/restaurants"
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Bekor qilish
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
                      Yaratish
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
