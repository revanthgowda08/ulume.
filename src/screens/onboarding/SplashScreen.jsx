import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { useT } from "../../i18n/useT";

export default function SplashScreen({ navigation }) {
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("LanguageSelect"), 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ULUME</Text>
      <Text style={styles.tagline}>{t("ರೈತರಿಗಾಗಿ, ರೈತರ ಮಾತಿನಲ್ಲಿ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logo: { ...typography.h1, fontSize: 40, color: colors.white, letterSpacing: 2 },
  tagline: { ...typography.body, color: colors.primaryLight, marginTop: 12 },
});
