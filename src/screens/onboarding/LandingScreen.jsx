import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";
import { useHeadingFont } from "../../theme/useHeadingFont";

export default function LandingScreen({ navigation }) {
  const t = useT();
  const { language, setLanguage } = useAppStore();
  const h1Font = useHeadingFont("h1");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding, paddingTop: spacing.xl * 1.5 }}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLeaf}>🍃</Text>
          </View>
          <Text style={styles.wordmark}>ULUME</Text>
        </View>

        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langChip, language === "kn" && styles.langChipActive]}
            onPress={() => setLanguage("kn")}
          >
            <Text style={[styles.langChipText, language === "kn" && styles.langChipTextActive]}>ಕನ್ನಡ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, language === "en" && styles.langChipActive]}
            onPress={() => setLanguage("en")}
          >
            <Text style={[styles.langChipText, language === "en" && styles.langChipTextActive]}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.headline, { fontFamily: h1Font }]}>
        {t("ಮಣ್ಣಿನಲ್ಲಿ ಬೇರೂರಿದೆ.")}{"\n"}
        <Text style={styles.headlineAccent}>{t("ಭಾರತಕ್ಕಾಗಿ ಬೆಳೆದಿದೆ.")}</Text>
      </Text>

      <Text style={styles.body}>
        {t("ಮಣ್ಣಿನಿಂದ ಅಂಗಡಿಯವರೆಗೆ — ಭಾರತದ ವಿಶ್ವಾಸಾರ್ಹ ಕೃಷಿ ವಾಣಿಜ್ಯ ವೇದಿಕೆ. ಬೀಜ, ಯಂತ್ರ, ಗೊಬ್ಬರ ಖರೀದಿಸಿ. ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ರೆಸ್ಟೋರೆಂಟ್, ರಫ್ತುದಾರರು ಮತ್ತು ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳಿಗೆ ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ.")}
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.primaryBtnText}>🛍️ {t("ಮಾರುಕಟ್ಟೆ ನೋಡಿ")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Signup", { lockedRole: "farmer" })}>
        <Text style={styles.secondaryBtnText}>🌱 {t("ರೈತರಾಗಿ ಸೇರಿ")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLinkText}>{t("ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ")}</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12,000+</Text>
          <Text style={styles.statLabel}>{t("ರೈತರು")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹4.2 Cr</Text>
          <Text style={styles.statLabel}>{t("ವ್ಯಾಪಾರವಾಗಿದೆ")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>98%</Text>
          <Text style={styles.statLabel}>{t("ತೃಪ್ತರು")}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logoMark: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logoLeaf: { fontSize: 18 },
  wordmark: { ...typography.h2, fontSize: 22, color: colors.primary },
  langToggle: { flexDirection: "row", backgroundColor: colors.grayLight, borderRadius: 20, padding: 3, gap: 2 },
  langChip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 16 },
  langChipActive: { backgroundColor: colors.primary },
  langChipText: { ...typography.caption, color: colors.textMuted, fontWeight: "700" },
  langChipTextActive: { color: colors.white },
  headline: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
  headlineAccent: { color: colors.primaryMid },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl, lineHeight: 24 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginBottom: spacing.sm, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  secondaryBtnText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  loginLink: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loginLinkText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xl, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  statItem: { alignItems: "center" },
  statValue: { ...typography.h2, fontSize: 22, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
