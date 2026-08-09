import { useAppStore } from "../store/appStore";
import { typography } from "./typography";

// Playfair Display (the h1/h2/h3 display font) has no Kannada glyphs — a
// named custom font gets no automatic per-glyph fallback the way the system
// default font does, so a Kannada string in a Playfair-styled heading
// renders as empty boxes. This swaps in the Kannada-safe display font
// (Noto Sans Kannada Bold) for headings when the app is in Kannada.
const FAMILY_BY_LEVEL = {
  h1: { en: typography.h1.fontFamily, kn: typography.h1Kannada.fontFamily },
  h2: { en: typography.h2.fontFamily, kn: typography.h2Kannada.fontFamily },
  h3: { en: typography.h3.fontFamily, kn: typography.h3Kannada.fontFamily },
};

export const useHeadingFont = (level) => {
  const language = useAppStore((s) => s.language);
  return FAMILY_BY_LEVEL[level][language === "kn" ? "kn" : "en"];
};
