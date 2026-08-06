import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { formatRupees } from "../../utils/formatters";
import { useAuthStore } from "../../store/authStore";

export default function WalletScreen() {
  const user = useAuthStore((s) => s.user);

  const handleShareReferral = () => {
    Share.share({
      message: `ULUME ಬಳಸಿ, ರೈತರಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ! ನನ್ನ ಕೋಡ್: ${user?.referralCode || ""} — ಬಳಸಿ ₹50 ಪಡೆಯಿರಿ.`,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>ವ್ಯಾಲೆಟ್</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>ನಿಮ್ಮ ಬ್ಯಾಲೆನ್ಸ್</Text>
        <Text style={styles.balanceValue}>{formatRupees(user?.walletBalance || 0)}</Text>
      </View>

      <View style={styles.referralCard}>
        <Text style={styles.referralTitle}>🎁 ಸ್ನೇಹಿತರನ್ನು ಆಹ್ವಾನಿಸಿ, ₹50 ಪಡೆಯಿರಿ</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{user?.referralCode || "—"}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferral}>
          <Text style={styles.shareBtnText}>📤 ಶೇರ್ ಮಾಡಿ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>ಒಟ್ಟು ಆರ್ಡರ್</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  balanceCard: { backgroundColor: colors.primary, borderRadius: spacing.cardRadius, padding: spacing.lg, alignItems: "center" },
  balanceLabel: { ...typography.body, color: colors.primaryLight },
  balanceValue: { ...typography.h1, fontSize: 36, color: colors.white, marginTop: spacing.xs },
  referralCard: { backgroundColor: colors.primaryLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginTop: spacing.lg, alignItems: "center" },
  referralTitle: { ...typography.h3, color: colors.primary, textAlign: "center" },
  codeRow: { backgroundColor: colors.white, borderRadius: spacing.buttonRadius, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  codeText: { ...typography.h2, color: colors.textPrimary, letterSpacing: 2 },
  shareBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  shareBtnText: { color: colors.primary, fontWeight: "700" },
  statsRow: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, alignItems: "center" },
  statValue: { ...typography.h2, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
