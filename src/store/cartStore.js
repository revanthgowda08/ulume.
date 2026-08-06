import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { product, qty }] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.product.id !== id) }),
      updateQty: (id, qty) =>
        qty <= 0
          ? set({ items: get().items.filter((i) => i.product.id !== id) })
          : set({
              items: get().items.map((i) =>
                i.product.id === id ? { ...i, qty } : i
              ),
            }),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((s, i) => s + i.product.price * i.qty, 0),
      getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
      getSellerId: () => get().items[0]?.product.sellerId ?? null,
    }),
    {
      name: "ulume-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
