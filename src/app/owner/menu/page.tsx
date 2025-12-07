'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { ownerApi } from '@/lib/api';
import type { MenuCategory, MenuItem } from '@/types';
import {
  ArrowLeft, UtensilsCrossed, Plus, Edit2, Trash2,
  X, Save, AlertCircle, ChevronDown, ChevronRight,
  GripVertical, Eye, EyeOff
} from 'lucide-react';

interface CategoryFormData {
  name: string;
  description: string;
  order: number;
  is_active: boolean;
}

interface ItemFormData {
  category: number;
  name: string;
  description: string;
  price: number;
  weight: string;
  is_available: boolean;
  is_popular: boolean;
  order: number;
}

const defaultCategoryForm: CategoryFormData = {
  name: '',
  description: '',
  order: 0,
  is_active: true,
};

const defaultItemForm: ItemFormData = {
  category: 0,
  name: '',
  description: '',
  price: 0,
  weight: '',
  is_available: true,
  is_popular: false,
  order: 0,
};

export default function OwnerMenuPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm);

  // Item modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormData>(defaultItemForm);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/owner/menu');
      } else if (user?.role !== 'owner' && user?.role !== 'admin') {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, itemsData] = await Promise.all([
        ownerApi.getMenuCategories(),
        ownerApi.getMenuItems(),
      ]);
      setCategories(categoriesData);
      setItems(itemsData);
      // Expand all categories by default
      setExpandedCategories(new Set(categoriesData.map((c: MenuCategory) => c.id)));
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getItemsForCategory = (categoryId: number) => {
    return items.filter((item) => item.category === categoryId);
  };

  // Category handlers
  const openCategoryModal = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        order: category.order,
        is_active: category.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        ...defaultCategoryForm,
        order: categories.length,
      });
    }
    setError('');
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm(defaultCategoryForm);
    setError('');
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!categoryForm.name.trim()) {
      setError('Kategoriya nomini kiriting');
      return;
    }

    try {
      setIsSaving(true);
      if (editingCategory) {
        await ownerApi.updateMenuCategory(editingCategory.id, categoryForm);
      } else {
        await ownerApi.createMenuCategory(categoryForm);
      }
      closeCategoryModal();
      loadData();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    const categoryItems = getItemsForCategory(id);
    if (categoryItems.length > 0) {
      if (!confirm(`Bu kategoriyada ${categoryItems.length} ta taom bor. O'chirmoqchimisiz?`)) {
        return;
      }
    } else if (!confirm('Bu kategoriyani o\'chirmoqchimisiz?')) {
      return;
    }

    try {
      await ownerApi.deleteMenuCategory(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Item handlers
  const openItemModal = (categoryId: number, item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        category: item.category,
        name: item.name,
        description: item.description || '',
        price: item.price,
        weight: item.weight || '',
        is_available: item.is_available,
        is_popular: item.is_popular,
        order: item.order,
      });
    } else {
      setEditingItem(null);
      const categoryItems = getItemsForCategory(categoryId);
      setItemForm({
        ...defaultItemForm,
        category: categoryId,
        order: categoryItems.length,
      });
    }
    setError('');
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setItemForm(defaultItemForm);
    setError('');
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!itemForm.name.trim()) {
      setError('Taom nomini kiriting');
      return;
    }

    if (itemForm.price <= 0) {
      setError('Narxni kiriting');
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        await ownerApi.updateMenuItem(editingItem.id, itemForm);
      } else {
        await ownerApi.createMenuItem(itemForm);
      }
      closeItemModal();
      loadData();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemDelete = async (id: number) => {
    if (!confirm('Bu taomni o\'chirmoqchimisiz?')) return;

    try {
      await ownerApi.deleteMenuItem(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      await ownerApi.updateMenuItem(item.id, { is_available: !item.is_available });
      loadData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/owner" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Menyu</h1>
          </div>
          <button
            onClick={() => openCategoryModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Kategoriya
          </button>
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm ring-1 ring-black/5 text-center">
            <UtensilsCrossed className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Menyu bo'sh</h3>
            <p className="text-gray-500 mb-6">Kategoriya qo'shib boshlang</p>
            <button
              onClick={() => openCategoryModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Birinchi kategoriyani qo'shish
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden ${
                  !category.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Category Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-300" />
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <span className="text-sm text-gray-500">
                        {getItemsForCategory(category.id).length} ta taom
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openItemModal(category.id)}
                      className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Taom qo'shish"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openCategoryModal(category)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCategoryDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Items */}
                {expandedCategories.has(category.id) && (
                  <div className="border-t border-gray-100">
                    {getItemsForCategory(category.id).length === 0 ? (
                      <div className="px-5 py-8 text-center text-gray-500">
                        <p className="mb-3">Bu kategoriyada taom yo'q</p>
                        <button
                          onClick={() => openItemModal(category.id)}
                          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Taom qo'shish
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {getItemsForCategory(category.id).map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between px-5 py-3 ${
                              !item.is_available ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-gray-300" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{item.name}</span>
                                  {item.is_popular && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                                      Hit
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="font-semibold text-gray-900">
                                    {item.price.toLocaleString()} so'm
                                  </span>
                                  {item.weight && <span>{item.weight}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleItemAvailability(item)}
                                className={`p-2 rounded-lg transition-colors ${
                                  item.is_available
                                    ? 'text-green-500 hover:bg-green-50'
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                                title={item.is_available ? 'Mavjud' : 'Mavjud emas'}
                              >
                                {item.is_available ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => openItemModal(category.id, item)}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleItemDelete(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeCategoryModal} />
          <div className="relative bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
              </h2>
              <button
                onClick={closeCategoryModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Masalan: Birinchi taomlar"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  placeholder="Qo'shimcha ma'lumot..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="category_active"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="category_active" className="text-sm font-medium text-gray-700">
                  Faol (menyuda ko'rsatiladi)
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
                  onClick={closeCategoryModal}
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

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeItemModal} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {editingItem ? 'Taomni tahrirlash' : 'Yangi taom'}
              </h2>
              <button
                onClick={closeItemModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomi *
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Masalan: Lag'mon"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={2}
                  placeholder="Tarkibi, xususiyatlari..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Narxi (so'm) *
                  </label>
                  <input
                    type="number"
                    value={itemForm.price || ''}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
                    min={0}
                    placeholder="25000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vazni/hajmi
                  </label>
                  <input
                    type="text"
                    value={itemForm.weight}
                    onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })}
                    placeholder="350g / 500ml"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="item_available"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="item_available" className="text-sm font-medium text-gray-700">
                    Mavjud (buyurtma qilish mumkin)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="item_popular"
                    checked={itemForm.is_popular}
                    onChange={(e) => setItemForm({ ...itemForm, is_popular: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="item_popular" className="text-sm font-medium text-gray-700">
                    Hit (mashhur taom sifatida belgilash)
                  </label>
                </div>
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
                  onClick={closeItemModal}
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
