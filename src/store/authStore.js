import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  seller: null,
  userType: null,
  isLoading: true,
  setUser: (user) => set({ user, userType: "farmer", isLoading: false }),
  setSeller: (seller) => set({ seller, userType: "seller", isLoading: false }),
  clearAuth: () => set({ user: null, seller: null, userType: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
