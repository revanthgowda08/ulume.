import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null, // farmer profile
  seller: null, // vendor profile (Firestore collection stays "sellers"; UI shows "Vendor")
  buyer: null, // buyer profile
  userType: null, // "farmer" | "seller" | "buyer"
  isLoading: true,
  setUser: (user) => set({ user, seller: null, buyer: null, userType: "farmer", isLoading: false }),
  setSeller: (seller) => set({ seller, user: null, buyer: null, userType: "seller", isLoading: false }),
  setBuyer: (buyer) => set({ buyer, user: null, seller: null, userType: "buyer", isLoading: false }),
  clearAuth: () => set({ user: null, seller: null, buyer: null, userType: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
