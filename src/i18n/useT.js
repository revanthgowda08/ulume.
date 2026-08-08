import { useAppStore } from "../store/appStore";
import { en } from "./translations";

// Every screen writes its UI text in Kannada first (the primary audience is
// Kannada-speaking farmers/sellers) and wraps it with t("ಕನ್ನಡ ಪಠ್ಯ"). This hook
// looks up an English string for that same Kannada text when the user has
// selected English (the default, matching ulume.shop), and falls back to the
// Kannada text itself otherwise. Language can still be switched to Kannada
// from ProfileScreen.
export const useT = () => {
  const language = useAppStore((s) => s.language);
  return (kannadaText) => (language === "en" ? en[kannadaText] || kannadaText : kannadaText);
};
