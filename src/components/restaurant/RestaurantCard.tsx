'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Restaurant } from '@/types';
import { Star, MapPin, ChevronRight, Utensils, Instagram, MessageCircle } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  compact?: boolean;
}

export default function RestaurantCard({ restaurant, compact = false }: RestaurantCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/place/${restaurant.slug}`);
  };

  if (compact) {
    return (
      <Link href={`/place/${restaurant.slug}`}>
        <div className="group flex gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
          {/* Mini Image */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
            {restaurant.main_image ? (
              <img
                src={restaurant.main_image}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                <Utensils className="w-6 h-6 text-orange-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 truncate">{restaurant.name}</h3>
              <span
                className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  restaurant.is_open ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-sm text-gray-500 truncate">{restaurant.type_display}</p>
            <div className="flex items-center gap-2 mt-1">
              {restaurant.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium text-gray-600">{restaurant.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {restaurant.main_image ? (
          <img
            src={restaurant.main_image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
            <Utensils className="w-16 h-16 text-orange-300" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            restaurant.is_open
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {restaurant.is_open ? 'Ochiq' : 'Yopiq'}
        </div>

        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {restaurant.type_display}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
            {restaurant.name}
          </h3>
          {restaurant.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">{restaurant.rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{restaurant.address}</span>
        </p>

        {/* Social links */}
        {(restaurant.instagram || restaurant.telegram) && (
          <div className="flex items-center gap-2 mt-3">
            {restaurant.instagram && (
              <a
                href={restaurant.instagram.startsWith('http') ? restaurant.instagram : `https://instagram.com/${restaurant.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
            {restaurant.telegram && (
              <a
                href={restaurant.telegram.startsWith('http') ? restaurant.telegram : `https://t.me/${restaurant.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0088cc] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Band qilish</span>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
