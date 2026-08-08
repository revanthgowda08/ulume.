import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import VoiceButton from "../../components/VoiceButton";
import ProductCard from "../../components/ProductCard";
import LazyImage from "../../components/LazyImage";
import { useAppStore } from "../../store/appStore";
import { useCartStore } from "../../store/cartStore";
import { startRecording, stopAndTranscribe } from "../../services/voice/speechToText";
import { parseVoiceQuery } from "../../utils/voiceQueryParser";
import { getNearbyProducts, getNearbySellersGeo } from "../../utils/geoUtils";
import { formatDistance } from "../../utils/formatters";
import { useT } from "../../i18n/useT";

const CATEGORIES = [
  { key: "seeds", icon: "🌱", label: "ಬೀಜ" },
  { key: "fertilizers", icon: "🧪", label: "ಗೊಬ್ಬರ" },
  { key: "pesticides", icon: "🐛", label: "ಕೀಟನಾಶಕ" },
  { key: "irrigation", icon: "💧", label: "ನೀರಾವರಿ" },
  { key: "tools", icon: "🔧", label: "ಉಪಕರಣ" },
  { key: "machinery", icon: "🚜", label: "ಯಂತ್ರ" },
  { key: "animal_feed", icon: "🐄", label: "ಜಾನುವಾರು ಆಹಾರ" },
  { key: "storage", icon: "🏬", label: "ಸಂಗ್ರಹ" },
];

const HELPLINE_NUMBER = "919999999999";

