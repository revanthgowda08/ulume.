import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { getFarmerOrders } from "../../services/firebase/firestore";
import { useAuthStore } from "../../store/authStore";
import { formatRupees, formatOrderDate, ORDER_STATUS_LABELS_KN } from "../../utils/formatters";

const STATUS_COLORS = {
  placed: colors.accent,
  confirmed: colors.primaryMid,
  out_for_delivery: colors.accentDark,
  delivered: colors.primary,
  cancelled: colors.error,
  returned: colors.error,
};

export default function OrderHistoryScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = async (afterCursor = null) => {
    const { orders: page, nextCursor } = await getFarmerOrders(user.uid, afterCursor);
    setOrders((prev) => (afterCursor ? [...prev, ...page] : page));
    setCursor(nextCursor);
  };

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    loadPage().finally(() => setLoading(false));
  }, [user?.uid]);

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    await loadPage(cursor);
    setLoadingMore(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>ನನ್ನ ಆರ್ಡರ್‌ಗಳು</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("OrderTracking", { orderId: item.orderId })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.orderId}>{item.orderId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
                  <Text style={styles.statusBadgeText}>{ORDER_STATUS_LABELS_KN[item.status] || item.status}</Text>
                </View>
              </View>
              <Text style={styles.date}>{formatOrderDate(item.createdAt)}</Text>
              <Text style={styles.total}>{formatRupees(item.total)} · {item.items?.length || 0} ಐಟಂ</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            cursor && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.loadMoreText}>ಇನ್ನಷ್ಟು ತೋರಿಸಿ</Text>}
              </TouchableOpacity>
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h2, color: colors.textPrimary },
  list: { padding: spacing.screenPadding },
  card: { backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  date: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  total: { ...typography.body, color: colors.textPrimary, marginTop: 4, fontWeight: "600" },
  loadMoreBtn: { alignItems: "center", padding: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loadMoreText: { ...typography.body, color: colors.primaryMid, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: spacing.xl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
