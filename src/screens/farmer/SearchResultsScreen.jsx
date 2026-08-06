import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import ProductCard from "../../components/ProductCard";
import { useAppStore } from "../../store/appStore";
import { getNearbyProducts } from "../../utils/geoUtils";

export default function SearchResultsScreen({ route, navigation }) {
  const { products: initialProducts, query } = route.params || {};
  const location = useAppStore((s) => s.location);
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts || !location || !query) return;
    setLoading(true);
    getNearbyProducts([location.latitude, location.longitude], 15)
      .then((results) => {
        const q = query.toLowerCase();
        setProducts(
          results.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.nameKannada?.includes(query) ||
              p.tags?.some((t) => t.toLowerCase().includes(q))
          )
        );
      })
      .finally(() => setLoading(false));
  }, [query, location, initialProducts]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ಫಲಿತಾಂಶಗಳು ({products.length})</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { productId: item.id })} />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>ಏನೂ ಸಿಗಲಿಲ್ಲ. ಬೇರೆ ಪದ ಪ್ರಯತ್ನಿಸಿ.</Text>
            </View>
          )
        }
      />
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
  empty: { alignItems: "center", marginTop: spacing.xl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted },
});
