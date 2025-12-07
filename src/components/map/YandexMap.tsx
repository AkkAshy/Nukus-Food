'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Restaurant } from '@/types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps: any;
  }
}

interface YandexMapProps {
  restaurants: Restaurant[];
  onRestaurantClick?: (restaurant: Restaurant) => void;
  center?: [number, number];
  zoom?: number;
}

export default function YandexMap({
  restaurants,
  onRestaurantClick,
  center = [42.46, 59.6], // Нукус
  zoom = 13,
}: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.ymaps.Map(mapRef.current, {
      center,
      zoom,
      controls: ['zoomControl', 'geolocationControl'],
    });

    mapInstanceRef.current = map;

    // Add markers
    restaurants.forEach((restaurant) => {
      const placemark = new window.ymaps.Placemark(
        [parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)],
        {
          balloonContentHeader: `<span style="font-weight: 600; font-size: 15px;">${restaurant.name}</span>`,
          balloonContentBody: `
            <div style="padding: 4px 0; font-family: system-ui, sans-serif;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">${restaurant.type_display}</p>
              <p style="margin: 0 0 8px; display: flex; align-items: center; gap: 6px; font-size: 13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style="color: #374151;">${restaurant.address}</span>
              </p>
              ${restaurant.rating ? `
                <p style="margin: 0 0 8px; display: flex; align-items: center; gap: 4px; font-size: 13px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style="font-weight: 500; color: #374151;">${restaurant.rating}</span>
                </p>
              ` : ''}
              <p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                ${restaurant.is_open
                  ? '<span style="display: inline-flex; align-items: center; gap: 4px; color: #22c55e; font-weight: 500; font-size: 13px;"><span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%;"></span>Ochiq</span>'
                  : '<span style="display: inline-flex; align-items: center; gap: 4px; color: #ef4444; font-weight: 500; font-size: 13px;"><span style="width: 6px; height: 6px; background: #ef4444; border-radius: 50%;"></span>Yopiq</span>'
                }
              </p>
            </div>
          `,
          hintContent: restaurant.name,
        },
        {
          preset: restaurant.is_open
            ? 'islands#greenDotIcon'
            : 'islands#redDotIcon',
        }
      );

      placemark.events.add('click', () => {
        onRestaurantClick?.(restaurant);
      });

      map.geoObjects.add(placemark);
    });
  }, [restaurants, center, zoom, onRestaurantClick]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

    // Check if already loaded
    if (window.ymaps) {
      window.ymaps.ready(initMap);
      setIsLoaded(true);
      return;
    }

    // Load Yandex Maps API
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

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const map = mapInstanceRef.current;
    map.geoObjects.removeAll();

    restaurants.forEach((restaurant) => {
      const placemark = new window.ymaps.Placemark(
        [parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)],
        {
          balloonContentHeader: `<span style="font-weight: 600; font-size: 15px;">${restaurant.name}</span>`,
          balloonContentBody: `
            <div style="padding: 4px 0; font-family: system-ui, sans-serif;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">${restaurant.type_display}</p>
              <p style="margin: 0 0 8px; display: flex; align-items: center; gap: 6px; font-size: 13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style="color: #374151;">${restaurant.address}</span>
              </p>
              ${restaurant.rating ? `
                <p style="margin: 0 0 8px; display: flex; align-items: center; gap: 4px; font-size: 13px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style="font-weight: 500; color: #374151;">${restaurant.rating}</span>
                </p>
              ` : ''}
              <p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                ${restaurant.is_open
                  ? '<span style="display: inline-flex; align-items: center; gap: 4px; color: #22c55e; font-weight: 500; font-size: 13px;"><span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%;"></span>Ochiq</span>'
                  : '<span style="display: inline-flex; align-items: center; gap: 4px; color: #ef4444; font-weight: 500; font-size: 13px;"><span style="width: 6px; height: 6px; background: #ef4444; border-radius: 50%;"></span>Yopiq</span>'
                }
              </p>
            </div>
          `,
          hintContent: restaurant.name,
        },
        {
          preset: restaurant.is_open
            ? 'islands#greenDotIcon'
            : 'islands#redDotIcon',
        }
      );

      placemark.events.add('click', () => {
        onRestaurantClick?.(restaurant);
      });

      map.geoObjects.add(placemark);
    });
  }, [restaurants, isLoaded, onRestaurantClick]);

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
