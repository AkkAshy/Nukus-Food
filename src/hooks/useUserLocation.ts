'use client';

import { useEffect, useState } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
}

/**
 * Возвращает текущие координаты юзера через navigator.geolocation.
 * Спрашивает разрешение при первом монтировании.
 */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('Geolokatsiya qoʻllab-quvvatlanmaydi');
      setLoading(false);
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setLoading(false);
    };

    const onError = (err: GeolocationPositionError) => {
      const messages: Record<number, string> = {
        1: 'Joylashuvga ruxsat berilmadi',
        2: 'Joylashuvni aniqlab boʻlmadi',
        3: 'Vaqt tugadi',
      };
      setError(messages[err.code] ?? 'Geolokatsiya xatosi');
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    });
  }, []);

  return { location, error, loading };
}
