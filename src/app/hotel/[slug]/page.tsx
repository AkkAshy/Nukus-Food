'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { hotelsApi } from '@/lib/api';
import HotelBookingForm from '@/components/hotel/HotelBookingForm';
import type { Hotel } from '@/types';
import {
  ArrowLeft,
  Hotel as HotelIcon,
  MapPin,
  Star,
  Phone,
  Instagram,
  MessageCircle,
  Globe,
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Users,
  Ruler,
  Sparkles,
} from 'lucide-react';

function formatPrice(value: string | number) {
  const n = typeof value === 'string' ? parseInt(value) : value;
  return new Intl.NumberFormat('ru-RU').format(n);
}

function StarsRow({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      ))}
    </span>
  );
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await hotelsApi.getBySlug(slug);
        if (!cancelled) setHotel(data);
      } catch (e) {
        console.error('Failed to load hotel:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          <span className="text-gray-500">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Mehmonxona topilmadi</h2>
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Mehmonxonalarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const images = hotel.images ?? [];
  const currentImage = images[activeImage];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 ring-1 ring-black/5 aspect-[16/9]">
            {currentImage ? (
              <img
                src={currentImage.url}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100">
                <HotelIcon className="w-24 h-24 text-teal-300" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() =>
                    setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeImage ? 'bg-white w-6' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & info */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{hotel.name}</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-1.5 text-sm">
                  <span className="font-medium text-gray-700">{hotel.type_display}</span>
                  {hotel.stars ? (
                    <>
                      <span>·</span>
                      <StarsRow stars={hotel.stars} />
                    </>
                  ) : null}
                </p>
              </div>
              {hotel.min_price != null && (
                <div className="text-right">
                  <span className="text-xs text-gray-400">от</span>
                  <p className="text-xl font-semibold text-teal-600">
                    {formatPrice(hotel.min_price)} <span className="text-sm text-gray-500 font-normal">сум / ночь</span>
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 text-gray-500 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" /> {hotel.address}
            </p>

            {(hotel.check_in_time || hotel.check_out_time) && (
              <p className="mt-2 text-gray-500 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                Заезд с {hotel.check_in_time?.slice(0, 5)}, выезд до {hotel.check_out_time?.slice(0, 5)}
              </p>
            )}

            {hotel.description && (
              <p className="mt-4 text-gray-700 whitespace-pre-line">{hotel.description}</p>
            )}

            {/* Contacts */}
            <div className="mt-5 flex flex-wrap gap-2">
              {hotel.phone && (
                <a
                  href={`tel:${hotel.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" /> {hotel.phone}
                </a>
              )}
              {hotel.website && (
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  <Globe className="w-4 h-4" /> Сайт
                </a>
              )}
              {hotel.email && (
                <a
                  href={`mailto:${hotel.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" /> {hotel.email}
                </a>
              )}
              {hotel.instagram && (
                <a
                  href={
                    hotel.instagram.startsWith('http')
                      ? hotel.instagram
                      : `https://instagram.com/${hotel.instagram.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              )}
              {hotel.telegram && (
                <a
                  href={
                    hotel.telegram.startsWith('http')
                      ? hotel.telegram
                      : `https://t.me/${hotel.telegram.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0088cc] text-white rounded-lg text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Telegram
                </a>
              )}
            </div>
          </div>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-500" /> Удобства отеля
              </h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span
                    key={a.id}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rooms */}
          {hotel.rooms && hotel.rooms.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Номера</h2>
              <div className="space-y-3">
                {hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-gray-100 hover:border-teal-200 transition-colors"
                  >
                    <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {room.images && room.images[0] ? (
                        <img src={room.images[0].url} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-50">
                          <BedDouble className="w-10 h-10 text-teal-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{room.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{room.type_display}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-teal-600">{formatPrice(room.price_per_night)}</p>
                          <p className="text-xs text-gray-400">сум / ночь</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> до {room.capacity}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" /> {room.bed_count}
                        </span>
                        {room.size_sqm ? (
                          <span className="inline-flex items-center gap-1">
                            <Ruler className="w-3.5 h-3.5" /> {room.size_sqm} м²
                          </span>
                        ) : null}
                      </div>
                      {room.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{room.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — booking form */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <HotelBookingForm hotel={hotel} />
        </div>
      </div>
    </div>
  );
}
