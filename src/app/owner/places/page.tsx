'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { ownerApi } from '@/lib/api';
import type { Place } from '@/types';
import {
  ArrowLeft, Building2, Plus, Users, Edit2, Trash2,
  X, Save, AlertCircle
} from 'lucide-react';

const placeTypes = [
  { value: 'table', label: 'Stol' },
  { value: 'booth', label: 'Kabinka' },
  { value: 'vip', label: 'VIP xona' },
  { value: 'terrace', label: 'Terrasa' },
];

interface PlaceFormData {
  name: string;
  type: string;
  capacity: number;
  min_capacity: number;
  floor: number;
  description: string;
  deposit_amount: number;
  is_active: boolean;
}

const defaultFormData: PlaceFormData = {
  name: '',
  type: 'table',
  capacity: 4,
  min_capacity: 1,
  floor: 1,
  description: '',
  deposit_amount: 0,
  is_active: true,
};

export default function OwnerPlacesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<PlaceFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/owner/places');
      } else if (user?.role !== 'owner' && user?.role !== 'admin') {
        router.push('/');
      } else {
        loadPlaces();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      const data = await ownerApi.getPlaces();
      setPlaces(data);
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (place?: Place) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name,
        type: place.type,
        capacity: place.capacity,
        min_capacity: place.min_capacity || 1,
        floor: place.floor || 1,
        description: place.description || '',
        deposit_amount: place.deposit_amount || 0,
        is_active: place.is_active,
      });
    } else {
      setEditingPlace(null);
      setFormData(defaultFormData);
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlace(null);
    setFormData(defaultFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Nomini kiriting');
      return;
    }

    try {
      setIsSaving(true);
      if (editingPlace) {
        await ownerApi.updatePlace(editingPlace.id, formData);
      } else {
        await ownerApi.createPlace(formData);
      }
      closeModal();
      loadPlaces();
    } catch (err) {
      console.error('Failed to save place:', err);
      setError('Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu joyni o\'chirmoqchimisiz?')) return;

    try {
      await ownerApi.deletePlace(id);
      loadPlaces();
    } catch (err) {
      console.error('Failed to delete place:', err);
    }
  };

  const getTypeLabel = (type: string) => {
    return placeTypes.find((t) => t.value === type)?.label || type;
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/owner" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Joylar</h1>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yangi joy
          </button>
        </div>

        {/* Places Grid */}
        {places.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-black/5 text-center">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Joylar yo'q</h3>
            <p className="text-gray-500 mb-6">Stol yoki kabinka qo'shing</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Birinchi joyni qo'shish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <div
                key={place.id}
                className={`bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5 ${
                  !place.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{place.name}</h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium mt-1">
                      {getTypeLabel(place.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(place)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {place.min_capacity && place.min_capacity < place.capacity
                      ? `${place.min_capacity}-${place.capacity}`
                      : place.capacity}{' '}
                    kishi
                  </span>
                  {place.floor && (
                    <span>Qavat: {place.floor}</span>
                  )}
                </div>

                {place.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{place.description}</p>
                )}

                {!place.is_active && (
                  <span className="inline-block mt-3 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                    Nofaol
                  </span>
                )}

                {place.deposit_amount && place.deposit_amount > 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Depozit: {place.deposit_amount.toLocaleString()} so'm
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {editingPlace ? 'Joyni tahrirlash' : 'Yangi joy qo\'shish'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Stol #1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {placeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. sig'im
                  </label>
                  <input
                    type="number"
                    value={formData.min_capacity}
                    onChange={(e) => setFormData({ ...formData, min_capacity: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max. sig'im
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qavat
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depozit (so'm)
                </label>
                <input
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: parseInt(e.target.value) || 0 })}
                  min={0}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Qo'shimcha ma'lumot..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Faol (bron qilish uchun mavjud)
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
