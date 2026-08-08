import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

export default function DiseaseDetectionScreen({ navigation }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const handlePickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setChecked(false);
    }
  };

  const handleCheck = () => {
    setChecking(true);
    // Placeholder only — no image is analyzed. Real detection isn't built yet.
    setTimeout(() => {
      setChecking(false);
      setChecked(true);
    }, 600);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Disease Detection</Text>
      </View>

      <Text style={styles.instructions}>Take or choose a clear photo of the affected leaf or crop.</Text>

      <TouchableOpacity style={styles.photoUpload} onPress={handlePickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoUploadText}>⬆ Upload crop photo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.checkBtn, !photoUri && styles.checkBtnDisabled]} onPress={handleCheck} disabled={!photoUri || checking}>
        {checking ? <ActivityIndicator color={colors.white} /> : <Text style={styles.checkBtnText}>Check for Issues</Text>}
      </TouchableOpacity>

      {checked && (
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>🚧</Text>
          <Text style={styles.resultTitle}>Coming soon</Text>
          <Text style={styles.resultBody}>
            Photo-based disease detection isn't live yet — this screen is a placeholder for that feature. Your
            photo wasn't analyzed. Check back in a future update, and for now consult your local Krishi Vigyan
            Kendra or agri-input vendor.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, fontSize: 20 },
  instructions: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
  photoUpload: { borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", borderRadius: spacing.buttonRadius, alignItems: "center", justifyContent: "center", minHeight: 180, backgroundColor: colors.white, overflow: "hidden" },
  photoUploadText: { ...typography.body, color: colors.textMuted },
  photoPreview: { width: "100%", height: 220 },
  checkBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  checkBtnDisabled: { opacity: 0.5 },
  checkBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  resultCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.lg, marginTop: spacing.lg, alignItems: "center" },
  resultIcon: { fontSize: 32, marginBottom: spacing.sm },
  resultTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  resultBody: { ...typography.body, color: colors.textMuted, textAlign: "center" },
});
