'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { adminApi } from '@/lib/api';
import { ArrowLeft, Hotel as HotelIcon, MapPin, Star } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyYM = any;

declare global {
  interface Window {
    ymaps: AnyYM;
  }
}

interface Owner {
  id: number;
  username: string;
  full_name: string;
}

const HOTEL_TYPES = [
  { value: 'hotel', label: 'Mehmonxona' },
  { value: 'hostel', label: 'Xostel' },
  { value: 'guesthouse', label: 'Mehmon uyi' },
  { value: 'apart', label: 'Apart-otel' },
  { value: 'other', label: 'Boshqa' },
] as const;

export default function AdminCreateHotelPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AnyYM>(null);
  const placemarkRef = useRef<AnyYM>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'hotel',
    stars: '',
    address: '',
    latitude: '42.4619',
    longitude: '59.6166',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    telegram: '',
    check_in_time: '14:00',
    check_out_time: '12:00',
    reservation_mode: 'manual',
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
        router.push('/auth/login?redirect=/admin/hotels/create');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      (async () => {
        try {
          const response = await adminApi.getUsers({ role: 'owner' });
          setOwners(response.results as Owner[]);
        } catch (e) {
          console.error('Error fetching owners:', e);
        }
      })();
    }
  }, [isAuthenticated, user]);

  // Load Yandex Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => setMapLoaded(true));
      };
      document.head.appendChild(script);
    } else if (window.ymaps) {
      window.ymaps.ready(() => setMapLoaded(true));
    }
  }, []);

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
          address,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  }, []);

  // Init map
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const lat = parseFloat(formData.latitude) || 42.4619;
      const lng = parseFloat(formData.longitude) || 59.6166;

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        controls: ['zoomControl', 'searchControl'],
      });

      placemarkRef.current = new window.ymaps.Placemark(
        [lat, lng],
        { hintContent: 'Mehmonxona joylashuvi' },
        { draggable: true, preset: 'islands#blueDotIcon' }
      );

      mapInstanceRef.current.geoObjects.add(placemarkRef.current);

      placemarkRef.current.events.add('dragend', () => {
        const coords = placemarkRef.current.geometry.getCoordinates();
        updateLocationFromCoords(coords[0], coords[1]);
      });

      mapInstanceRef.current.events.add('click', (e: AnyYM) => {
        const coords = e.get('coords');
        placemarkRef.current.geometry.setCoordinates(coords);
        updateLocationFromCoords(coords[0], coords[1]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Mehmonxona nomini kiriting');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Xaritadan joylashuvni tanlang');
      return;
    }

    try {
      setIsLoading(true);
      await adminApi.createHotel({
        name: formData.name,
        description: formData.description,
        type: formData.type as 'hotel' | 'hostel' | 'guesthouse' | 'apart' | 'other',
        stars: formData.stars ? parseInt(formData.stars) : null,
        address: formData.address || `${formData.latitude}, ${formData.longitude}`,
        latitude: formData.latitude,
        longitude: formData.longitude,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        instagram: formData.instagram,
        telegram: formData.telegram,
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time,
        reservation_mode: formData.reservation_mode as 'auto' | 'manual',
        owner_id: formData.owner_id ? parseInt(formData.owner_id) : undefined,
      });
      router.push('/admin/restaurants');
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string | string[]> } };
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat();
        setError(messages.join('. '));
      } else {
        setError('Mehmonxona yaratishda xatolik');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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
          <div className="flex items-center gap-2">
            <HotelIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yangi mehmonxona</h1>
              <p className="text-gray-500">Mehmonxona maʼlumotlarini kiriting</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Joylashuvni tanlang</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">Xaritada bosing yoki markerni suring</p>
            <div ref={mapRef} className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-100" />
            {formData.address && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Manzil:</span> {formData.address}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {formData.latitude}, {formData.longitude}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mehmonxona nomi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {HOTEL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yulduzlar</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, stars: formData.stars === String(n) ? '' : String(n) })
                        }
                        className={`flex-1 py-2 rounded-lg border transition-all ${
                          parseInt(formData.stars || '0') >= n
                            ? 'bg-yellow-50 border-yellow-300 text-yellow-600'
                            : 'bg-white border-gray-200 text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 mx-auto ${
                            parseInt(formData.stars || '0') >= n ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Qisqacha tavsif"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@example.uz"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Egasi</label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">— tanlanmagan —</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.full_name} ({o.username})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link
                  href="/admin/restaurants"
                  className="flex-1 py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Bekor qilish
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                >
                  {isLoading ? 'Saqlanmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
