export const typography = {
  fontKannada: "NotoSansKannada-Regular",
  fontKannadaBold: "NotoSansKannada-Bold",
  // Serif display font for headlines/stat numbers, matching ulume.shop
  // ("Rooted in soil. Grown for India.", the big "12,000+" / "₹2,572" figures).
  fontDisplay: "PlayfairDisplay-Bold",
  fontDisplayBlack: "PlayfairDisplay-Black",
  h1: { fontFamily: "PlayfairDisplay-Black", fontSize: 30, fontWeight: "900", lineHeight: 38 },
  h2: { fontFamily: "PlayfairDisplay-Bold", fontSize: 24, fontWeight: "700", lineHeight: 32 },
  h3: { fontFamily: "PlayfairDisplay-Bold", fontSize: 18, fontWeight: "700", lineHeight: 26 },
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 18 },
  price: { fontFamily: "PlayfairDisplay-Bold", fontSize: 26, fontWeight: "700" },
  // For Kannada text specifically (when language === "kn") — Playfair Display
  // has no Kannada glyphs, so Kannada headings should use these instead.
  h1Kannada: { fontFamily: "NotoSansKannada-Bold", fontSize: 28, fontWeight: "700", lineHeight: 36 },
  h2Kannada: { fontFamily: "NotoSansKannada-Bold", fontSize: 22, fontWeight: "700", lineHeight: 30 },
  h3Kannada: { fontFamily: "NotoSansKannada-Bold", fontSize: 18, fontWeight: "600", lineHeight: 26 },
};
