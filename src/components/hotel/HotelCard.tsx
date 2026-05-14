'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Hotel } from '@/types';
import { Star, MapPin, ChevronRight, Hotel as HotelIcon } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  compact?: boolean;
}

function formatPrice(value?: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat('ru-RU').format(value);
}

function StarBadge({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
      ))}
    </div>
  );
}

export default function HotelCard({ hotel, compact = false }: HotelCardProps) {
  const router = useRouter();
  const price = formatPrice(hotel.min_price);

  if (compact) {
    return (
      <Link href={`/hotel/${hotel.slug}`}>
        <div className="group flex gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
            {hotel.main_image ? (
              <img
                src={hotel.main_image}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100">
                <HotelIcon className="w-6 h-6 text-teal-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 truncate">{hotel.name}</h3>
              {hotel.stars ? <StarBadge stars={hotel.stars} /> : null}
            </div>
            <p className="text-sm text-gray-500 truncate">{hotel.type_display}</p>
            {price && (
              <p className="text-xs font-medium text-teal-600 mt-1">
                от {price} сум / ночь
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      onClick={() => router.push(`/hotel/${hotel.slug}`)}
      className="group bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {hotel.main_image ? (
          <img
            src={hotel.main_image}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100">
            <HotelIcon className="w-16 h-16 text-teal-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {hotel.stars ? (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 text-gray-800 flex items-center gap-1">
            <StarBadge stars={hotel.stars} />
          </div>
        ) : null}

        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {hotel.type_display}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
          {hotel.name}
        </h3>

        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{hotel.address}</span>
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            {price ? (
              <>
                <span className="text-xs text-gray-400">от</span>
                <p className="text-base font-semibold text-teal-600">
                  {price}
                  <span className="text-xs text-gray-500 ml-1 font-normal">сум / ночь</span>
                </p>
              </>
            ) : (
              <span className="text-sm text-gray-400">Посмотреть номера</span>
            )}
          </div>
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-500 transition-colors">
            <ChevronRight className="w-4 h-4 text-teal-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
