import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { listenToOrder, updateOrderStatus } from "../../services/firebase/firestore";
import { formatRupees, formatOrderDate } from "../../utils/formatters";
import { useT } from "../../i18n/useT";

export default function SellerOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const t = useT();

  useEffect(() => {
    const unsubscribe = listenToOrder(orderId, setOrder);
    return unsubscribe;
  }, [orderId]);

  if (!order) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const grossAmount = order.subtotal || 0;
  const commissionAmount = order.commissionAmount || Math.round(grossAmount * (order.commissionRate || 0.065));
  const earnings = grossAmount - commissionAmount;

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, status, "seller");
    } catch (e) {
      Alert.alert(t("ದೋಷ"), t("ಅಪ್‌ಡೇಟ್ ಆಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ."));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("ರೈತ ವಿವರ")}</Text>
        <Text style={styles.row}>{order.farmerName || "—"}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.farmerPhone}`)}>
          <Text style={styles.phoneLink}>📞 {order.farmerPhone}</Text>
        </TouchableOpacity>
        <Text style={styles.row}>{order.farmerAddress}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("ಐಟಂಗಳು")}</Text>
        {order.items?.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productNameKannada || item.productName} × {item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatRupees(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("ಆದಾಯ ವಿವರ")}</Text>
        <Text style={styles.commissionText}>
          Gross {formatRupees(grossAmount)} — Commission {formatRupees(commissionAmount)} ({((order.commissionRate || 0.065) * 100).toFixed(1)}%) = Your earnings {formatRupees(earnings)}
        </Text>
      </View>

      <View style={styles.actions}>
        {order.status === "placed" && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleStatusChange("confirmed")} disabled={updating}>
              <Text style={styles.confirmBtnText}>CONFIRM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleStatusChange("cancelled")} disabled={updating}>
              <Text style={styles.rejectBtnText}>REJECT</Text>
            </TouchableOpacity>
          </View>
        )}
        {order.status === "confirmed" && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleStatusChange("out_for_delivery")} disabled={updating}>
            <Text style={styles.primaryBtnText}>🚚 Mark Out for Delivery</Text>
          </TouchableOpacity>
        )}
        {order.status === "out_for_delivery" && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleStatusChange("delivered")} disabled={updating}>
            <Text style={styles.primaryBtnText}>✅ Delivered + CoD Collected</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  orderId: { ...typography.h3, color: colors.textPrimary },
  date: { ...typography.caption, color: colors.textMuted },
  card: { backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { ...typography.h3, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
  phoneLink: { ...typography.body, color: colors.primaryMid, fontWeight: "700", marginTop: 4, minHeight: spacing.minTouchTarget - 20 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  itemName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  itemPrice: { ...typography.body, color: colors.textPrimary },
  commissionText: { ...typography.body, color: colors.textPrimary },
  actions: { marginTop: spacing.md },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  confirmBtn: { flex: 1, backgroundColor: colors.primaryMid, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  confirmBtnText: { color: colors.white, fontWeight: "700" },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: colors.error, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  rejectBtnText: { color: colors.error, fontWeight: "700" },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  primaryBtnText: { color: colors.white, fontWeight: "700" },
});
