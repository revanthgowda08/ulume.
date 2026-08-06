import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions, Linking, ActivityIndicator } from "react-native";
import LazyImage from "../../components/LazyImage";
import AudioPlayer from "../../components/AudioPlayer";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { formatRupees } from "../../utils/formatters";
import { getProductById, getSellerById, incrementProductViewCount } from "../../services/firebase/firestore";
import { useCartStore } from "../../store/cartStore";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    (async () => {
      const p = await getProductById(productId);
      setProduct(p);
      if (p?.sellerId) setSeller(await getSellerById(p.sellerId));
      incrementProductViewCount(productId).catch(() => {});
      setLoading(false);
    })();
  }, [productId]);

  if (loading || !product) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleAddToCart = () => {
    addItem(product, qty);
    navigation.navigate("Cart");
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <FlatList
          data={product.images?.length ? product.images : [null]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(uri, i) => uri || String(i)}
          renderItem={({ item }) => <LazyImage uri={item} style={{ width, height: 260 }} />}
        />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{product.nameKannada || product.name}</Text>
              <Text style={styles.nameEn}>{product.name}</Text>
            </View>
            <AudioPlayer cacheKey={`product_${productId}`} text={product.descriptionKannada} />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatRupees(product.price)}</Text>
            {discount > 0 && <Text style={styles.mrp}>{formatRupees(product.mrp)}</Text>}
            {discount > 0 && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save {formatRupees(product.mrp - product.price)}</Text>
              </View>
            )}
          </View>

          {seller && (
            <View style={styles.sellerCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{seller.shopNameKannada || seller.shopName}</Text>
                  {seller.isVerified && <Text style={styles.verified}>✓</Text>}
                </View>
                <Text style={styles.sellerMeta}>⭐ {(seller.rating || 0).toFixed(1)} · {product.distanceKm ? `${product.distanceKm} km` : ""}</Text>
              </View>
              <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${seller.phone}`)}>
                <Text style={styles.callBtnText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.codBadge}>
            <Text style={styles.codText}>💰 ಹಣ ಸಾಮಾನು ಬಂದ ಮೇಲೆ</Text>
          </View>

          <View style={styles.returnBox}>
            <Text style={styles.returnText}>🔄 ತಪ್ಪಾದ ಸಾಮಾನು — ₹ ವಾಪಸ್ ಖಚಿತ</Text>
          </View>

          {product.descriptionKannada && (
            <Text style={styles.description}>{product.descriptionKannada}</Text>
          )}

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>ಪ್ರಮಾಣ</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty} {product.unit}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
        <Text style={styles.addToCartText}>🛒 ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ — {formatRupees(product.price * qty)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  backBtn: { position: "absolute", top: spacing.md, left: spacing.md, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  body: { padding: spacing.screenPadding },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  name: { ...typography.h1, fontSize: 24, color: colors.textPrimary },
  nameEn: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  price: { ...typography.price, color: colors.textPrimary },
  mrp: { ...typography.body, color: colors.textMuted, textDecorationLine: "line-through" },
  saveBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  saveBadgeText: { ...typography.caption, color: colors.primaryMid, fontWeight: "700" },
  sellerCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginTop: spacing.md },
  sellerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sellerName: { ...typography.h3, fontSize: 16, color: colors.textPrimary },
  verified: { color: colors.verifiedBlue, fontWeight: "700" },
  sellerMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  callBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  callBtnText: { color: colors.white, fontWeight: "700" },
  codBadge: { alignSelf: "flex-start", backgroundColor: colors.codBadge, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.md },
  codText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
  returnBox: { backgroundColor: colors.primaryLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginTop: spacing.sm },
  returnText: { ...typography.body, color: colors.primary, fontWeight: "600" },
  description: { ...typography.body, color: colors.textPrimary, marginTop: spacing.md },
  qtyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg },
  qtyLabel: { ...typography.h3, color: colors.textPrimary },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  qtyBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 24, color: colors.primary, fontWeight: "700" },
  qtyValue: { ...typography.h3, color: colors.textPrimary, minWidth: 60, textAlign: "center" },
  addToCartBtn: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.primary, padding: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget + 16 },
  addToCartText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
