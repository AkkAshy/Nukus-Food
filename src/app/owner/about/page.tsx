'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { ownerApi } from '@/lib/api';
import type { Restaurant } from '@/types';
import {
  ArrowLeft, FileText, Save, AlertCircle, Check, Image as ImageIcon,
  Plus, Trash2, GripVertical, Star
} from 'lucide-react';

export default function OwnerAboutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
  });

  // For image management
  const [images, setImages] = useState<Array<{ id: number; url: string; is_main: boolean }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/owner/about');
      } else if (user?.role !== 'owner' && user?.role !== 'admin') {
        router.push('/');
      } else {
        loadRestaurant();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadRestaurant = async () => {
    try {
      setIsLoading(true);
      const data = await ownerApi.getMyRestaurant();
      setRestaurant(data);
      setFormData({
        description: data.description || '',
      });
      if (data.images) {
        setImages(data.images.map(img => ({
          id: img.id,
          url: img.url,
          is_main: img.is_main
        })));
      }
    } catch (err) {
      console.error('Failed to load restaurant:', err);
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      setIsSaving(true);
      await ownerApi.updateRestaurant({
        description: formData.description,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const response = await ownerApi.uploadImage(formData);
      setImages(prev => [...prev, {
        id: response.id,
        url: response.url,
        is_main: response.is_main
      }]);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Rasm yuklashda xatolik');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Rasmni o\'chirmoqchimisiz?')) return;

    try {
      await ownerApi.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
      setError('Rasmni o\'chirishda xatolik');
    }
  };

  const handleSetMainImage = async (imageId: number) => {
    try {
      await ownerApi.setMainImage(imageId);
      setImages(prev => prev.map(img => ({
        ...img,
        is_main: img.id === imageId
      })));
    } catch (err) {
      console.error('Failed to set main image:', err);
      setError('Asosiy rasmni o\'zgartirishda xatolik');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/owner" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Biz haqimizda</h1>
        </div>

        <div className="space-y-6">
          {/* Images Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              Rasmlar
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square rounded-xl overflow-hidden group ${
                    image.is_main ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt="Restaurant"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.is_main && (
                      <button
                        onClick={() => handleSetMainImage(image.id)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="Asosiy qilish"
                      >
                        <Star className="w-4 h-4 text-yellow-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  {/* Main badge */}
                  {image.is_main && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-lg">
                      Asosiy
                    </div>
                  )}
                </div>
              ))}

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500"
              >
                {uploadingImage ? (
                  <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-8 h-8" />
                    <span className="text-sm">Rasm qo'shish</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Birinchi rasm asosiy rasm sifatida ko'rsatiladi. Rasmni asosiy qilish uchun ustiga bosing.
            </p>
          </div>

          {/* Description Section */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Tavsif
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joy haqida ma'lumot
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={8}
                    placeholder="Joyingiz haqida batafsil yozing. Mijozlar uchun qiziqarli ma'lumotlar: tarix, o'ziga xoslik, taomlar, muhit va boshqalar..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length} / 2000 belgi
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-orange-50 rounded-xl p-4">
                  <h3 className="font-medium text-orange-800 mb-2">Yaxshi tavsif uchun maslahatlar:</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Joyingiz tarixini va o'ziga xosligini yozing</li>
                    <li>• Mashhur taomlaringizni sanab o'ting</li>
                    <li>• Muhit va atmosferani tasvirlab bering</li>
                    <li>• Maxsus tadbirlar yoki aksiyalarni eslatib o'ting</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mt-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl mt-6">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Muvaffaqiyatli saqlandi!</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Saqlash
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
