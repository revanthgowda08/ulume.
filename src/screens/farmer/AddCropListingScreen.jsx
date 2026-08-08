import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { createCropListing } from "../../services/firebase/firestore";

const UNITS = ["kg", "quintal", "tonne"];

export default function AddCropListingScreen({ navigation }) {
  const { user } = useAuthStore();
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = cropName.trim() && quantity && pricePerUnit;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert("Missing details", "Please fill in crop name, quantity, and price.");
      return;
    }
    setSaving(true);
    try {
      await createCropListing({
        farmerId: user.uid,
        farmerName: user.name || "",
        state: user.state || "",
        district: user.district || "",
        cropName: cropName.trim(),
        variety: variety.trim(),
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        isOrganic,
      });
      Alert.alert("Listed", "Your crop is now visible to buyers.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Couldn't save the listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>List Your Harvest</Text>
      </View>

      <Text style={styles.label}>Crop name</Text>
      <TextInput style={styles.input} value={cropName} onChangeText={setCropName} placeholder="e.g. Tomato" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Variety (optional)</Text>
      <TextInput style={styles.input} value={variety} onChangeText={setVariety} placeholder="e.g. Hybrid" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="e.g. 500" keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Unit</Text>
      <View style={styles.unitRow}>
        {UNITS.map((u) => (
          <TouchableOpacity key={u} style={[styles.unitChip, unit === u && styles.unitChipActive]} onPress={() => setUnit(u)}>
            <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Price per {unit} (₹)</Text>
      <TextInput style={styles.input} value={pricePerUnit} onChangeText={setPricePerUnit} placeholder="e.g. 25" keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Organically grown</Text>
        <Switch value={isOrganic} onValueChange={setIsOrganic} trackColor={{ true: colors.primaryMid }} />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>List Crop</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary },
  label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  unitRow: { flexDirection: "row", gap: spacing.sm },
  unitChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  unitChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  unitChipText: { ...typography.body, color: colors.textMuted, textTransform: "capitalize" },
  unitChipTextActive: { color: colors.primary, fontWeight: "700" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg },
  switchLabel: { ...typography.body, color: colors.textPrimary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
