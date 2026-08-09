import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { cardShadow } from "../../theme/shadow";
import { useT } from "../../i18n/useT";
import { useHeadingFont } from "../../theme/useHeadingFont";

const PROBLEMS = [
  { icon: "🏚️", text: "ಮಧ್ಯವರ್ತಿಗಳು ಬೆಳೆ ಖರೀದಿದಾರರನ್ನು ತಲುಪುವ ಮೊದಲೇ ರೈತರ ಲಾಭದ 30–40% ತೆಗೆದುಕೊಳ್ಳುತ್ತಾರೆ" },
  { icon: "📉", text: "ಬೆಳೆಗೆ ನ್ಯಾಯಯುತ, ನೈಜ-ಸಮಯದ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಗೊತ್ತಾಗುವುದಿಲ್ಲ" },
  { icon: "🚜", text: "ಹತ್ತಿರದಲ್ಲಿ ಗುಣಮಟ್ಟದ ಬೀಜ, ಗೊಬ್ಬರ ಮತ್ತು ಯಂತ್ರೋಪಕರಣಗಳ ಲಭ್ಯತೆ ಕಡಿಮೆ" },
  { icon: "🤝", text: "ರೆಸ್ಟೋರೆಂಟ್, ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ರಫ್ತುದಾರರಿಗೆ ನೇರ ಸಂಪರ್ಕವಿಲ್ಲ" },
];

const SOLUTIONS = [
  { icon: "🌾", text: "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಪರಿಶೀಲಿತ ಖರೀದಿದಾರರಿಗೆ ನೇರವಾಗಿ ಮಾರಿ — ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ" },
  { icon: "🏪", text: "ಪರಿಶೀಲಿತ ಸ್ಥಳೀಯ ಮಾರಾಟಗಾರರಿಂದ ಕೃಷಿ-ಸಾಮಗ್ರಿ ಖರೀದಿಸಿ" },
  { icon: "💳", text: "UPI ಅಥವಾ ಹಣ ಸಾಮಾನು ಬಂದ ಮೇಲೆ ಪಾವತಿಯೊಂದಿಗೆ ಪಾರದರ್ಶಕ ಬೆಲೆ, ಪೂರ್ಣ ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್" },
  { icon: "📊", text: "ನಿಮ್ಮ ಫಾರ್ಮ್‌ಗೆ ಒಂದೇ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ — ಬೆಳೆ ಪಟ್ಟಿ, ಖರೀದಿದಾರರ ವಿನಂತಿ, ಆದಾಯ" },
];

export default function ProblemSolutionScreen({ navigation }) {
  const t = useT();
  const h1Font = useHeadingFont("h1");
  const h3Font = useHeadingFont("h3");
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: spacing.screenPadding, paddingTop: spacing.xl * 1.25, paddingBottom: spacing.lg }}>
        <Text style={styles.eyebrow}>{t("ULUME ಏಕೆ ಇದೆ")}</Text>
        <Text style={[styles.headline, { fontFamily: h1Font }]}>{t("ಕೃಷಿ ಎಂದರೆ ಮಧ್ಯವರ್ತಿಗಳಿಗೆ ಸೋಲುವುದಲ್ಲ.")}</Text>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: h3Font }]}>{t("ಇಂದಿನ ಸಮಸ್ಯೆ")}</Text>
          {PROBLEMS.map((item) => (
            <View key={item.text} style={styles.row}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={styles.rowText}>{t(item.text)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.solutionCard]}>
          <Text style={[styles.cardTitle, styles.solutionTitle, { fontFamily: h3Font }]}>{t("ULUME ಏನು ನೀಡುತ್ತದೆ")}</Text>
          {SOLUTIONS.map((item) => (
            <View key={item.text} style={styles.row}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={[styles.rowText, styles.solutionText]}>{t(item.text)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate("Landing")}>
          <Text style={styles.continueBtnText}>{t("ಮುಂದುವರಿಸಿ")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  eyebrow: { ...typography.caption, color: colors.accentDark, fontWeight: "700", letterSpacing: 1 },
  headline: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 34 },
  card: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md, ...cardShadow },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  solutionCard: { backgroundColor: colors.primary },
  solutionTitle: { color: colors.white },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  rowIcon: { fontSize: 18, lineHeight: 22 },
  rowText: { ...typography.body, color: colors.textPrimary, flex: 1, lineHeight: 21 },
  solutionText: { color: colors.primaryLight },
  footer: { padding: spacing.screenPadding, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  continueBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  continueBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
