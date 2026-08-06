import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { listenToSellerPendingOrders, getSellerOrders, updateOrderStatus } from "../../services/firebase/firestore";
import { formatRupees, formatOrderDate, getOrderStatusLabel } from "../../utils/formatters";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";

const isToday = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export default function SellerDashboardScreen({ navigation }) {
  const seller = useAuthStore((s) => s.seller);
  const language = useAppStore((s) => s.language);
  const t = useT();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    if (!seller?.uid) return;
    const unsubscribe = listenToSellerPendingOrders(seller.uid, setPendingOrders);
    getSellerOrders(seller.uid).then(({ orders }) => setAllOrders(orders));
    return unsubscribe;
  }, [seller?.uid]);

  const todayOrders = allOrders.filter((o) => isToday(o.createdAt));
  const todayGmv = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const handleConfirm = async (orderId) => {
    await updateOrderStatus(orderId, "confirmed", "seller");
  };

  const handleReject = (orderId) => {
    Alert.alert(t("ಆರ್ಡರ್ ತಿರಸ್ಕರಿಸಿ"), t("ಖಚಿತವಾಗಿ ತಿರಸ್ಕರಿಸಬೇಕೆ?"), [
      { text: t("ಇಲ್ಲ"), style: "cancel" },
      { text: t("ಹೌದು"), style: "destructive", onPress: () => updateOrderStatus(orderId, "cancelled", "seller") },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <View style={styles.shopNameRow}>
            <Text style={styles.shopName}>{seller?.shopNameKannada || seller?.shopName}</Text>
            {seller?.isVerified && <Text style={styles.verified}>✓</Text>}
            <View style={styles.liveDot} />
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate("ProductList")} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>📦</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Earnings")} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>💰</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{todayOrders.length}</Text>
          <Text style={styles.statLabel}>{t("ಇಂದಿನ ಆರ್ಡರ್")}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatRupees(todayGmv)}</Text>
          <Text style={styles.statLabel}>{t("ಇಂದಿನ GMV")}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, pendingOrders.length > 0 && styles.statValueAlert]}>{pendingOrders.length}</Text>
          <Text style={styles.statLabel}>{t("ಬಾಕಿ")}</Text>
        </View>
      </View>

      <FlatList
        data={allOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          pendingOrders.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.sectionTitle}>{t("ಬಾಕಿ ಇರುವ ಆರ್ಡರ್‌ಗಳು")}</Text>
              {pendingOrders.map((order) => (
                <View key={order.id} style={styles.pendingCard}>
                  <Text style={styles.farmerName}>{order.farmerName || order.farmerPhone}</Text>
                  <Text style={styles.village}>{order.farmerAddress}</Text>
                  <Text style={styles.itemsSummary}>{order.items?.length || 0} ಐಟಂ · {formatRupees(order.total)}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(order.orderId)}>
                      <Text style={styles.confirmBtnText}>✓ CONFIRM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(order.orderId)}>
                      <Text style={styles.rejectBtnText}>✕ REJECT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <Text style={styles.sectionTitle}>{t("ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು")}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderRow} onPress={() => navigation.navigate("SellerOrderDetail", { orderId: item.orderId })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderRowId}>{item.orderId}</Text>
              <Text style={styles.orderRowDate}>{formatOrderDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.orderRowStatus}>{getOrderStatusLabel(item.status, language)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.primary, padding: spacing.screenPadding },
  shopNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  shopName: { ...typography.h3, color: colors.white },
  verified: { color: colors.accent, fontWeight: "700" },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4CAF50" },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  headerBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  headerBtnText: { fontSize: 20 },
  statsRow: { flexDirection: "row", padding: spacing.screenPadding, gap: spacing.sm },
  statBox: { flex: 1, backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, alignItems: "center" },
  statValue: { ...typography.h2, fontSize: 20, color: colors.textPrimary },
  statValueAlert: { color: colors.error },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  list: { paddingHorizontal: spacing.screenPadding, paddingBottom: spacing.xl },
  pendingSection: { marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginVertical: spacing.sm },
  pendingCard: { backgroundColor: colors.white, borderLeftWidth: 4, borderLeftColor: colors.error, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md, shadowColor: colors.black, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  farmerName: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
  village: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  itemsSummary: { ...typography.body, color: colors.textPrimary, marginTop: 4, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  confirmBtn: { flex: 1, backgroundColor: colors.primaryMid, borderRadius: spacing.buttonRadius, paddingVertical: spacing.sm, alignItems: "center", minHeight: spacing.minTouchTarget - 8, justifyContent: "center" },
  confirmBtnText: { color: colors.white, fontWeight: "700" },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: colors.error, borderRadius: spacing.buttonRadius, paddingVertical: spacing.sm, alignItems: "center", minHeight: spacing.minTouchTarget - 8, justifyContent: "center" },
  rejectBtnText: { color: colors.error, fontWeight: "700" },
  orderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  orderRowId: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  orderRowDate: { ...typography.caption, color: colors.textMuted },
  orderRowStatus: { ...typography.caption, color: colors.primaryMid, fontWeight: "700" },
});
