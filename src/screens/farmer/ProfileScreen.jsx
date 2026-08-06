import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { signOutUser, createFarmerProfile } from "../../services/firebase/auth";
import { useAppStore } from "../../store/appStore";

const LANGUAGES = [
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

export default function ProfileScreen() {
  const { user, setUser, clearAuth } = useAuthStore();
  const { language, setLanguage } = useAppStore();
  const [name, setName] = useState(user?.name || "");
  const [village, setVillage] = useState(user?.village || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await createFarmerProfile(user.uid, { name, village });
      setUser({ ...user, ...updated });
      Alert.alert("ಯಶಸ್ಸು", "ಪ್ರೊಫೈಲ್ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("ಲಾಗ್‌ಔಟ್", "ನೀವು ಖಚಿತವಾಗಿ ಲಾಗ್‌ಔಟ್ ಮಾಡಬೇಕೆ?", [
      { text: "ಇಲ್ಲ", style: "cancel" },
      { text: "ಹೌದು", onPress: async () => { await signOutUser(); clearAuth(); } },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding }}>
      <Text style={styles.title}>ಪ್ರೊಫೈಲ್</Text>

      <View style={styles.avatarWrap}>
        <Text style={styles.avatar}>🧑‍🌾</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      <Text style={styles.label}>ಹೆಸರು</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="ನಿಮ್ಮ ಹೆಸರು" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>ಗ್ರಾಮ</Text>
      <TextInput style={styles.input} value={village} onChangeText={setVillage} placeholder="ನಿಮ್ಮ ಗ್ರಾಮ" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>ಭಾಷೆ</Text>
      <View style={styles.langRow}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langChip, language === l.code && styles.langChipActive]}
            onPress={() => setLanguage(l.code)}
          >
            <Text style={[styles.langChipText, language === l.code && styles.langChipTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? "ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "ಉಳಿಸಿ"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>ಲಾಗ್‌ಔಟ್</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  avatarWrap: { alignItems: "center", marginBottom: spacing.lg },
  avatar: { fontSize: 56 },
  phone: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  langRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  langChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  langChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  langChipText: { ...typography.body, color: colors.textMuted },
  langChipTextActive: { color: colors.primary, fontWeight: "700" },
  saveBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  logoutBtn: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  logoutBtnText: { color: colors.error, fontWeight: "700" },
});
