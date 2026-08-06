import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import OrderStatusBar from "../../components/OrderStatusBar";
import { listenToOrder } from "../../services/firebase/firestore";
import { formatRupees, formatOrderDate, getOrderStatusLabel } from "../../utils/formatters";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";

const RETURN_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const language = useAppStore((s) => s.language);
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

  const deliveredAtMs = order.deliveredAt?.toDate ? order.deliveredAt.toDate().getTime() : null;
  const canReturn = order.status === "delivered" && deliveredAtMs && Date.now() - deliveredAtMs <= RETURN_WINDOW_MS;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text>
        </View>
      </View>

      <OrderStatusBar status={order.status} />

      <Text style={styles.statusLabel}>{getOrderStatusLabel(order.status, language)}</Text>
      {order.estimatedDelivery && (
        <Text style={styles.eta}>{t("ಅಂದಾಜು ಡೆಲಿವರಿ")}: {order.estimatedDelivery}</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("ಆರ್ಡರ್ ವಿವರ")}</Text>
        {order.items?.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productNameKannada || item.productName} × {item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatRupees(item.subtotal)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t("ಒಟ್ಟು")}</Text>
          <Text style={styles.totalValue}>{formatRupees(order.total)}</Text>
        </View>
      </View>

      {order.sellerPhone && (
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${order.sellerPhone}`)}>
          <Text style={styles.callBtnText}>📞 {t("ಮಾರಾಟಗಾರರಿಗೆ ಕರೆ ಮಾಡಿ")}</Text>
        </TouchableOpacity>
      )}

      {canReturn && (
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => Alert.alert(t("ವಾಪಸ್ ವಿನಂತಿ"), t("ನಿಮ್ಮ ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ನಾವು ಶೀಘ್ರದಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ."))}
        >
          <Text style={styles.returnBtnText}>{t("ತಪ್ಪಾದ ಸಾಮಾನು?")}</Text>
        </TouchableOpacity>
      )}
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
  orderDate: { ...typography.caption, color: colors.textMuted },
  statusLabel: { ...typography.h1, fontSize: 24, color: colors.primary, textAlign: "center", marginTop: spacing.sm },
  eta: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xs },
  card: { backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginTop: spacing.lg },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  itemName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  itemPrice: { ...typography.body, color: colors.textPrimary },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  totalLabel: { ...typography.h3, color: colors.textPrimary },
  totalValue: { ...typography.h3, color: colors.textPrimary },
  callBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  callBtnText: { color: colors.white, fontWeight: "700" },
  returnBtn: { borderWidth: 1, borderColor: colors.error, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  returnBtnText: { color: colors.error, fontWeight: "700" },
});
