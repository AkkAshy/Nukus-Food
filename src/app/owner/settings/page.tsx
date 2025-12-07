'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { ownerApi } from '@/lib/api';
import type { Restaurant } from '@/types';
import {
  ArrowLeft, Store, MapPin, Phone, Instagram, MessageCircle,
  Clock, DollarSign, Save, AlertCircle, Check, Navigation, X,
  Image, Upload, Trash2, Star, Building2, UtensilsCrossed
} from 'lucide-react';
import type { WorkingHours, RestaurantImage } from '@/types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps: any;
  }
}

export default function OwnerSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

  // Images state
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Map state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placemarkRef = useRef<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    instagram: '',
    telegram: '',
    average_check: '',
    min_order_amount: '',
    slot_duration: '',
    min_booking_hours: '',
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/owner/settings');
      } else if (user?.role !== 'owner' && user?.role !== 'admin') {
        router.push('/');
      } else {
        loadRestaurant();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadRestaurant = async () => {
    try {
      setIsLoading(true);
      const data = await ownerApi.getMyRestaurant();
      setRestaurant(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        phone: data.phone || '',
        instagram: data.instagram || '',
        telegram: data.telegram || '',
        average_check: data.average_check?.toString() || '',
        min_order_amount: data.min_order_amount?.toString() || '',
        slot_duration: data.slot_duration?.toString() || '60',
        min_booking_hours: data.min_booking_hours?.toString() || '1',
      });

      // Set working hours
      if (data.working_hours && data.working_hours.length > 0) {
        setWorkingHours(data.working_hours);
      } else {
        // Initialize with default working hours
        const defaultHours: WorkingHours[] = [];
        for (let i = 0; i < 7; i++) {
          defaultHours.push({
            day_of_week: i,
            day_name: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'][i],
            open_time: '09:00',
            close_time: '22:00',
            is_closed: false,
          });
        }
        setWorkingHours(defaultHours);
      }

      // Set images
      if (data.images) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Failed to load restaurant:', err);
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize map
  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const centerLat = formData.latitude ? parseFloat(formData.latitude) : 42.46;
    const centerLon = formData.longitude ? parseFloat(formData.longitude) : 59.6;

    const map = new window.ymaps.Map(mapRef.current, {
      center: [centerLat, centerLon],
      zoom: 15,
      controls: ['zoomControl', 'geolocationControl', 'searchControl'],
    });

    mapInstanceRef.current = map;

    // Add placemark if coordinates exist
    if (formData.latitude && formData.longitude) {
      const placemark = new window.ymaps.Placemark(
        [parseFloat(formData.latitude), parseFloat(formData.longitude)],
        { hintContent: formData.name || 'Sizning joy' },
        { preset: 'islands#redDotIcon', draggable: true }
      );
      placemarkRef.current = placemark;
      map.geoObjects.add(placemark);

      // Handle placemark drag
      placemark.events.add('dragend', () => {
        const coords = placemark.geometry.getCoordinates();
        updateAddressFromCoords(coords[0], coords[1]);
      });
    }

    // Click on map to set location
    map.events.add('click', (e: { get: (key: string) => [number, number] }) => {
      const coords = e.get('coords');
      setPlacemarkPosition(coords[0], coords[1]);
      updateAddressFromCoords(coords[0], coords[1]);
    });

    setMapLoaded(true);
  }, [formData.latitude, formData.longitude, formData.name]);

  const setPlacemarkPosition = (lat: number, lon: number) => {
    if (!mapInstanceRef.current) return;

    if (placemarkRef.current) {
      placemarkRef.current.geometry.setCoordinates([lat, lon]);
    } else {
      const placemark = new window.ymaps.Placemark(
        [lat, lon],
        { hintContent: formData.name || 'Sizning joy' },
        { preset: 'islands#redDotIcon', draggable: true }
      );
      placemarkRef.current = placemark;
      mapInstanceRef.current.geoObjects.add(placemark);

      placemark.events.add('dragend', () => {
        const coords = placemark.geometry.getCoordinates();
        updateAddressFromCoords(coords[0], coords[1]);
      });
    }
  };

  const updateAddressFromCoords = async (lat: number, lon: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
    }));

    // Reverse geocode to get address
    try {
      const result = await window.ymaps.geocode([lat, lon]);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        const address = firstGeoObject.getAddressLine();
        setFormData(prev => ({
          ...prev,
          address: address,
        }));
      }
    } catch (err) {
      console.error('Geocode error:', err);
    }
  };

  // Open map modal
  const openMapModal = () => {
    setIsMapOpen(true);

    // Load Yandex Maps if not loaded
    if (window.ymaps) {
      setTimeout(() => {
        window.ymaps.ready(initMap);
      }, 100);
    } else {
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(initMap);
      };
      document.head.appendChild(script);
    }
  };

  const closeMapModal = () => {
    setIsMapOpen(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      placemarkRef.current = null;
    }
    setMapLoaded(false);
  };

  // Working hours handlers
  const handleWorkingHoursChange = (dayIndex: number, field: string, value: string | boolean) => {
    setWorkingHours(prev => prev.map((wh, idx) =>
      idx === dayIndex ? { ...wh, [field]: value } : wh
    ));
  };

  // Image handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const newImage = await ownerApi.uploadImage(formData);
      setImages(prev => [...prev, { ...newImage, order: prev.length }]);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Rasm yuklashda xatolik');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Rasmni o\'chirmoqchimisiz?')) return;

    try {
      await ownerApi.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
      setError('Rasmni o\'chirishda xatolik');
    }
  };

  const handleSetMainImage = async (imageId: number) => {
    try {
      await ownerApi.setMainImage(imageId);
      setImages(prev => prev.map(img => ({
        ...img,
        is_main: img.id === imageId
      })));
    } catch (err) {
      console.error('Failed to set main image:', err);
      setError('Asosiy rasmni o\'rnatishda xatolik');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      setIsSaving(true);

      // Update restaurant info
      await ownerApi.updateRestaurant({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        phone: formData.phone,
        instagram: formData.instagram,
        telegram: formData.telegram,
        average_check: formData.average_check ? parseInt(formData.average_check) : undefined,
        min_order_amount: formData.min_order_amount ? parseInt(formData.min_order_amount) : undefined,
        slot_duration: formData.slot_duration ? parseInt(formData.slot_duration) : undefined,
        min_booking_hours: formData.min_booking_hours ? parseInt(formData.min_booking_hours) : undefined,
      });

      // Update working hours
      await ownerApi.updateWorkingHours(
        workingHours.map(wh => ({
          day_of_week: wh.day_of_week,
          open_time: wh.open_time,
          close_time: wh.close_time,
          is_closed: wh.is_closed,
        }))
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/owner" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/owner/places"
            className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Joylar</h3>
              <p className="text-xs text-gray-500">Stollar va kabinkalar</p>
            </div>
          </Link>
          <Link
            href="/owner/menu"
            className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Menyu</h3>
              <p className="text-xs text-gray-500">Taomlar va narxlar</p>
            </div>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-400" />
              Asosiy ma'lumotlar
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joy nomi
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              Joylashuv
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manzil
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Manzilni kiriting yoki xaritadan tanlang"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={openMapModal}
                    className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors flex items-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    <span className="hidden sm:inline">Xaritadan</span>
                  </button>
                </div>
              </div>

              {/* Coordinates display */}
              {formData.latitude && formData.longitude && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Kenglik (Latitude)
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      readOnly
                      className="w-full border border-gray-100 rounded-xl px-4 py-2 bg-gray-50 text-gray-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Uzunlik (Longitude)
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      readOnly
                      className="w-full border border-gray-100 rounded-xl px-4 py-2 bg-gray-50 text-gray-600 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-400" />
              Aloqa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon raqami
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+998901234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </span>
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    Telegram
                  </span>
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@username yoki link"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              Narxlar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O'rtacha chek (so'm)
                </label>
                <input
                  type="number"
                  name="average_check"
                  value={formData.average_check}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimal buyurtma (so'm)
                </label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Bron sozlamalari
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot davomiyligi (daqiqa)
                </label>
                <input
                  type="number"
                  name="slot_duration"
                  value={formData.slot_duration}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Bitta bron qancha vaqtga band qilinadi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimal oldindan bron (soat)
                </label>
                <input
                  type="number"
                  name="min_booking_hours"
                  value={formData.min_booking_hours}
                  onChange={handleChange}
                  placeholder="1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Necha soat oldin bron qilish kerak</p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Ish vaqti
            </h2>

            <div className="space-y-3">
              {workingHours.map((wh, index) => (
                <div key={wh.day_of_week} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-28 font-medium text-gray-700">
                    {wh.day_name}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wh.is_closed}
                      onChange={(e) => handleWorkingHoursChange(index, 'is_closed', e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">Dam olish</span>
                  </label>

                  {!wh.is_closed && (
                    <>
                      <div className="flex items-center gap-2 ml-auto">
                        <input
                          type="time"
                          value={wh.open_time}
                          onChange={(e) => handleWorkingHoursChange(index, 'open_time', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                        <span className="text-gray-400">—</span>
                        <input
                          type="time"
                          value={wh.close_time}
                          onChange={(e) => handleWorkingHoursChange(index, 'close_time', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-gray-400" />
              Rasmlar
            </h2>

            {/* Upload Button */}
            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <>
                    <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-gray-600">Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Rasm yuklash</span>
                  </>
                )}
              </label>
            </div>

            {/* Images Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={img.url}
                      alt="Restaurant"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(img.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          img.is_main
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white'
                        }`}
                        title={img.is_main ? 'Asosiy rasm' : 'Asosiy qilish'}
                      >
                        <Star className={`w-4 h-4 ${img.is_main ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Main badge */}
                    {img.is_main && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                        Asosiy
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Hali rasmlar yuklanmagan</p>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>Muvaffaqiyatli saqlandi!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Saqlash
              </>
            )}
          </button>
        </form>
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMapModal}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Joylashuvni tanlang</h2>
                <p className="text-sm text-gray-500">Xaritada bosing yoki markerni suring</p>
              </div>
              <button
                onClick={closeMapModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full pt-20" />

            {/* Loading Indicator */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Xarita yuklanmoqda...</span>
                </div>
              </div>
            )}

            {/* Selected Address Display */}
            {formData.address && mapLoaded && (
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{formData.address}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.latitude}, {formData.longitude}
                    </p>
                  </div>
                  <button
                    onClick={closeMapModal}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  >
                    Tanlash
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
