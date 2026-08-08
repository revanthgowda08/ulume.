import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { signUpWithEmail, createFarmerProfile, createSellerProfile, createBuyerProfile } from "../../services/firebase/auth";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

const ROLES = [
  { key: "farmer", icon: "🌱", title: "Farmer", subtitle: "Sell your harvest" },
  { key: "buyer", icon: "🧺", title: "Buyer", subtitle: "Restaurants, retailers, exporters" },
  { key: "seller", icon: "🏪", title: "Vendor", subtitle: "Sell agri-inputs" },
  { key: "admin", icon: "🛡️", title: "Admin", subtitle: "Platform admin" },
];

export default function SignupScreen({ navigation }) {
  const [role, setRole] = useState("farmer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleCreateAccount = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password || !state.trim() || !district.trim()) {
      Alert.alert("Missing info", "Please fill in every field.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
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
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Pick a role to get started.</Text>

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

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.textMuted} />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>State</Text>
          <TextInput style={styles.input} value={state} onChangeText={setState} placeholderTextColor={colors.textMuted} />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>District</Text>
          <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAccount} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitBtnText}>Create account</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
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
  submitBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  submitBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  loginLink: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loginLinkText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
});
