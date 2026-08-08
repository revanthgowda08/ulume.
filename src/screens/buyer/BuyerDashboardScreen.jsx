import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { getBuyerProcurementRequests } from "../../services/firebase/firestore";
import { formatRupees, formatOrderDate } from "../../utils/formatters";
import { signOutUser } from "../../services/firebase/auth";

const TABS = ["Procurement", "Orders", "Saved Farmers"];

const STATUS_COLORS = {
  pending: colors.accent,
  accepted: colors.primaryMid,
  rejected: colors.error,
};

export default function BuyerDashboardScreen({ navigation }) {
  const { buyer, clearAuth } = useAuthStore();
  const [tab, setTab] = useState("Procurement");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!buyer?.uid) return;
    setLoadError(false);
    getBuyerProcurementRequests(buyer.uid)
      .then(setRequests)
      .catch((error) => {
        console.error("getBuyerProcurementRequests failed:", error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [buyer?.uid]);

  const savedFarmerIds = buyer?.savedFarmerIds || [];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ULUME</Text>
        <TouchableOpacity onPress={async () => { await signOutUser(); clearAuth(); }}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Buyer Dashboard</Text>
        <Text style={styles.subtitle}>Find farmers, manage procurement, track orders.</Text>

        {loadError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>Couldn't load your requests right now. Pull down to retry.</Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate("SearchFarmers")}>
            <Text style={styles.statIcon}>🔍</Text>
            <Text style={styles.statCardTitle}>Search{"\n"}Farmers</Text>
            <Text style={styles.statCardSub}>By crop / state / organic</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statCardSub}>Procurement Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{buyer?.totalOrders || 0}</Text>
            <Text style={styles.statCardSub}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>♡</Text>
            <Text style={styles.statValue}>{savedFarmerIds.length}</Text>
            <Text style={styles.statCardSub}>Saved Farmers</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "Procurement" && (
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.requestCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestTitle}>{item.quantity} kg @ ₹{item.pricePerUnit}/kg</Text>
                    <Text style={styles.requestDate}>{formatOrderDate(item.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No procurement requests yet.</Text>}
            />
          )
        )}

        {tab === "Orders" && <Text style={styles.emptyText}>No orders yet.</Text>}

        {tab === "Saved Farmers" && (
          savedFarmerIds.length === 0
            ? <Text style={styles.emptyText}>No saved farmers yet — search and save some.</Text>
            : <Text style={styles.emptyText}>{savedFarmerIds.length} farmer(s) saved.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, padding: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.h3, color: colors.primary },
  logout: { ...typography.body, color: colors.error, fontWeight: "600" },
  body: { padding: spacing.screenPadding, flex: 1 },
  errorBanner: { backgroundColor: "#FDECEA", padding: spacing.md, borderRadius: spacing.cardRadius, marginTop: spacing.sm },
  errorBannerText: { ...typography.caption, color: colors.error },
  title: { ...typography.h1, fontSize: 26, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg },
  statCard: { width: "48%", backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm, minHeight: 110, justifyContent: "center" },
  statIcon: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { ...typography.h1, fontSize: 26, color: colors.textPrimary },
  statCardTitle: { ...typography.h3, fontSize: 16, color: colors.textPrimary },
  statCardSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  tabRow: { flexDirection: "row", backgroundColor: colors.grayLight, borderRadius: 24, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: 20 },
  tabActive: { backgroundColor: colors.white },
  tabText: { ...typography.caption, color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: colors.textPrimary },
  requestCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  requestTitle: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  requestDate: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
