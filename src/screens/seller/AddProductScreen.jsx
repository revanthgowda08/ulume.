import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { uploadProductImage, uploadAudioClip } from "../../services/firebase/storage";
import { createProduct } from "../../services/firebase/firestore";
import { firestore } from "../../services/firebase/config";
import { getGeohash } from "../../utils/geoUtils";
import { useT } from "../../i18n/useT";

const GOOGLE_TRANSLATE_KEY = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_KEY;
const GOOGLE_TTS_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY;

const CATEGORIES = [
  { key: "seeds", label: "ಬೀಜ / Seeds" },
  { key: "fertilizers", label: "ಗೊಬ್ಬರ / Fertilizers" },
  { key: "pesticides", label: "ಕೀಟನಾಶಕ / Pesticides" },
  { key: "irrigation", label: "ನೀರಾವರಿ / Irrigation" },
  { key: "tools", label: "ಉಪಕರಣ / Tools" },
  { key: "machinery", label: "ಯಂತ್ರ / Machinery" },
  { key: "animal_feed", label: "ಜಾನುವಾರು ಆಹಾರ / Animal Feed" },
  { key: "storage", label: "ಸಂಗ್ರಹ / Storage" },
];

export default function AddProductScreen({ navigation }) {
  const seller = useAuthStore((s) => s.seller);
  const [images, setImages] = useState([null, null, null, null, null]);
  const [name, setName] = useState("");
  const [nameKannada, setNameKannada] = useState("");
  const [translating, setTranslating] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("kg");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const t = useT();

  const handlePickImage = async (index) => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) {
      const next = [...images];
      next[index] = result.assets[0].uri;
      setImages(next);
    }
  };

  const handleAutoTranslate = async () => {
    if (!name.trim()) return;
    setTranslating(true);
    try {
      const res = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`,
        { q: name, source: "en", target: "kn", format: "text" }
      );
      setNameKannada(res.data.data.translations[0].translatedText);
    } catch (e) {
      Alert.alert(t("ದೋಷ"), t("ಅನುವಾದ ಆಗಲಿಲ್ಲ"));
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !nameKannada.trim() || !price || !stock) {
      Alert.alert(t("ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ"));
      return;
    }
    setSaving(true);
    try {
      const geohash = seller?.location ? getGeohash(seller.location.latitude, seller.location.longitude) : null;
      const productId = await createProduct({
        sellerId: seller.uid,
        sellerName: seller.shopName,
        sellerNameKannada: seller.shopNameKannada,
        sellerPhone: seller.phone,
        district: seller.district,
        location: seller.location || null,
        geohash,
        name,
        nameKannada,
        category,
        price: Number(price),
        mrp: Number(mrp) || Number(price),
        stock: Number(stock),
        unit,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        if (images[i]) uploadedUrls.push(await uploadProductImage(seller.uid, productId, images[i], i));
      }

      let audioUrl = null;
      try {
        const ttsRes = await axios.post(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
          { input: { text: nameKannada }, voice: { languageCode: "kn-IN", ssmlGender: "FEMALE" }, audioConfig: { audioEncoding: "MP3" } }
        );
        const tmpPath = `${FileSystem.cacheDirectory}tts_${productId}.mp3`;
        await FileSystem.writeAsStringAsync(tmpPath, ttsRes.data.audioContent, { encoding: FileSystem.EncodingType.Base64 });
        audioUrl = await uploadAudioClip(`sellers/${seller.uid}/products/${productId}/audio.mp3`, tmpPath);
      } catch (e) {
        // Audio generation is best-effort; product save should not fail because of it.
      }

      await firestore().collection("products").doc(productId).update({
        images: uploadedUrls,
        ...(audioUrl ? { audioUrlKannada: audioUrl } : {}),
      });

      Alert.alert(t("ಯಶಸ್ಸು"), t("ಉತ್ಪನ್ನ ಸೇರಿಸಲಾಗಿದೆ"), [
        { text: t("ಸರಿ"), onPress: () => navigation.replace("ProductList") },
      ]);
    } catch (e) {
      console.error("createProduct failed:", e);
      Alert.alert(t("ದೋಷ"), t("ಉಳಿಸಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding, paddingBottom: spacing.xl * 2 }}>
      <Text style={styles.title}>{t("ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ")}</Text>

      <View style={styles.photoRow}>
        {images.map((uri, i) => (
          <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => handlePickImage(i)}>
            {uri ? <Image source={{ uri }} style={styles.photoImage} /> : <Text style={styles.photoPlus}>+</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t("ಹೆಸರು")} (English)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Urea 45kg" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>{t("ಹೆಸರು")} (ಕನ್ನಡ)</Text>
      <View style={styles.translateRow}>
        <TextInput style={[styles.input, { flex: 1 }]} value={nameKannada} onChangeText={setNameKannada} placeholder="ಯೂರಿಯಾ 45 ಕೆಜಿ" placeholderTextColor={colors.textMuted} />
        <TouchableOpacity style={styles.translateBtn} onPress={handleAutoTranslate} disabled={translating}>
          {translating ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.translateBtnText}>🌐</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{t("ವಿಭಾಗ")}</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {CATEGORIES.map((c) => (
            <Picker.Item key={c.key} label={c.label} value={c.key} />
          ))}
        </Picker>
      </View>

      <View style={styles.rowGap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("ಬೆಲೆ")} (₹)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="500" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>MRP (₹)</Text>
          <TextInput style={styles.input} value={mrp} onChangeText={setMrp} keyboardType="numeric" placeholder="550" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <View style={styles.rowGap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("ಸ್ಟಾಕ್")}</Text>
          <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="100" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t("ಯೂನಿಟ್")}</Text>
          <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="kg / bag / litre" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <Text style={styles.label}>{t("ಟ್ಯಾಗ್")} (comma separated)</Text>
      <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="urea, fertilizer" placeholderTextColor={colors.textMuted} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>{t("ಉಳಿಸಿ")}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  photoRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  photoSlot: { width: 56, height: 56, borderRadius: spacing.buttonRadius, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photoImage: { width: "100%", height: "100%" },
  photoPlus: { fontSize: 24, color: colors.textMuted },
  label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  translateRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  translateBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, backgroundColor: colors.primaryLight, borderRadius: spacing.buttonRadius, alignItems: "center", justifyContent: "center" },
  translateBtnText: { fontSize: 18 },
  pickerWrap: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius },
  rowGap: { flexDirection: "row", gap: spacing.md },
  saveBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
