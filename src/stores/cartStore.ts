"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import type { ProductSize } from "@/types/product";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, variantId: string, size: ProductSize) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    size: ProductSize,
    quantity: number,
  ) => void;
  clearCart: () => void;
  totalItems: () => number;
}


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.variantId === item.variantId &&
              i.size === item.size,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.variantId === item.variantId &&
                i.size === item.size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId, variantId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.variantId === variantId &&
                i.size === size
              ),
          ),
        }));
      },

      updateQuantity: (productId, variantId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.variantId === variantId &&
            i.size === size
              ? { ...i, quantity }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "mat-cart",
    },
  ),
);