export default function HomeScreen({ navigation }) {
  const { district, location, setLocation, setDistrict } = useAppStore();
  const cartCount = useCartStore((s) => s.getCount());
  const [voiceState, setVoiceState] = useState("idle");
  const [searchText, setSearchText] = useState("");
  const [nearbySellers, setNearbySellers] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [recording, setRecording] = useState(null);
  const t = useT();

  useEffect(() => {
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      const pos = await Location.getCurrentPositionAsync({});
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setLocation(coords);
      const geocode = await Location.reverseGeocodeAsync(coords);
      if (geocode?.[0]?.subregion) setDistrict(geocode[0].subregion);
    })();
  }, []);

  useEffect(() => {
    if (!location) return;
    (async () => {
      const [products, sellers] = await Promise.all([
        getNearbyProducts([location.latitude, location.longitude], 10).catch(() => []),
        getNearbySellersGeo([location.latitude, location.longitude], 10).catch(() => []),
      ]);
      setPopularProducts(products.slice(0, 10));
      setNearbySellers(sellers.slice(0, 10));
    })();
  }, [location]);

  const runVoiceSearch = useCallback(
    async (results) => {
      setVoiceState("done");
      navigation.navigate("SearchResults", { products: results });
      setTimeout(() => setVoiceState("idle"), 1000);
    },
    [navigation]
  );

  const handleVoicePress = async () => {
    if (voiceState === "idle" || voiceState === "error" || voiceState === "done") {
      try {
        setVoiceState("listening");
        const rec = await startRecording();
        setRecording(rec);
        setTimeout(async () => {
          try {
            setVoiceState("processing");
            const transcript = await stopAndTranscribe(rec, "kn-IN");
            const keywords = parseVoiceQuery(transcript);
            const center = location ? [location.latitude, location.longitude] : null;
            const results = center ? await getNearbyProducts(center, 10) : [];
            const filtered = results.filter((p) =>
              keywords.some((k) => p.tags?.includes(k) || p.synonyms?.includes(k))
            );
            runVoiceSearch(filtered.length ? filtered : results);
          } catch (e) {
            setVoiceState("error");
            setTimeout(() => setVoiceState("idle"), 1500);
          }
        }, 2000);
      } catch (e) {
        setVoiceState("error");
        setTimeout(() => setVoiceState("idle"), 1500);
      }
    }
  };

  const handleTextSearch = () => {
    if (!searchText.trim()) return;
    navigation.navigate("SearchResults", { query: searchText.trim() });
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.primaryMid]} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.locationRow}>
              <Text style={styles.pin}>📍</Text>
              <Text style={styles.districtText} numberOfLines={1}>{district || t("ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...")}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${HELPLINE_NUMBER}`)} style={styles.iconBtn}>
                <Text style={styles.iconText}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.iconBtn}>
                <Text style={styles.iconText}>🛒</Text>
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <VoiceButton voiceState={voiceState} onPress={handleVoicePress} />

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("ಹುಡುಕಿ... (ಉದಾ: ಯೂರಿಯಾ)")}
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleTextSearch}
            />
            <TouchableOpacity style={styles.goBtn} onPress={handleTextSearch}>
              <Text style={styles.goBtnText}>{t("ಹೋಗಿ")}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.banner}>
          <Text style={styles.bannerText}>🌧️ {t("ಮಳೆಗಾಲ ಬಂತು — ಬಿತ್ತನೆ ಸಮಯ!")}</Text>
        </LinearGradient>

        <View style={styles.sellSection}>
          <TouchableOpacity style={styles.sellCard} onPress={() => navigation.navigate("MyCrops")}>
            <Text style={styles.sellCardIcon}>🌾</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellCardTitle}>Sell Your Harvest</Text>
              <Text style={styles.sellCardSub}>List crops for buyers to discover</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.leadsCard} onPress={() => navigation.navigate("BuyerLeads")}>
            <Text style={styles.sellCardIcon}>🤝</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellCardTitle}>Buyer Leads</Text>
              <Text style={styles.sellCardSub}>Requests from buyers</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoryCard}
                onPress={() => navigation.navigate("Category", { category: cat.key, label: cat.label })}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryLabel} numberOfLines={1}>{t(cat.label)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {nearbySellers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ನಿಮ್ಮ ಹತ್ತಿರ")}</Text>
            <FlatList
              data={nearbySellers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.sellerCard}>
                  <LazyImage uri={item.shopImage} style={styles.sellerImage} />
                  <Text style={styles.sellerName} numberOfLines={1}>{item.shopNameKannada || item.shopName}</Text>
                  <View style={styles.sellerMetaRow}>
                    {item.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
                    <Text style={styles.sellerMeta}>⭐ {(item.rating || 0).toFixed(1)} · {formatDistance(item.distanceKm)}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ gap: spacing.sm }}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("ಜನಪ್ರಿಯ")}</Text>
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { paddingTop: spacing.lg, paddingBottom: spacing.lg, paddingHorizontal: spacing.screenPadding, alignItems: "center" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: spacing.md },
  locationRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  pin: { fontSize: 16, marginRight: 4 },
  districtText: { ...typography.body, color: colors.white, fontWeight: "600" },
  headerIcons: { flexDirection: "row", gap: spacing.sm },
  iconBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 22 },
  cartBadge: { position: "absolute", top: 2, right: 2, backgroundColor: colors.accent, borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: colors.primary, fontSize: 10, fontWeight: "700" },
  searchRow: { flexDirection: "row", width: "100%", marginTop: spacing.lg, gap: spacing.sm },
  searchInput: { flex: 1, backgroundColor: colors.white, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, minHeight: spacing.minTouchTarget, ...typography.body },
  goBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", minHeight: spacing.minTouchTarget },
  goBtnText: { color: colors.primary, fontWeight: "700" },
  banner: { marginHorizontal: spacing.screenPadding, marginTop: spacing.md, borderRadius: spacing.cardRadius, padding: spacing.md },
  bannerText: { ...typography.h3, color: colors.white },
  sellSection: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.screenPadding, marginTop: spacing.md },
  sellCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: spacing.cardRadius, padding: spacing.md },
  leadsCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md },
  sellCardIcon: { fontSize: 24 },
  sellCardTitle: { ...typography.body, fontWeight: "700", color: colors.textPrimary, fontSize: 13 },
  sellCardSub: { ...typography.caption, color: colors.textMuted, fontSize: 11, marginTop: 2 },
  section: { paddingHorizontal: spacing.screenPadding, marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryCard: { width: "23%", alignItems: "center", marginBottom: spacing.md, minHeight: spacing.minTouchTarget * 1.3, justifyContent: "center" },
  categoryIcon: { fontSize: 28 },
  categoryLabel: { ...typography.caption, color: colors.textPrimary, marginTop: 4, textAlign: "center" },
  sellerCard: { width: 140, backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.sm },
  sellerImage: { width: "100%", height: 70, borderRadius: spacing.buttonRadius, marginBottom: 6 },
  sellerName: { ...typography.caption, fontWeight: "700", color: colors.textPrimary },
  sellerMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  verifiedBadge: { color: colors.verifiedBlue, fontWeight: "700", fontSize: 12 },
  sellerMeta: { ...typography.caption, color: colors.textMuted },
});
