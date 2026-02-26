import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
  items: [],
  addItem: (product: Product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { product, quantity }] };
    }),
  removeItem: (productId: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  updateQuantity: (productId: string, quantity: number) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId)
          : state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
    })),
  clear: () => set({ items: [] }),
    }),
    {
      name: "hanniefoods-cart",
      version: 1,
    }
  )
);

export const selectCartTotal = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const selectCartCount = (items: CartItem[]): number =>
  items.reduce((count, item) => count + item.quantity, 0);
