import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { listenToFarmerProcurementRequests, updateProcurementRequestStatus } from "../../services/firebase/firestore";
import { formatOrderDate } from "../../utils/formatters";

const STATUS_COLORS = {
  pending: colors.accent,
  accepted: colors.primaryMid,
  rejected: colors.error,
};

export default function BuyerLeadsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = listenToFarmerProcurementRequests(
      user.uid,
      (data) => {
        setRequests(data);
        setLoading(false);
        setLoadError(false);
      },
      () => {
        setLoading(false);
        setLoadError(true);
      }
    );
    return unsubscribe;
  }, [user?.uid]);

  const handleRespond = async (requestId, status) => {
    setUpdatingId(requestId);
    try {
      await updateProcurementRequestStatus(requestId, status);
    } catch (e) {
      Alert.alert("Error", "Couldn't update the request. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Buyer Leads</Text>
      </View>

      {loadError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Couldn't load buyer leads right now. Pull down to retry.</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.buyerName}>{item.buyerName}</Text>
              <Text style={styles.cropDetail}>
                {item.cropName} · {item.quantity} kg @ ₹{item.pricePerUnit}/kg
              </Text>
              <Text style={styles.date}>{formatOrderDate(item.createdAt)}</Text>

              {item.status === "pending" ? (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleRespond(item.id, "rejected")}
                    disabled={updatingId === item.id}
                  >
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleRespond(item.id, "accepted")}
                    disabled={updatingId === item.id}
                  >
                    {updatingId === item.id ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No buyer requests yet.</Text>}
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
  title: { ...typography.h3, color: colors.textPrimary },
  errorBanner: { backgroundColor: colors.errorLight || "#FBE9E7", padding: spacing.md, margin: spacing.screenPadding, borderRadius: spacing.buttonRadius },
  errorBannerText: { ...typography.caption, color: colors.error },
  list: { padding: spacing.screenPadding },
  card: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  buyerName: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  cropDetail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  date: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1, borderRadius: spacing.buttonRadius, paddingVertical: spacing.sm, alignItems: "center", justifyContent: "center", minHeight: spacing.minTouchTarget - 8 },
  rejectBtn: { borderWidth: 1, borderColor: colors.error },
  rejectBtnText: { color: colors.error, fontWeight: "700" },
  acceptBtn: { backgroundColor: colors.primary },
  acceptBtnText: { color: colors.white, fontWeight: "700" },
  statusBadge: { alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
