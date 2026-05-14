import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  image_url?: string | null;
  weight?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  remove: (menu_item_id: number) => void;
  setQty: (menu_item_id: number, qty: number) => void;
  clear: () => void;
  totalQuantity: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item, qty = 1) => {
        const existing = get().items.find((i) => i.menu_item_id === item.menu_item_id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.menu_item_id === item.menu_item_id ? { ...i, quantity: i.quantity + qty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: qty }] });
        }
      },

      remove: (id) => set({ items: get().items.filter((i) => i.menu_item_id !== id) }),

      setQty: (id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.menu_item_id !== id) });
          return;
        }
        set({
          items: get().items.map((i) => (i.menu_item_id === id ? { ...i, quantity: qty } : i)),
        });
      },

      clear: () => set({ items: [] }),

      totalQuantity: () => get().items.reduce((s, i) => s + i.quantity, 0),

      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: 'nukus-food-cart' }
  )
);
