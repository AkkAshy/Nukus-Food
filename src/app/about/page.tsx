'use client';

import Link from 'next/link';
import {
  MapPin, Phone, MessageCircle, Instagram, Mail, Users, Store,
  Calendar, Star, ChevronRight, CheckCircle
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Nukus shahrining eng yaxshi joylarini toping
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Biz Nukus shahridagi restoranlar, kafelar va choyxonalarni bir joyga to'pladik.
              Stolni oldindan band qiling va vaqtingizni tejang.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Xaritani ko'rish
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Store className="w-5 h-5" />
                Restoraningizni qo'shing
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">10+</p>
            <p className="text-sm text-gray-500">Joylar</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">500+</p>
            <p className="text-sm text-gray-500">Foydalanuvchilar</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">1000+</p>
            <p className="text-sm text-gray-500">Bronlar</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">4.8</p>
            <p className="text-sm text-gray-500">O'rtacha reyting</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nima uchun biz?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Platformamiz orqali siz osongina joy topishingiz va bron qilishingiz mumkin
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-black/5">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Xaritada ko'ring</h3>
            <p className="text-gray-500">
              Barcha joylarni interaktiv xaritada ko'ring. Yaqin atrofdagi restoranlarni osongina toping.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-black/5">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Onlayn bron</h3>
            <p className="text-gray-500">
              Telefon qilmasdan stolni oldindan band qiling. Vaqt va joyni tanlang - tayyor!
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-black/5">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tasdiqlash</h3>
            <p className="text-gray-500">
              Broningiz tasdiqlanganini bilasiz. Restoran sizning kelishingizni kutadi.
            </p>
          </div>
        </div>
      </div>

      {/* For Restaurant Owners */}
      <div id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-6">
                Restoran egalariga
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Restoraningizni platformamizga qo'shing
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Mijozlaringiz sizni osongina topsin va onlayn bron qilsin.
                Bepul ro'yxatdan o'ting va yangi mijozlar oqimini oling.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Bepul ro'yxatdan o'tish</h4>
                    <p className="text-gray-400 text-sm">Hech qanday yashirin to'lovlar yo'q</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Bron boshqaruvi</h4>
                    <p className="text-gray-400 text-sm">Qulay panel orqali bronlarni boshqaring</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Statistika</h4>
                    <p className="text-gray-400 text-sm">Bronlar va mijozlar haqida statistika</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-3xl p-8 text-gray-900">
              <h3 className="text-2xl font-bold mb-6">Biz bilan bog'laning</h3>
              <p className="text-gray-500 mb-8">
                Restoraningizni qo'shish uchun quyidagi kontaktlar orqali biz bilan bog'laning
              </p>

              <div className="space-y-4">
                <a
                  href="tel:+998901234567"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-semibold text-gray-900">+998 90 123 45 67</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </a>

                <a
                  href="https://t.me/nukus_food"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#e7f3ff] rounded-xl flex items-center justify-center group-hover:bg-[#d4ebff] transition-colors">
                    <MessageCircle className="w-6 h-6 text-[#0088cc]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telegram</p>
                    <p className="font-semibold text-gray-900">@nukus_food</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </a>

                <a
                  href="https://instagram.com/nukus_food"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instagram</p>
                    <p className="font-semibold text-gray-900">@nukus_food</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </a>

                <a
                  href="mailto:info@nukusfood.uz"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">info@nukusfood.uz</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">NukusFood</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                Nukus shahridagi eng yaxshi restoranlar, kafelar va choyxonalarni toping va onlayn bron qiling.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://t.me/nukus_food"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/nukus_food"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Sahifalar</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Xarita
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Biz haqimizda
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Kirish
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white transition-colors">
                    Ro'yxatdan o'tish
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Aloqa</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nukus, O'zbekiston
                </li>
                <li>
                  <a href="tel:+998901234567" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    +998 90 123 45 67
                  </a>
                </li>
                <li>
                  <a href="mailto:info@nukusfood.uz" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    info@nukusfood.uz
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} NukusFood. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
