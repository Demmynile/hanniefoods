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
      // Check stock availability
      if (!product.inStock || product.stock <= 0) {
        return state; // Don't add out-of-stock items
      }

      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        // Prevent exceeding available stock
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        };
      }
      // Ensure initial quantity doesn't exceed stock
      const initialQuantity = Math.min(quantity, product.stock);
      return { items: [...state.items, { product, quantity: initialQuantity }] };
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
          : state.items.map((item) => {
              if (item.product.id === productId) {
                // Enforce max stock limit
                const maxQuantity = item.product.stock || 0;
                return { ...item, quantity: Math.min(quantity, maxQuantity) };
              }
              return item;
            }),
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
