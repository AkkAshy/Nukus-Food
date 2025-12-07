'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { restaurantsApi } from '@/lib/api';
import BookingForm from '@/components/booking/BookingForm';
import type { Restaurant, Place } from '@/types';
import {
  ArrowLeft, Utensils, MapPin, Star, DollarSign, Building2, Users, Clock,
  Info, Sparkles, Phone, Instagram, MessageCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function PlacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (restaurant?.images && restaurant.images.length > 1) {
      if (isLeftSwipe) {
        nextImage();
      }
      if (isRightSwipe) {
        prevImage();
      }
    }
  };

  const changeImage = (newIndex: number, direction: 'left' | 'right') => {
    if (isTransitioning || !restaurant?.images) return;

    setIsTransitioning(true);
    setSlideDirection(direction);

    setTimeout(() => {
      setActiveImageIndex(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const nextImage = () => {
    if (restaurant?.images) {
      const newIndex = activeImageIndex === restaurant.images.length - 1 ? 0 : activeImageIndex + 1;
      changeImage(newIndex, 'left');
    }
  };

  const prevImage = () => {
    if (restaurant?.images) {
      const newIndex = activeImageIndex === 0 ? restaurant.images.length - 1 : activeImageIndex - 1;
      changeImage(newIndex, 'right');
    }
  };

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [restaurantData, placesData] = await Promise.all([
        restaurantsApi.getBySlug(slug),
        restaurantsApi.getPlaces(slug),
      ]);
      setRestaurant(restaurantData);
      setPlaces(placesData);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-gray-500">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Joy topilmadi</h1>
          <p className="text-gray-500 mt-2 mb-6">Bu sahifa mavjud emas yoki o'chirilgan</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = restaurant.images && restaurant.images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Orqaga</span>
        </button>
      </div>

      {/* Hero / Images */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div
          className="relative rounded-3xl overflow-hidden bg-gray-200 h-64 md:h-[400px] lg:h-[500px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {hasImages ? (
            <>
              {/* Image container with slide animation */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={restaurant.images![activeImageIndex].url}
                  alt={restaurant.name}
                  className={`w-full h-full object-cover transition-all duration-300 ease-out ${
                    isTransitioning
                      ? slideDirection === 'left'
                        ? 'opacity-0 -translate-x-8 scale-105'
                        : 'opacity-0 translate-x-8 scale-105'
                      : 'opacity-100 translate-x-0 scale-100'
                  }`}
                  draggable={false}
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Arrow navigation - visible on desktop, hidden on mobile */}
              {restaurant.images!.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 md:opacity-100 md:hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 md:opacity-100 md:hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {restaurant.images!.length > 1 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {activeImageIndex + 1} / {restaurant.images!.length}
                </div>
              )}

              {/* Dot navigation */}
              {restaurant.images!.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {restaurant.images!.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (index !== activeImageIndex) {
                          changeImage(index, index > activeImageIndex ? 'left' : 'right');
                        }
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/80 w-2'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Swipe hint for mobile */}
              {restaurant.images!.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 md:hidden text-white/60 text-xs">
                  Surib o'tkazing
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
              <Utensils className="w-32 h-32 text-orange-300" />
            </div>
          )}

          {/* Status badge */}
          <div
            className={`absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
              restaurant.is_open
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
              {restaurant.is_open ? 'Hozir ochiq' : 'Yopiq'}
            </span>
          </div>

          {/* Restaurant info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-3">
                  {restaurant.type_display}
                </span>
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {restaurant.name}
                </h1>
                <p className="text-white/90 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {restaurant.address}
                </p>
              </div>
              {restaurant.rating && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-xl">{restaurant.rating}</span>
                  <span className="text-white/70 text-sm">({restaurant.review_count} ta sharh)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.average_check && (
                <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500">O'rtacha chek</p>
                  <p className="text-lg font-bold text-gray-900">{restaurant.average_check.toLocaleString()} so'm</p>
                </div>
              )}
              {places.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Joylar soni</p>
                  <p className="text-lg font-bold text-gray-900">{places.length} ta</p>
                </div>
              )}
              <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-500">Sig'im</p>
                <p className="text-lg font-bold text-gray-900">
                  {places.reduce((acc, p) => acc + p.capacity, 0)} kishi
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-500">Bron turi</p>
                <p className="text-lg font-bold text-gray-900">
                  {restaurant.reservation_mode === 'auto' ? 'Avtomatik' : 'Qo\'lda'}
                </p>
              </div>
            </div>

            {/* Description */}
            {restaurant.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 animate-fade-in">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-gray-600" />
                  </span>
                  Tavsif
                </h2>
                <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}

            {/* Features */}
            {restaurant.features && restaurant.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gray-600" />
                  </span>
                  Xususiyatlar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {restaurant.features.map((feature) => (
                    <span
                      key={feature.id}
                      className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                      {feature.icon && <span>{feature.icon}</span>}
                      {feature.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Working hours */}
            {restaurant.working_hours && restaurant.working_hours.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </span>
                  Ish vaqti
                </h2>
                <div className="space-y-3">
                  {restaurant.working_hours.map((hours) => (
                    <div
                      key={hours.day_of_week}
                      className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                        hours.is_closed ? 'bg-red-50' : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{hours.day_name}</span>
                      <span className={hours.is_closed ? 'text-red-500 font-medium' : 'text-gray-600'}>
                        {hours.is_closed ? 'Dam olish kuni' : `${hours.open_time.slice(0, 5)} - ${hours.close_time.slice(0, 5)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Places */}
            {places.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </span>
                  Mavjud joylar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      className="group border border-gray-100 hover:border-orange-200 rounded-xl p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {place.name}
                          </h3>
                          <p className="text-sm text-gray-500">{place.type_display}</p>
                        </div>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-600">
                          {place.capacity} kishi
                        </span>
                      </div>
                      {place.deposit_amount && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-sm text-gray-500">Oldindan to'lov</span>
                          <span className="text-orange-600 font-semibold">
                            {place.deposit_amount.toLocaleString()} so'm
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="font-bold text-lg mb-4">Aloqa</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manzil</p>
                      <p className="text-gray-900">{restaurant.address}</p>
                    </div>
                  </div>

                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <p className="text-green-600 font-medium group-hover:text-green-700 transition-colors">
                          {restaurant.phone}
                        </p>
                      </div>
                    </a>
                  )}

                  {restaurant.instagram && (
                    <a
                      href={restaurant.instagram.startsWith('http') ? restaurant.instagram : `https://instagram.com/${restaurant.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Instagram</p>
                        <p className="text-pink-600 font-medium group-hover:text-pink-700 transition-colors">
                          {restaurant.instagram}
                        </p>
                      </div>
                    </a>
                  )}

                  {restaurant.telegram && (
                    <a
                      href={restaurant.telegram.startsWith('http') ? restaurant.telegram : `https://t.me/${restaurant.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-[#e7f3ff] group-hover:bg-[#d4ebff] rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
                        <MessageCircle className="w-5 h-5 text-[#0088cc]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telegram</p>
                        <p className="text-[#0088cc] font-medium group-hover:text-[#006699] transition-colors">
                          {restaurant.telegram}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Booking form */}
              <BookingForm restaurant={restaurant} places={places} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
