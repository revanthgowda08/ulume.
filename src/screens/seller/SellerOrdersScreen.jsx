import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { getSellerOrders } from "../../services/firebase/firestore";
import { formatRupees, formatOrderDate, ORDER_STATUS_LABELS_KN } from "../../utils/formatters";

const FILTERS = [
  { key: "all", label: "ಎಲ್ಲಾ" },
  { key: "placed", label: "ಹೊಸದು" },
  { key: "confirmed", label: "ದೃಢಪಟ್ಟಿದೆ" },
  { key: "out_for_delivery", label: "ದಾರಿಯಲ್ಲಿ" },
  { key: "delivered", label: "ತಲುಪಿತು" },
];

export default function SellerOrdersScreen({ navigation }) {
  const seller = useAuthStore((s) => s.seller);
  const [orders, setOrders] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = async (afterCursor = null) => {
    const { orders: page, nextCursor } = await getSellerOrders(seller.uid, afterCursor);
    setOrders((prev) => (afterCursor ? [...prev, ...page] : page));
    setCursor(nextCursor);
  };

  useEffect(() => {
    if (!seller?.uid) return;
    setLoading(true);
    loadPage().finally(() => setLoading(false));
  }, [seller?.uid]);

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    await loadPage(cursor);
    setLoadingMore(false);
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ಆರ್ಡರ್‌ಗಳು</Text>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filter === item.key && styles.chipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("SellerOrderDetail", { orderId: item.orderId })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>{item.orderId}</Text>
                <Text style={styles.farmerName}>{item.farmerName || item.farmerPhone}</Text>
                <Text style={styles.date}>{formatOrderDate(item.createdAt)}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.total}>{formatRupees(item.total)}</Text>
                <Text style={styles.status}>{ORDER_STATUS_LABELS_KN[item.status] || item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            cursor && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.loadMoreText}>ಇನ್ನಷ್ಟು ತೋರಿಸಿ</Text>}
              </TouchableOpacity>
            )
          }
        />
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
  filterRow: { paddingHorizontal: spacing.screenPadding, paddingVertical: spacing.sm, gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  chipText: { ...typography.caption, color: colors.textMuted },
  chipTextActive: { color: colors.primary, fontWeight: "700" },
  list: { padding: spacing.screenPadding },
  card: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  orderId: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  farmerName: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  date: { ...typography.caption, color: colors.textMuted },
  right: { alignItems: "flex-end" },
  total: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  status: { ...typography.caption, color: colors.primaryMid, marginTop: 2 },
  loadMoreBtn: { alignItems: "center", padding: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loadMoreText: { ...typography.body, color: colors.primaryMid, fontWeight: "700" },
});
