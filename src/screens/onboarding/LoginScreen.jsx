import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { loginWithEmail } from "../../services/firebase/auth";
import { useT } from "../../i18n/useT";
import { useHeadingFont } from "../../theme/useHeadingFont";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches scripts/seedDemoAccounts.js — run `npm run seed:demo` once against
// this Firebase project to create these accounts before the buttons work.
const DEMO_ACCOUNTS = [
  { role: "Farmer", email: "farmer1@ulume.com" },
  { role: "Buyer", email: "buyer@ulume.com" },
  { role: "Vendor", email: "vendor@ulume.com" },
  { role: "Admin", email: "admin@ulume.com" },
];
const DEMO_PASSWORD = "Demo@1234";

export default function LoginScreen({ navigation }) {
  const t = useT();
  const h2Font = useHeadingFont("h2");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const attemptLogin = async (loginEmail, loginPassword) => {
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(loginEmail.trim(), loginPassword);
      // AppNavigator's onAuthStateChanged listener picks this up and routes
      // to the right dashboard once it loads the matching profile.
    } catch (e) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    attemptLogin(email, password);
  };

  const handleDemoLogin = (demo) => {
    if (demo.role === "Admin") {
      Alert.alert(
        "Admin dashboard",
        "Admin tools (user verification, product approval) live in the ULUME web admin panel, not this app."
      );
      return;
    }
    setEmail(demo.email);
    setPassword(DEMO_PASSWORD);
    attemptLogin(demo.email, DEMO_PASSWORD);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { fontFamily: h2Font }]}>{t("ಮತ್ತೆ ಸ್ವಾಗತ")}</Text>
      <Text style={styles.subtitle}>{t("ಮುಂದುವರಿಯಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.")}</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>{t("ಇಮೇಲ್")}</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("ಪಾಸ್‌ವರ್ಡ್")}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
          <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitBtnText}>{t("ಸೈನ್ ಇನ್")}</Text>}
      </TouchableOpacity>

      <Text style={styles.demoLabel}>{t("ಡೆಮೊ ಖಾತೆ ಪ್ರಯತ್ನಿಸಿ:")}</Text>
      <View style={styles.demoGrid}>
        {DEMO_ACCOUNTS.map((demo) => (
          <TouchableOpacity
            key={demo.role}
            style={styles.demoBtn}
            onPress={() => handleDemoLogin(demo)}
            disabled={loading}
          >
            <Text style={styles.demoBtnText}>{demo.role}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupLinkText}>{t("ಖಾತೆ ಇಲ್ಲವೇ? ಒಂದನ್ನು ರಚಿಸಿ")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenPadding, paddingTop: spacing.xl * 1.5, paddingBottom: spacing.xl },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  errorBanner: { backgroundColor: "#FDECEA", padding: spacing.md, borderRadius: spacing.cardRadius, marginBottom: spacing.md },
  errorBannerText: { ...typography.caption, color: colors.error },
  label: { ...typography.caption, color: colors.textPrimary, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, backgroundColor: colors.white, ...typography.body, color: colors.textPrimary },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, backgroundColor: colors.white },
  passwordInput: { flex: 1, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  eyeBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  eyeIcon: { fontSize: 18 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  submitBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  demoLabel: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xl, marginBottom: spacing.sm, textAlign: "center" },
  demoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "space-between" },
  demoBtn: { width: "48%", borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, paddingVertical: spacing.sm, alignItems: "center", backgroundColor: colors.white, minHeight: spacing.minTouchTarget - 8, justifyContent: "center" },
  demoBtnText: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  signupLink: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  signupLinkText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
});
