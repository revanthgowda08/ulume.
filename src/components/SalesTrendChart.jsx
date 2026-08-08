import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const toDate = (timestamp) => (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp));

// Builds a 7-day bucket ending today from a flat list of orders, oldest first.
const buildDailyTotals = (orders) => {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return { date: d, total: 0 };
  });
  orders.forEach((order) => {
    const orderDate = toDate(order.createdAt);
    const bucket = days.find((d) => d.date.toDateString() === orderDate.toDateString());
    if (bucket) bucket.total += order.total || 0;
  });
  return days;
};

export default function SalesTrendChart({ orders }) {
  const days = buildDailyTotals(orders);
  const maxTotal = Math.max(...days.map((d) => d.total), 1);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Sales Trend (7 days)</Text>
      <View style={styles.barsRow}>
        {days.map((d, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { height: `${Math.max((d.total / maxTotal) * 100, d.total > 0 ? 4 : 0)}%` },
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{DAY_LABELS[d.date.getDay()]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginHorizontal: spacing.screenPadding, marginBottom: spacing.sm },
  title: { ...typography.h3, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  barsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 100 },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: { width: 18, height: 80, justifyContent: "flex-end", backgroundColor: colors.grayLight, borderRadius: 6, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: colors.accent, borderRadius: 6 },
  dayLabel: { ...typography.caption, color: colors.textMuted, marginTop: 4, fontSize: 11 },
});
