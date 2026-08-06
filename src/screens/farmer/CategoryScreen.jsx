import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import ProductCard from "../../components/ProductCard";
import { getProductsPage } from "../../services/firebase/firestore";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";

export default function CategoryScreen({ route, navigation }) {
  const { category, label } = route.params;
  const district = useAppStore((s) => s.district);
  const t = useT();
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = async (afterCursor = null) => {
    const { products: page, nextCursor } = await getProductsPage({ category, district, cursor: afterCursor });
    setProducts((prev) => (afterCursor ? [...prev, ...page] : page));
    setCursor(nextCursor);
  };

  useEffect(() => {
    setLoading(true);
    loadPage().finally(() => setLoading(false));
  }, [category, district]);

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
        <Text style={styles.title}>{t(label)}</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { productId: item.id })} />
          )}
          ListFooterComponent={
            cursor && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.loadMoreText}>{t("ಇನ್ನಷ್ಟು ತೋರಿಸಿ")}</Text>}
              </TouchableOpacity>
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t("ಈ ವಿಭಾಗದಲ್ಲಿ ಏನೂ ಸಿಗಲಿಲ್ಲ.")}</Text>
            </View>
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
  list: { padding: spacing.screenPadding },
  loadMoreBtn: { alignItems: "center", padding: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loadMoreText: { ...typography.body, color: colors.primaryMid, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: spacing.xl * 2 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
