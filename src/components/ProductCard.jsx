import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LazyImage from "./LazyImage";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { formatRupees, formatDistance } from "../utils/formatters";
import { useCartStore } from "../store/cartStore";

export default function ProductCard({ product, onPress }) {
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <LazyImage uri={product.images?.[0]} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.nameKannada || product.name}</Text>
        <Text style={styles.sellerRow} numberOfLines={1}>
          {product.sellerNameKannada || product.sellerName} · {formatDistance(product.distanceKm)}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatRupees(product.price)}</Text>
          {discount > 0 && <Text style={styles.mrp}>{formatRupees(product.mrp)}</Text>}
          {discount > 0 && <Text style={styles.discount}>-{discount}%</Text>}
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.codBadge}>
            <Text style={styles.codText}>💰 CoD</Text>
          </View>
          {product.rating > 0 && (
            <Text style={styles.rating}>⭐ {product.rating.toFixed(1)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => addItem(product, 1)}
          accessibilityLabel="ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ"
        >
          <Text style={styles.addBtnText}>🛒 ಸೇರಿಸಿ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: spacing.sm },
  name: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
  sellerRow: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
  price: { ...typography.price, fontSize: 18, color: colors.textPrimary },
  mrp: { ...typography.caption, color: colors.textMuted, textDecorationLine: "line-through" },
  discount: { ...typography.caption, color: colors.primaryMid, fontWeight: "700" },
  badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  codBadge: { backgroundColor: colors.codBadge, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  codText: { ...typography.caption, color: colors.primaryMid, fontWeight: "600" },
  rating: { ...typography.caption, color: colors.accentDark },
  addBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: spacing.buttonRadius,
    paddingVertical: 8,
    alignItems: "center",
    minHeight: spacing.minTouchTarget - 8,
    justifyContent: "center",
  },
  addBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
});
