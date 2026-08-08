import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { getFarmerCropListings } from "../../services/firebase/firestore";

const STATUS_COLORS = {
  active: colors.primaryMid,
  sold: colors.textMuted,
};

export default function MyCropsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadListings = useCallback(() => {
    if (!user?.uid) return Promise.resolve();
    setLoadError(false);
    return getFarmerCropListings(user.uid)
      .then(setListings)
      .catch((error) => {
        console.error("getFarmerCropListings failed:", error);
        setLoadError(true);
      });
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadListings().finally(() => setLoading(false));
    }, [loadListings])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings().finally(() => setRefreshing(false));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Crops</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddCropListing")}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loadError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Couldn't load your crops right now. Pull down to retry.</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cropName}>{item.cropName} {item.variety ? `(${item.variety})` : ""}</Text>
                <Text style={styles.cropDetail}>
                  {item.quantity} {item.unit} @ ₹{item.pricePerUnit}/{item.unit}
                  {item.isOrganic ? " · Organic" : ""}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No crop listings yet. Tap "+ Add" to list your harvest for buyers.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.screenPadding, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  addBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: spacing.minTouchTarget - 8, justifyContent: "center" },
  addBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  errorBanner: { backgroundColor: "#FDECEA", padding: spacing.md, margin: spacing.screenPadding, borderRadius: spacing.cardRadius },
  errorBannerText: { ...typography.caption, color: colors.error },
  list: { padding: spacing.screenPadding },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  cropName: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  cropDetail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
