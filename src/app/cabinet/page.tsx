'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';

export default function CabinetPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/cabinet');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shaxsiy kabinet</h1>

        <div className="grid gap-6">
          {/* User info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Profil</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Ism</span>
                <p className="font-medium">{user.full_name}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Telefon</span>
                <p className="font-medium">{user.phone}</p>
              </div>
              {user.email && (
                <div>
                  <span className="text-gray-500 text-sm">Email</span>
                  <p className="font-medium">{user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Link
              href="/cabinet/reservations"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition border-b"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">Mening bronlarim</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              href="/"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">Joy topish</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
