import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { verifyOTP, sendOTP, createFarmerProfile, createSellerProfile } from "../../services/firebase/auth";
import { useAuthStore } from "../../store/authStore";

export default function OTPScreen({ route, navigation }) {
  const { phone, role } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const setUser = useAuthStore((s) => s.setUser);
  const setSeller = useAuthStore((s) => s.setSeller);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const firebaseUser = await verifyOTP(code);
      if (role === "seller") {
        const seller = await createSellerProfile(firebaseUser.uid, {
          phone,
          ownerName: "",
          shopName: "",
          shopNameKannada: "",
        });
        setSeller(seller);
      } else {
        const farmer = await createFarmerProfile(firebaseUser.uid, {
          phone,
          name: "",
          language: "kn",
        });
        setUser(farmer);
      }
    } catch (e) {
      Alert.alert("ತಪ್ಪು OTP", "ಸರಿಯಾದ OTP ಹಾಕಿ, ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSeconds(30);
    try {
      await sendOTP(phone);
    } catch (e) {
      Alert.alert("ದೋಷ", "OTP ಮತ್ತೊಮ್ಮೆ ಕಳುಹಿಸಲು ಆಗಲಿಲ್ಲ.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP ಹಾಕಿ</Text>
      <Text style={styles.subtitle}>{phone} ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ</Text>

      <TextInput
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholder="••••••"
        placeholderTextColor={colors.textMuted}
        autoFocus
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>ಪರಿಶೀಲಿಸಿ</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={seconds > 0} style={styles.resendWrap}>
        <Text style={styles.resendText}>
          {seconds > 0 ? `${seconds} ಸೆಕೆಂಡ್‌ನಲ್ಲಿ ಮತ್ತೆ ಕಳುಹಿಸಿ` : "OTP ಮತ್ತೆ ಕಳುಹಿಸಿ"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding, justifyContent: "center" },
  title: { ...typography.h2, color: colors.primary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.xl },
  otpInput: {
    ...typography.h1,
    textAlign: "center",
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.buttonRadius,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: spacing.buttonRadius,
    paddingVertical: spacing.md,
    alignItems: "center",
    minHeight: spacing.minTouchTarget,
    justifyContent: "center",
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  resendWrap: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  resendText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
});
