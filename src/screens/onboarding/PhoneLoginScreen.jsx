import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { loginWithPhone, createFarmerProfile, createSellerProfile } from "../../services/firebase/auth";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";

export default function PhoneLoginScreen() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setSeller = useAuthStore((s) => s.setSeller);
  const language = useAppStore((s) => s.language);
  const t = useT();

  const handleContinue = async () => {
    if (phone.length !== 10) {
      Alert.alert(t("ತಪ್ಪು ಸಂಖ್ಯೆ"), t("10 ಅಂಕಿಯ ಮೊಬೈಲ್ ನಂಬರ್ ಹಾಕಿ"));
      return;
    }
    setLoading(true);
    try {
      const { user } = await loginWithPhone(`+91${phone}`);
      if (role === "seller") {
        const seller = await createSellerProfile(user.uid, {
          phone: `+91${phone}`,
          ownerName: "",
          shopName: "",
          shopNameKannada: "",
        });
        setSeller(seller);
      } else {
        const farmer = await createFarmerProfile(user.uid, {
          phone: `+91${phone}`,
          name: "",
          language,
        });
        setUser(farmer);
      }
      // AppNavigator's onAuthStateChanged listener also picks this up and
      // routes to FarmerNavigator/SellerNavigator once userType is set.
    } catch (e) {
      Alert.alert(t("ದೋಷ"), t("ಲಾಗಿನ್ ಆಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("ನಿಮ್ಮ ಮೊಬೈಲ್ ನಂಬರ್ ಹಾಕಿ")}</Text>

      <View style={styles.roleRow}>
        {[
          { key: "farmer", label: `🧑‍🌾 ${t("ರೈತ")}` },
          { key: "seller", label: `🏪 ${t("ಮಾರಾಟಗಾರ")}` },
        ].map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
            onPress={() => setRole(r.key)}
          >
            <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          placeholder="9876543210"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{t("ಮುಂದುವರಿಸಿ")}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding, justifyContent: "center" },
  title: { ...typography.h2, color: colors.primary, marginBottom: spacing.lg },
  roleRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.buttonRadius,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  roleBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  roleText: { ...typography.body, color: colors.textMuted },
  roleTextActive: { color: colors.primary, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.buttonRadius,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  countryCode: { ...typography.h3, color: colors.textPrimary, marginRight: spacing.sm },
  input: { ...typography.h3, flex: 1, paddingVertical: spacing.md, color: colors.textPrimary },
  button: {
    backgroundColor: colors.primary,
    borderRadius: spacing.buttonRadius,
    paddingVertical: spacing.md,
    alignItems: "center",
    minHeight: spacing.minTouchTarget,
    justifyContent: "center",
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
