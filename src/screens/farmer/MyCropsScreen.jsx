import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
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

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      setLoading(true);
      getFarmerCropListings(user.uid)
        .then(setListings)
        .finally(() => setLoading(false));
    }, [user?.uid])
  );

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

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
  list: { padding: spacing.screenPadding },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  cropName: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  cropDetail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
