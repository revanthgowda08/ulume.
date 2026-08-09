import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const PROBLEMS = [
  { icon: "🏚️", text: "Middlemen eat 30–40% of a farmer's profit before produce ever reaches a buyer" },
  { icon: "📉", text: "No visibility into fair, real-time market prices for their crop" },
  { icon: "🚜", text: "Limited access to quality seeds, fertilizers & machinery nearby" },
  { icon: "🤝", text: "No direct channel to restaurants, retailers & exporters" },
];

const SOLUTIONS = [
  { icon: "🌾", text: "Sell your harvest directly to verified buyers — no middlemen" },
  { icon: "🏪", text: "Shop agri-inputs from trusted, verified local vendors" },
  { icon: "💳", text: "Transparent pricing with UPI or Cash on Delivery, and full order tracking" },
  { icon: "📊", text: "One dashboard for your farm — crop listings, buyer leads, and revenue" },
];

export default function ProblemSolutionScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: spacing.screenPadding, paddingTop: spacing.xl * 1.25, paddingBottom: spacing.lg }}>
        <Text style={styles.eyebrow}>WHY ULUME EXISTS</Text>
        <Text style={styles.headline}>Farming shouldn't mean{"\n"}losing to the middleman.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>The problem today</Text>
          {PROBLEMS.map((item) => (
            <View key={item.text} style={styles.row}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={styles.rowText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.solutionCard]}>
          <Text style={[styles.cardTitle, styles.solutionTitle]}>What ULUME provides</Text>
          {SOLUTIONS.map((item) => (
            <View key={item.text} style={styles.row}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={[styles.rowText, styles.solutionText]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate("Landing")}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  eyebrow: { ...typography.caption, color: colors.accentDark, fontWeight: "700", letterSpacing: 1 },
  headline: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 34 },
  card: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  solutionCard: { backgroundColor: colors.primary },
  solutionTitle: { color: colors.white },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  rowIcon: { fontSize: 18, lineHeight: 22 },
  rowText: { ...typography.body, color: colors.textPrimary, flex: 1, lineHeight: 21 },
  solutionText: { color: colors.primaryLight },
  footer: { padding: spacing.screenPadding, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  continueBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  continueBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
