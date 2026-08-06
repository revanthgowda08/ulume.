import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";

const LANGUAGES = [
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

export default function LanguageSelectScreen({ navigation }) {
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useT();

  const handleSelect = (code) => {
    setLanguage(code);
    navigation.replace("PhoneLogin");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ")}</Text>
      <Text style={styles.subtitle}>Select your language</Text>
      <View style={styles.grid}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity key={lang.code} style={styles.card} onPress={() => handleSelect(lang.code)}>
            <Text style={styles.cardText}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding, justifyContent: "center" },
  title: { ...typography.h2, color: colors.primary, textAlign: "center" },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: 4, marginBottom: spacing.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.md },
  card: {
    width: "47%",
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.cardRadius,
    paddingVertical: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.md,
    minHeight: spacing.minTouchTarget * 1.5,
    justifyContent: "center",
  },
  cardText: { ...typography.h3, color: colors.primary },
});
