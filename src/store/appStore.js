import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppStore = create(
  persist(
    (set) => ({
      language: "en",
      district: null,
      location: null,
      setLanguage: (l) => set({ language: l }),
      setLocation: (loc) => set({ location: loc }),
      setDistrict: (d) => set({ district: d }),
    }),
    {
      name: "ulume-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language, district: state.district }),
    }
  )
);
