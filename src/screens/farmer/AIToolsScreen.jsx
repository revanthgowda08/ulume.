import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

const TOOLS = [
  {
    key: "CropAdvisor",
    icon: "🌾",
    title: "AI Crop Advisor",
    subtitle: "Get crop and sowing recommendations based on your soil and season.",
  },
  {
    key: "DiseaseDetection",
    icon: "🔬",
    title: "Disease Detection",
    subtitle: "Photograph a crop to check for common pests and diseases.",
  },
];

export default function AIToolsScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPadding }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Tools</Text>
      </View>

      {TOOLS.map((tool) => (
        <TouchableOpacity key={tool.key} style={styles.card} onPress={() => navigation.navigate(tool.key)}>
          <Text style={styles.cardIcon}>{tool.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{tool.title}</Text>
            <Text style={styles.cardSubtitle}>{tool.subtitle}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  cardIcon: { fontSize: 30 },
  cardTitle: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  cardSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textMuted },
});
