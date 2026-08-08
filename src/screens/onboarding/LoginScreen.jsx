import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { loginWithEmail } from "../../services/firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      // AppNavigator's onAuthStateChanged listener picks this up and routes
      // to the right dashboard once it loads the matching profile.
    } catch (e) {
      Alert.alert("Login failed", "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue.</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.textMuted} />

      <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitBtnText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupLinkText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.screenPadding, justifyContent: "center" },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { ...typography.caption, color: colors.textPrimary, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, backgroundColor: colors.white, ...typography.body, color: colors.textPrimary },
  submitBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  submitBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  signupLink: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  signupLinkText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
});
