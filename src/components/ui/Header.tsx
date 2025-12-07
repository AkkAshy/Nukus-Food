'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useEffect, useState } from 'react';
import { BookOpen, LogOut, Menu, X, Store, Shield } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Nukus Food
              </span>
              <span className="block text-xs text-gray-400 -mt-1">Joy toping, band qiling</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all"
            >
              Xarita
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all"
            >
              Biz haqimizda
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Admin Panel Link */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                    title="Admin panel"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="hidden lg:inline font-medium">Admin</span>
                  </Link>
                )}
                {/* Owner Panel Link */}
                {user.role === 'owner' && (
                  <Link
                    href="/owner"
                    className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-all"
                    title="Boshqaruv paneli"
                  >
                    <Store className="w-5 h-5" />
                    <span className="hidden lg:inline font-medium">Panel</span>
                  </Link>
                )}
                <Link
                  href="/cabinet"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline font-medium">{user.full_name}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Chiqish"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100/80 transition-all"
                >
                  Kirish
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Boshlash
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-64 border-t border-gray-100' : 'max-h-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {/* Admin Panel Link in Mobile */}
          {isAuthenticated && user && user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-5 h-5" />
              Admin panel
            </Link>
          )}
          {/* Owner Panel Link in Mobile */}
          {isAuthenticated && user && user.role === 'owner' && (
            <Link
              href="/owner"
              className="flex items-center gap-2 px-4 py-3 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store className="w-5 h-5" />
              Boshqaruv paneli
            </Link>
          )}
          <Link
            href="/"
            className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Xarita
          </Link>
          <Link
            href="/about"
            className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Biz haqimizda
          </Link>
        </div>
      </div>
    </header>
  );
}
