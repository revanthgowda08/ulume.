import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { useT } from "../../i18n/useT";

export default function SplashScreen({ navigation }) {
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("ProblemSolution"), 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoMark}>
        <Text style={styles.logoLeaf}>🍃</Text>
      </View>
      <Text style={styles.logo}>ULUME</Text>
      <Text style={styles.tagline}>{t("ರೈತರಿಗಾಗಿ, ರೈತರ ಮಾತಿನಲ್ಲಿ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logoMark: { width: 72, height: 72, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  logoLeaf: { fontSize: 36 },
  logo: { ...typography.h1, fontSize: 40, color: colors.white, letterSpacing: 2 },
  tagline: { ...typography.body, color: colors.primaryLight, marginTop: 12 },
});
