import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { firestore } from "../../services/firebase/config";
import { formatRupees, formatOrderDate } from "../../utils/formatters";

export default function EarningsScreen({ navigation }) {
  const seller = useAuthStore((s) => s.seller);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seller?.uid) return;
    firestore()
      .collection("settlements")
      .where("sellerId", "==", seller.uid)
      .orderBy("weekStartDate", "desc")
      .limit(20)
      .get()
      .then((snap) => setSettlements(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false));
  }, [seller?.uid]);

  const pendingSettlement = settlements.find((s) => s.status === "pending");

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ಆದಾಯ</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>ಒಟ್ಟು GMV</Text>
        <Text style={styles.summaryValue}>{formatRupees(seller?.totalGmv || 0)}</Text>
        <Text style={styles.summarySub}>{seller?.totalOrders || 0} ಆರ್ಡರ್‌ಗಳು</Text>
      </View>

      {pendingSettlement && (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingLabel}>ಮುಂದಿನ ಪಾವತಿ (ಸೋಮವಾರ)</Text>
          <Text style={styles.pendingValue}>{formatRupees(pendingSettlement.netPayout)}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>ಪಾವತಿ ಇತಿಹಾಸ</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={settlements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.rowDate}>{formatOrderDate(item.weekStartDate)} – {formatOrderDate(item.weekEndDate)}</Text>
                <Text style={styles.rowOrders}>{item.totalOrders} ಆರ್ಡರ್</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowPayout}>{formatRupees(item.netPayout)}</Text>
                <Text style={[styles.rowStatus, item.status === "processed" && styles.rowStatusPaid]}>
                  {item.status === "processed" ? "ಪಾವತಿ ಆಗಿದೆ" : "ಬಾಕಿ"}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>ಇನ್ನೂ ಯಾವುದೇ ಪಾವತಿ ಇಲ್ಲ</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary },
  summaryCard: { backgroundColor: colors.primary, borderRadius: spacing.cardRadius, padding: spacing.lg, alignItems: "center" },
  summaryLabel: { ...typography.body, color: colors.primaryLight },
  summaryValue: { ...typography.h1, fontSize: 32, color: colors.white, marginTop: spacing.xs },
  summarySub: { ...typography.caption, color: colors.primaryLight, marginTop: spacing.xs },
  pendingCard: { backgroundColor: colors.primaryLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginTop: spacing.md, alignItems: "center" },
  pendingLabel: { ...typography.caption, color: colors.primaryMid },
  pendingValue: { ...typography.h2, color: colors.primary, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowDate: { ...typography.body, color: colors.textPrimary },
  rowOrders: { ...typography.caption, color: colors.textMuted },
  rowRight: { alignItems: "flex-end" },
  rowPayout: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  rowStatus: { ...typography.caption, color: colors.accentDark },
  rowStatusPaid: { color: colors.primaryMid },
  emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.lg, textAlign: "center" },
});
