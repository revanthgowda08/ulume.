import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const SOIL_TYPES = ["Black", "Red", "Alluvial", "Laterite", "Sandy"];
const SEASONS = ["Kharif", "Rabi", "Zaid"];

export default function CropAdvisorScreen({ navigation }) {
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [season, setSeason] = useState(SEASONS[0]);
  const [landSize, setLandSize] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Crop Advisor</Text>
      </View>

      <Text style={styles.label}>Soil type</Text>
      <View style={styles.chipRow}>
        {SOIL_TYPES.map((s) => (
          <TouchableOpacity key={s} style={[styles.chip, soilType === s && styles.chipActive]} onPress={() => setSoilType(s)}>
            <Text style={[styles.chipText, soilType === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Season</Text>
      <View style={styles.chipRow}>
        {SEASONS.map((s) => (
          <TouchableOpacity key={s} style={[styles.chip, season === s && styles.chipActive]} onPress={() => setSeason(s)}>
            <Text style={[styles.chipText, season === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Land size (acres)</Text>
      <TextInput style={styles.input} value={landSize} onChangeText={setLandSize} keyboardType="numeric" placeholder="e.g. 5" placeholderTextColor={colors.textMuted} />

      <TouchableOpacity style={styles.submitBtn} onPress={() => setSubmitted(true)}>
        <Text style={styles.submitBtnText}>Get Recommendation</Text>
      </TouchableOpacity>

      {submitted && (
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>🚧</Text>
          <Text style={styles.resultTitle}>Coming soon</Text>
          <Text style={styles.resultBody}>
            AI-powered crop recommendations are still being built. This screen is a placeholder for that feature —
            check back in a future update.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, fontSize: 20 },
  label: { ...typography.caption, color: colors.textPrimary, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  chipText: { ...typography.body, color: colors.textMuted },
  chipTextActive: { color: colors.primary, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, backgroundColor: colors.white, ...typography.body, color: colors.textPrimary },
  submitBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  submitBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  resultCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.lg, marginTop: spacing.lg, alignItems: "center" },
  resultIcon: { fontSize: 32, marginBottom: spacing.sm },
  resultTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  resultBody: { ...typography.body, color: colors.textMuted, textAlign: "center" },
});
