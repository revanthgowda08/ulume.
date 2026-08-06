import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import LazyImage from "../../components/LazyImage";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { formatRupees, calculateDeliveryCharge } from "../../utils/formatters";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useT } from "../../i18n/useT";

export default function CartScreen({ navigation }) {
  const { items, updateQty, removeItem, getTotal } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const t = useT();

  const subtotal = getTotal();
  const isFirstOrder = (user?.totalOrders || 0) === 0;
  const deliveryCharge = calculateDeliveryCharge(subtotal, isFirstOrder);
  const total = subtotal + deliveryCharge;

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => removeItem(id)}>
      <Text style={styles.deleteActionText}>🗑️</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("ಕಾರ್ಟ್")}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>{t("ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿ ಇದೆ")}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.product.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Swipeable renderRightActions={() => renderRightActions(item.product.id)}>
                <View style={styles.row}>
                  <LazyImage uri={item.product.images?.[0]} style={styles.image} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={2}>{item.product.nameKannada || item.product.name}</Text>
                    <Text style={styles.price}>{formatRupees(item.product.price)}</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.qty - 1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.qty + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Swipeable>
            )}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("ಉಪಮೊತ್ತ")}</Text>
              <Text style={styles.summaryValue}>{formatRupees(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("ಡೆಲಿವರಿ ಶುಲ್ಕ")}</Text>
              <Text style={styles.summaryValue}>{deliveryCharge === 0 ? t("ಉಚಿತ") : formatRupees(deliveryCharge)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t("ಒಟ್ಟು")}</Text>
              <Text style={styles.totalValue}>{formatRupees(total)}</Text>
            </View>
            <View style={styles.codInfo}>
              <Text style={styles.codInfoText}>💰 {t("ಹಣ ಸಾಮಾನು ಬಂದ ಮೇಲೆ ಕೊಡಿ — ಮುಂಗಡ ಪಾವತಿ ಬೇಡ")}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
              <Text style={styles.checkoutBtnText}>Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
  list: { padding: spacing.screenPadding },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  image: { width: 60, height: 60, borderRadius: spacing.buttonRadius },
  name: { ...typography.body, color: colors.textPrimary },
  price: { ...typography.body, color: colors.primaryMid, fontWeight: "700", marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 18, color: colors.primary, fontWeight: "700" },
  qtyValue: { ...typography.body, minWidth: 24, textAlign: "center", color: colors.textPrimary },
  deleteAction: { backgroundColor: colors.error, width: 70, alignItems: "center", justifyContent: "center", borderRadius: spacing.buttonRadius },
  deleteActionText: { fontSize: 22 },
  summary: { padding: spacing.screenPadding, borderTopWidth: 1, borderTopColor: colors.border },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.body, color: colors.textPrimary },
  totalRow: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  totalLabel: { ...typography.h3, color: colors.textPrimary },
  totalValue: { ...typography.h3, color: colors.textPrimary },
  codInfo: { backgroundColor: colors.codBadge, borderRadius: spacing.cardRadius, padding: spacing.sm, marginTop: spacing.sm },
  codInfoText: { ...typography.caption, color: colors.primaryMid, fontWeight: "600" },
  checkoutBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  checkoutBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
