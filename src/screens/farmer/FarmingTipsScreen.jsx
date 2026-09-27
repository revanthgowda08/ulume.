import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { cardShadow } from "../../theme/shadow";
import { useT } from "../../i18n/useT";
import { useHeadingFont } from "../../theme/useHeadingFont";

const CATEGORIES = [
  { key: "soil", icon: "🌱", label: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ" },
  { key: "water", icon: "💧", label: "ನೀರಾವರಿ" },
  { key: "pest", icon: "🐛", label: "ಕೀಟ ನಿಯಂತ್ರಣ" },
  { key: "organic", icon: "🍃", label: "ಸಾವಯವ ಕೃಷಿ" },
  { key: "harvest", icon: "📦", label: "ಕೊಯ್ಲಿನ ನಂತರ" },
];

const TIPS = {
  soil: [
    "ಪ್ರತಿ 2-3 ವರ್ಷಕ್ಕೊಮ್ಮೆ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ ಪೋಷಕಾಂಶದ ಕೊರತೆ ತಿಳಿಯಿರಿ",
    "ಬೆಳೆ ಸರದಿ ಪದ್ಧತಿ ಅನುಸರಿಸಿ ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಕಾಪಾಡಿ",
    "ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ಬೆಳೆಸಿ ಮಣ್ಣಿನ ರಚನೆ ಸುಧಾರಿಸಿ",
  ],
  water: [
    "ಹನಿ ನೀರಾವರಿ ಬಳಸಿ 30-50% ನೀರು ಉಳಿಸಿ",
    "ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ ಆವಿಯಾಗುವಿಕೆ ಕಡಿಮೆ ಮಾಡಿ",
    "ಮಣ್ಣಿನ ತೇವಾಂಶ ನೋಡಿಯೇ ನೀರು ಕೊಡಿ, ವೇಳಾಪಟ್ಟಿ ಮಾತ್ರ ನಂಬಬೇಡಿ",
  ],
  pest: [
    "ಬೆಳೆಯನ್ನು ವಾರಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲಿಸಿ ಆರಂಭಿಕ ಹಂತದಲ್ಲೇ ಕೀಟ ಪತ್ತೆ ಮಾಡಿ",
    "ಬೇವಿನ ಎಣ್ಣೆಯಂತಹ ಜೈವಿಕ ಕೀಟನಾಶಕ ಮೊದಲು ಪ್ರಯತ್ನಿಸಿ",
    "ಬಲೆ ಬೆಳೆ ನೆಟ್ಟು ಕೀಟಗಳನ್ನು ಮುಖ್ಯ ಬೆಳೆಯಿಂದ ದೂರವಿಡಿ",
  ],
  organic: [
    "ಎರೆಹುಳು ಗೊಬ್ಬರ ತಯಾರಿಸಿ ರಾಸಾಯನಿಕ ಗೊಬ್ಬರ ಬಳಕೆ ಕಡಿಮೆ ಮಾಡಿ",
    "ಮಿಶ್ರ ಬೆಳೆ ಪದ್ಧತಿಯಿಂದ ಕೀಟ ಬಾಧೆ ಮತ್ತು ಅಪಾಯ ಕಡಿಮೆ ಮಾಡಿ",
    "ಸಾವಯವ ಪ್ರಮಾಣೀಕರಣ ಪಡೆದರೆ ಉತ್ತಮ ಬೆಲೆ ಸಿಗುತ್ತದೆ",
  ],
  harvest: [
    "ಕೊಯ್ಲು ಮಾಡಿದ ತಕ್ಷಣ ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ ಕೊಳೆಯುವಿಕೆ ತಡೆಯಿರಿ",
    "ಸ್ವಚ್ಛ, ಗಾಳಿಯಾಡುವ ಚೀಲಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ",
    "ಗ್ರೇಡಿಂಗ್ ಮತ್ತು ವಿಂಗಡಣೆ ಮಾಡಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಿರಿ",
  ],
};

export default function FarmingTipsScreen({ navigation }) {
  const t = useT();
  const h2Font = useHeadingFont("h2");
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const activeCategory = CATEGORIES.find((c) => c.key === category);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { fontFamily: h2Font }]}>{t("ಕೃಷಿ ಸಲಹೆಗಳು")}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.categoryChip, category === c.key && styles.categoryChipActive]}
            onPress={() => setCategory(c.key)}
          >
            <Text style={styles.categoryIcon}>{c.icon}</Text>
            <Text style={[styles.categoryLabel, category === c.key && styles.categoryLabelActive]}>
              {t(c.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: spacing.screenPadding, paddingTop: spacing.md }}>
        <Text style={styles.sectionLabel}>
          {activeCategory.icon} {t(activeCategory.label)}
        </Text>
        {TIPS[category].map((tip, i) => (
          <View key={tip} style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.tipText}>{t(tip)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h2, fontSize: 20, color: colors.textPrimary },
  categoryScroll: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  categoryRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.screenPadding, paddingVertical: spacing.md },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    minHeight: spacing.minTouchTarget - 8,
  },
  categoryChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { ...typography.caption, color: colors.textMuted, fontWeight: "600" },
  categoryLabelActive: { color: colors.primary },
  body: { flex: 1 },
  sectionLabel: { ...typography.body, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.md },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...cardShadow,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  tipNumberText: { ...typography.caption, color: colors.primary, fontWeight: "700" },
  tipText: { ...typography.body, color: colors.textPrimary, flex: 1, lineHeight: 21 },
});
