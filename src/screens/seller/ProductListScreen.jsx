import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import LazyImage from "../../components/LazyImage";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { getSellerProducts } from "../../services/firebase/firestore";
import { formatRupees } from "../../utils/formatters";

export default function ProductListScreen({ navigation }) {
  const seller = useAuthStore((s) => s.seller);
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = async (afterCursor = null) => {
    const { products: page, nextCursor } = await getSellerProducts(seller.uid, afterCursor);
    setProducts((prev) => (afterCursor ? [...prev, ...page] : page));
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

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ನನ್ನ ಉತ್ಪನ್ನಗಳು</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddProduct")}>
          <Text style={styles.addBtnText}>+ ಸೇರಿಸಿ</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <LazyImage uri={item.images?.[0]} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{item.nameKannada || item.name}</Text>
                <Text style={styles.price}>{formatRupees(item.price)} · ಸ್ಟಾಕ್ {item.stock}</Text>
                <Text style={[styles.availability, !item.isAvailable && styles.unavailable]}>
                  {item.isAvailable ? "✅ ಲಭ್ಯ" : "❌ ಲಭ್ಯವಿಲ್ಲ"}
                </Text>
              </View>
            </View>
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
              <Text style={styles.emptyText}>ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನ ಸೇರಿಸಿಲ್ಲ</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  addBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  addBtnText: { color: colors.white, fontWeight: "700" },
  list: { padding: spacing.screenPadding },
  card: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.sm, marginBottom: spacing.sm },
  image: { width: 56, height: 56, borderRadius: spacing.buttonRadius },
  name: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  price: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  availability: { ...typography.caption, color: colors.primaryMid, marginTop: 2 },
  unavailable: { color: colors.error },
  loadMoreBtn: { alignItems: "center", padding: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loadMoreText: { ...typography.body, color: colors.primaryMid, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: spacing.xl * 2 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
