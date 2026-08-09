import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { signUpWithEmail, createFarmerProfile, createSellerProfile, createBuyerProfile } from "../../services/firebase/auth";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";
import { useHeadingFont } from "../../theme/useHeadingFont";

const ROLES = [
  { key: "farmer", icon: "🌱", title: "Farmer", subtitle: "Sell your harvest" },
  { key: "buyer", icon: "🧺", title: "Buyer", subtitle: "Restaurants, retailers, exporters" },
  { key: "seller", icon: "🏪", title: "Vendor", subtitle: "Sell agri-inputs" },
  { key: "admin", icon: "🛡️", title: "Admin", subtitle: "Platform admin" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen({ navigation, route }) {
  const t = useT();
  const h2Font = useHeadingFont("h2");
  const lockedRole = route?.params?.lockedRole || null;
  const [role, setRole] = useState(lockedRole || "farmer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setUser = useAuthStore((s) => s.setUser);
  const setSeller = useAuthStore((s) => s.setSeller);
  const setBuyer = useAuthStore((s) => s.setBuyer);
  const language = useAppStore((s) => s.language);

  const handleRolePress = (key) => {
    if (key === "admin") {
      Alert.alert(
        "Admin accounts",
        "Admin accounts are provisioned separately for security and aren't available through self-signup. Contact the ULUME team to request access."
      );
      return;
    }
    setRole(key);
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!/^\d{10}$/.test(phone.trim())) next.phone = "Enter a 10-digit phone number.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!state.trim()) next.state = "Enter your state.";
    if (!district.trim()) next.district = "Enter your district.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const firebaseUser = await signUpWithEmail(email.trim(), password);
      const baseData = { name: name.trim(), phone: phone.trim(), email: email.trim(), state: state.trim(), district: district.trim(), language };

      if (role === "buyer") {
        const buyer = await createBuyerProfile(firebaseUser.uid, baseData);
        setBuyer(buyer);
      } else if (role === "seller") {
        const seller = await createSellerProfile(firebaseUser.uid, {
          ...baseData,
          ownerName: name.trim(),
          shopName: "",
          shopNameKannada: "",
        });
        setSeller(seller);
      } else {
        const farmer = await createFarmerProfile(firebaseUser.uid, baseData);
        setUser(farmer);
      }
    } catch (e) {
      const message =
        e.code === "auth/email-already-in-use"
          ? "That email is already registered. Try logging in instead."
          : e.code === "auth/invalid-email"
          ? "Enter a valid email address."
          : "Couldn't create your account. Please try again.";
      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding, paddingBottom: spacing.xl }}>
      <Text style={[styles.title, { fontFamily: h2Font }]}>{lockedRole ? t("ರೈತರಾಗಿ ಸೇರಿಕೊಳ್ಳಿ") : t("ಖಾತೆ ರಚಿಸಿ")}</Text>
      <Text style={styles.subtitle}>{lockedRole ? t("ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಪಟ್ಟಿ ಮಾಡಿ, ಖರೀದಿದಾರರನ್ನು ನೇರವಾಗಿ ತಲುಪಿ.") : t("ಪ್ರಾರಂಭಿಸಲು ಒಂದು ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ.")}</Text>

      {!lockedRole && (
        <View style={styles.roleGrid}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleCard, role === r.key && styles.roleCardActive]}
              onPress={() => handleRolePress(r.key)}
            >
              <Text style={styles.roleIcon}>{r.icon}</Text>
              <Text style={styles.roleTitle}>{r.title}</Text>
              <Text style={styles.roleSubtitle}>{r.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>{t("ಪೂರ್ಣ ಹೆಸರು")}</Text>
          <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>{t("ಫೋನ್")}</Text>
          <TextInput style={[styles.input, errors.phone && styles.inputError]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholderTextColor={colors.textMuted} />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>
      </View>

      <Text style={styles.label}>{t("ಇಮೇಲ್")}</Text>
      <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>{t("ಪಾಸ್‌ವರ್ಡ್")}</Text>
      <View style={[styles.passwordRow, errors.password && styles.inputError]}>
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
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>{t("ರಾಜ್ಯ")}</Text>
          <TextInput style={[styles.input, errors.state && styles.inputError]} value={state} onChangeText={setState} placeholderTextColor={colors.textMuted} />
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>{t("ಜಿಲ್ಲೆ")}</Text>
          <TextInput style={[styles.input, errors.district && styles.inputError]} value={district} onChangeText={setDistrict} placeholderTextColor={colors.textMuted} />
          {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAccount} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitBtnText}>{t("ಖಾತೆ ರಚಿಸಿ")}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLinkText}>{t("ಖಾತೆ ಈಗಾಗಲೇ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg },
  roleCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 90,
  },
  roleCardActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  roleIcon: { fontSize: 22, marginBottom: 4 },
  roleTitle: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  roleSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: "row", gap: spacing.md },
  col: { flex: 1 },
  label: { ...typography.caption, color: colors.textPrimary, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, backgroundColor: colors.white, ...typography.body, color: colors.textPrimary },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, backgroundColor: colors.white },
  passwordInput: { flex: 1, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  eyeBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  eyeIcon: { fontSize: 18 },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: 4 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  submitBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  loginLink: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loginLinkText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
});
