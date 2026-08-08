import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { createCropListing } from "../../services/firebase/firestore";
import { uploadCropPhoto } from "../../services/firebase/storage";
import { firestore } from "../../services/firebase/config";

export default function AddCropListingScreen({ navigation }) {
  const { user } = useAuthStore();
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [isOrganic, setIsOrganic] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = cropName.trim() && quantity && pricePerUnit;

  const handlePickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert("Missing details", "Please fill in crop name, quantity, and price.");
      return;
    }
    setSaving(true);
    try {
      const listingId = await createCropListing({
        farmerId: user.uid,
        farmerName: user.name || "",
        state: user.state || "",
        district: user.district || "",
        cropName: cropName.trim(),
        variety: variety.trim(),
        quantity: Number(quantity),
        unit: "kg",
        pricePerUnit: Number(pricePerUnit),
        harvestDate: harvestDate.trim(),
        imageUrl: imageUrl.trim() || null,
        isOrganic,
      });

      if (photoUri) {
        const uploadedUrl = await uploadCropPhoto(user.uid, listingId, photoUri);
        await firestore().collection("cropListings").doc(listingId).update({ imageUrl: uploadedUrl });
      }

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

      <Text style={styles.label}>Quantity (kg)</Text>
      <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="e.g. 500" keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Price per kg (₹)</Text>
      <TextInput style={styles.input} value={pricePerUnit} onChangeText={setPricePerUnit} placeholder="e.g. 25" keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Harvest date</Text>
      <TextInput style={styles.input} value={harvestDate} onChangeText={setHarvestDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Image URL</Text>
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" placeholderTextColor={colors.textMuted} />

      <Text style={styles.orLabel}>Or upload crop photo:</Text>
      <TouchableOpacity style={styles.photoUpload} onPress={handlePickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoUploadText}>⬆ Upload crop photo</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Organically grown</Text>
        <Switch value={isOrganic} onValueChange={setIsOrganic} trackColor={{ true: colors.primaryMid }} />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>+ Add</Text>}
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
  orLabel: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  photoUpload: { borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", borderRadius: spacing.buttonRadius, alignItems: "center", justifyContent: "center", minHeight: 64, marginTop: spacing.xs, overflow: "hidden" },
  photoUploadText: { ...typography.caption, color: colors.textMuted },
  photoPreview: { width: "100%", height: 110 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg },
  switchLabel: { ...typography.body, color: colors.textPrimary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
