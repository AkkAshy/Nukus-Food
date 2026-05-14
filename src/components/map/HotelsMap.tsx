'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Hotel } from '@/types';
import { useUserLocation } from '@/hooks/useUserLocation';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps: any;
  }
}

interface HotelsMapProps {
  hotels: Hotel[];
  onHotelClick?: (hotel: Hotel) => void;
  center?: [number, number];
  zoom?: number;
}

function formatPrice(value?: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat('ru-RU').format(value);
}

function balloonContent(hotel: Hotel) {
  const price = formatPrice(hotel.min_price);
  const stars = hotel.stars
    ? Array.from({ length: hotel.stars })
        .map(
          () =>
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        )
        .join('')
    : '';

  return `
    <div style="padding: 4px 0; font-family: system-ui, sans-serif;">
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">${hotel.type_display}${stars ? ` &middot; <span>${stars}</span>` : ''}</p>
      <p style="margin: 0 0 8px; display: flex; align-items: center; gap: 6px; font-size: 13px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style="color: #374151;">${hotel.address}</span>
      </p>
      ${price ? `
        <p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #1d4ed8; font-weight: 600;">
          от ${price} сум / ночь
        </p>` : ''}
    </div>
  `;
}

export default function HotelsMap({
  hotels,
  onHotelClick,
  center = [42.46, 59.6],
  zoom = 13,
}: HotelsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { location: userLocation } = useUserLocation();

  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.geoObjects.removeAll();
    hotels.forEach((hotel) => {
      const placemark = new window.ymaps.Placemark(
        [parseFloat(hotel.latitude), parseFloat(hotel.longitude)],
        {
          balloonContentHeader: `<span style="font-weight: 600; font-size: 15px;">${hotel.name}</span>`,
          balloonContentBody: balloonContent(hotel),
          hintContent: hotel.name,
        },
        { preset: 'islands#blueDotIcon' }
      );

      placemark.events.add('click', () => onHotelClick?.(hotel));
      map.geoObjects.add(placemark);
    });
  }, [hotels, onHotelClick]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.ymaps.Map(mapRef.current, {
      center,
      zoom,
      controls: ['zoomControl', 'geolocationControl'],
    });
    mapInstanceRef.current = map;
    renderMarkers();
  }, [center, zoom, renderMarkers]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

    if (window.ymaps) {
      window.ymaps.ready(() => {
        initMap();
        setIsLoaded(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        setIsLoaded(true);
        initMap();
      });
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;
    renderMarkers();
  }, [isLoaded, renderMarkers]);

  // Show "You are here" pin when location is available
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map || !userLocation) return;

    if (userMarkerRef.current) {
      map.geoObjects.remove(userMarkerRef.current);
    }

    userMarkerRef.current = new window.ymaps.Placemark(
      [userLocation.lat, userLocation.lng],
      {
        balloonContentHeader: '<b>Siz shu yerdasiz</b>',
        balloonContentBody: `Aniqlik: ±${Math.round(userLocation.accuracy)} m`,
        hintContent: 'Sizning joylashuvingiz',
      },
      {
        preset: 'islands#violetCircleDotIcon',
        zIndex: 1000,
      }
    );
    map.geoObjects.add(userMarkerRef.current);
  }, [isLoaded, userLocation]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
}
