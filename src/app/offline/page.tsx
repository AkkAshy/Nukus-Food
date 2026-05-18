'use client';

// Показывается Service Worker'ом когда навигация упала из-за отсутствия сети.
// Прекэшится при install SW (см. public/sw.js).
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 via-red-500 to-pink-500 shadow-lg">
          <WifiOff className="h-10 w-10 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Internet yo&apos;q</h1>
        <p className="mt-3 text-gray-500">
          Ushbu sahifani ko&apos;rsatish uchun internet aloqasi kerak.
          Aloqa tiklangach qayta urinib ko&apos;ring.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-md transition active:scale-95"
        >
          <RefreshCw className="h-5 w-5" />
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
