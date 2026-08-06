import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { sendOTP } from "../../services/firebase/auth";

export default function PhoneLoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert("ತಪ್ಪು ಸಂಖ್ಯೆ", "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ನಂಬರ್ ಹಾಕಿ");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(`+91${phone}`);
      navigation.navigate("OTP", { phone: `+91${phone}`, role });
    } catch (e) {
      Alert.alert("ದೋಷ", "OTP ಕಳುಹಿಸಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ನಿಮ್ಮ ಮೊಬೈಲ್ ನಂಬರ್ ಹಾಕಿ</Text>

      <View style={styles.roleRow}>
        {[
          { key: "farmer", label: "🧑‍🌾 ರೈತ" },
          { key: "seller", label: "🏪 ಮಾರಾಟಗಾರ" },
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

      <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>OTP ಕಳುಹಿಸಿ</Text>}
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
