import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from "react-native";
import LazyImage from "../../components/LazyImage";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { cardShadow } from "../../theme/shadow";
import { useAuthStore } from "../../store/authStore";
import {
  listenToSellerPendingOrders,
  getSellerOrders,
  updateOrderStatus,
  getSellerProducts,
  deleteProduct,
} from "../../services/firebase/firestore";
import { formatRupees, formatOrderDate, getOrderStatusLabel } from "../../utils/formatters";
import { useAppStore } from "../../store/appStore";
import { useT } from "../../i18n/useT";
import { signOutUser } from "../../services/firebase/auth";
import SalesTrendChart from "../../components/SalesTrendChart";
import AddProductScreen from "./AddProductScreen";

const TABS = ["Products", "Orders", "Add Product"];

export default function SellerDashboardScreen({ navigation }) {
  const seller = useAuthStore((s) => s.seller);
  const { clearAuth } = useAuthStore();
  const language = useAppStore((s) => s.language);
  const t = useT();
  const [tab, setTab] = useState("Products");

  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const loadOrders = useCallback(() => {
    if (!seller?.uid) return Promise.resolve();
    return getSellerOrders(seller.uid)
      .then(({ orders }) => setAllOrders(orders))
      .catch((error) => setLoadError(error.message));
  }, [seller?.uid]);

  const loadProducts = useCallback(() => {
    if (!seller?.uid) return Promise.resolve();
    return getSellerProducts(seller.uid)
      .then(({ products: page }) => setProducts(page))
      .catch((error) => console.error("getSellerProducts failed:", error));
  }, [seller?.uid]);

  useEffect(() => {
    if (!seller?.uid) return;
    setLoadError(null);
    const unsubscribe = listenToSellerPendingOrders(seller.uid, setPendingOrders, (error) =>
      setLoadError(error.message)
    );
    loadOrders().finally(() => setOrdersLoading(false));
    loadProducts().finally(() => setProductsLoading(false));
    return unsubscribe;
  }, [seller?.uid, loadOrders, loadProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoadError(null);
    Promise.all([loadOrders(), loadProducts()]).finally(() => setRefreshing(false));
  };

  const totalSales = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const unitsSold = allOrders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0);

  const handleConfirm = async (orderId) => {
    await updateOrderStatus(orderId, "confirmed", "seller");
  };

  const handleReject = (orderId) => {
    Alert.alert(t("ಆರ್ಡರ್ ತಿರಸ್ಕರಿಸಿ"), t("ಖಚಿತವಾಗಿ ತಿರಸ್ಕರಿಸಬೇಕೆ?"), [
      { text: t("ಇಲ್ಲ"), style: "cancel" },
      { text: t("ಹೌದು"), style: "destructive", onPress: () => updateOrderStatus(orderId, "cancelled", "seller") },
    ]);
  };

  const handleDeleteProduct = (product) => {
    Alert.alert("Remove product", `Remove "${product.nameKannada || product.name}" from your catalog?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
          } catch (e) {
            Alert.alert("Error", "Couldn't remove the product. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ULUME</Text>
        <TouchableOpacity onPress={async () => { await signOutUser(); clearAuth(); }}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.body}
        contentContainerStyle={{ padding: spacing.screenPadding, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        data={tab === "Products" ? products : tab === "Orders" ? allOrders : []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Vendor Dashboard</Text>
              {seller?.isVerified && <Text style={styles.verified}>✓</Text>}
            </View>
            <Text style={styles.subtitle}>Manage your catalog, inventory, and sales.</Text>

            {loadError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {loadError}</Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>₹</Text>
                <Text style={styles.statValue}>{formatRupees(totalSales)}</Text>
                <Text style={styles.statLabel}>Total Sales</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>📦</Text>
                <Text style={styles.statValue}>{unitsSold}</Text>
                <Text style={styles.statLabel}>Units Sold</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statValue}>{allOrders.length}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
            </View>

            <SalesTrendChart orders={allOrders} />

            <View style={styles.tabRow}>
              {TABS.map((tb) => (
                <TouchableOpacity key={tb} style={[styles.tab, tab === tb && styles.tabActive]} onPress={() => setTab(tb)}>
                  <Text style={[styles.tabText, tab === tb && styles.tabTextActive]}>{tb}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {tab === "Products" && productsLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}

            {tab === "Orders" && pendingOrders.length > 0 && (
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
            )}

            {tab === "Orders" && ordersLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}

            {tab === "Add Product" && <AddProductScreen navigation={navigation} />}
          </View>
        }
        renderItem={({ item }) =>
          tab === "Products" ? (
            <View style={styles.productCard}>
              <LazyImage uri={item.images?.[0]} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName} numberOfLines={1}>{item.nameKannada || item.name}</Text>
                <Text style={styles.productMeta}>{item.category} · {item.stock} in stock</Text>
              </View>
              <View style={[styles.liveBadge, !item.isAvailable && styles.pausedBadge]}>
                <Text style={styles.liveBadgeText}>{item.isAvailable ? "Live" : "Paused"}</Text>
              </View>
              <Text style={styles.productPrice}>{formatRupees(item.price)}</Text>
              <TouchableOpacity onPress={() => handleDeleteProduct(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          ) : tab === "Orders" ? (
            <TouchableOpacity style={styles.orderRow} onPress={() => navigation.navigate("SellerOrderDetail", { orderId: item.orderId })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderRowId}>{item.orderId}</Text>
                <Text style={styles.orderRowDate}>{formatOrderDate(item.createdAt)}</Text>
              </View>
              <Text style={styles.orderRowStatus}>{getOrderStatusLabel(item.status, language)}</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          tab === "Products" && !productsLoading ? (
            <Text style={styles.emptyText}>No products yet. Switch to "Add Product" to list one.</Text>
          ) : tab === "Orders" && !ordersLoading ? (
            <Text style={styles.emptyText}>No orders yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, padding: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.h3, color: colors.primary },
  logout: { ...typography.body, color: colors.error, fontWeight: "600" },
  body: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  title: { ...typography.h1, fontSize: 26, color: colors.textPrimary },
  verified: { color: colors.accent, fontWeight: "900", fontSize: 20 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  errorBox: { backgroundColor: "#FDECEA", padding: spacing.md, borderRadius: spacing.cardRadius, marginBottom: spacing.sm },
  errorText: { ...typography.caption, color: colors.error },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  statBox: { flex: 1, backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, minHeight: 90, justifyContent: "center", ...cardShadow },
  statIcon: { fontSize: 18, marginBottom: spacing.xs, color: colors.primary, fontWeight: "700" },
  statValue: { ...typography.h1, fontSize: 20, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  tabRow: { flexDirection: "row", backgroundColor: colors.grayLight, borderRadius: 24, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: 20 },
  tabActive: { backgroundColor: colors.white },
  tabText: { ...typography.caption, color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: colors.textPrimary },
  pendingSection: { marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginVertical: spacing.sm },
  pendingCard: { backgroundColor: colors.white, borderLeftWidth: 4, borderLeftColor: colors.error, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
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
  productCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.sm, marginBottom: spacing.sm, ...cardShadow },
  productImage: { width: 44, height: 44, borderRadius: spacing.buttonRadius },
  productName: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  productMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  liveBadge: { backgroundColor: colors.primaryMid, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  pausedBadge: { backgroundColor: colors.textMuted },
  liveBadgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
  productPrice: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  deleteBtn: { padding: spacing.xs },
  deleteIcon: { fontSize: 16, color: colors.error },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
