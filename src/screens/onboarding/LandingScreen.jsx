import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

export default function LandingScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding, paddingTop: spacing.xl * 1.5 }}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLeaf}>🍃</Text>
        </View>
        <Text style={styles.wordmark}>ULUME</Text>
      </View>

      <Text style={styles.headline}>
        Rooted in soil.{"\n"}
        <Text style={styles.headlineAccent}>Grown for India.</Text>
      </Text>

      <Text style={styles.body}>
        From soil to shelf — the trusted agri commerce platform for India. Buy seeds,
        machinery, fertilizers. Sell your harvest directly to restaurants, exporters & retailers.
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.primaryBtnText}>🛍️ Browse Marketplace</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Signup", { lockedRole: "farmer" })}>
        <Text style={styles.secondaryBtnText}>🌱 Join as Farmer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12,000+</Text>
          <Text style={styles.statLabel}>Farmers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹4.2 Cr</Text>
          <Text style={styles.statLabel}>Traded</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>98%</Text>
          <Text style={styles.statLabel}>Satisfied</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  logoMark: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logoLeaf: { fontSize: 18 },
  wordmark: { ...typography.h2, fontSize: 22, color: colors.primary },
  headline: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
  headlineAccent: { color: colors.primaryMid },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl, lineHeight: 24 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginBottom: spacing.sm, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  secondaryBtnText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  loginLink: { alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  loginLinkText: { ...typography.body, color: colors.primaryMid, fontWeight: "600" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xl, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  statItem: { alignItems: "center" },
  statValue: { ...typography.h2, fontSize: 22, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
