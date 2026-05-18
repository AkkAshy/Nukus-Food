'use client';

// Регистрирует /sw.js для ВСЕХ посетителей при загрузке (а не только при включении
// push, как делает lib/push.ts). Повторная регистрация того же scope браузером
// дедуплицируется, так что конфликта с push.ts нет.
import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('SW registratsiya xatosi:', err));
    };

    // Не конкурируем за пропускную способность с первой загрузкой.
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
