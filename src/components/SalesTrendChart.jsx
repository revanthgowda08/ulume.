import { View, Text, StyleSheet } from "react-native";
import Svg, { Line, Polyline, Circle, Text as SvgText } from "react-native-svg";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

const toDate = (timestamp) => (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp));
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Groups orders into monthly buckets (last 6 months, oldest first) — mirrors
// ulume.shop's vendor Sales Trend, which plots monthly totals as a line.
const buildMonthlyTotals = (orders) => {
  const now = new Date();
  const months = [...Array(6)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), total: 0 };
  });
  orders.forEach((order) => {
    const d = toDate(order.createdAt);
    const bucket = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (bucket) bucket.total += order.total || 0;
  });
  return months;
};

const niceMax = (value) => {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
};

const CHART_WIDTH = 280;
const CHART_HEIGHT = 140;
const PADDING_LEFT = 44;
const PADDING_BOTTOM = 20;
const PADDING_TOP = 10;

export default function SalesTrendChart({ orders }) {
  const months = buildMonthlyTotals(orders);
  const max = niceMax(Math.max(...months.map((m) => m.total)));
  const plotWidth = CHART_WIDTH - PADDING_LEFT - 8;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const points = months.map((m, i) => {
    const x = PADDING_LEFT + (i / (months.length - 1)) * plotWidth;
    const y = PADDING_TOP + plotHeight - (m.total / max) * plotHeight;
    return { x, y, total: m.total };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Sales Trend</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {gridSteps.map((step) => {
          const y = PADDING_TOP + plotHeight - step * plotHeight;
          return (
            <Line
              key={step}
              x1={PADDING_LEFT}
              y1={y}
              x2={CHART_WIDTH - 8}
              y2={y}
              stroke={colors.border}
              strokeDasharray="3,3"
              strokeWidth={1}
            />
          );
        })}
        {gridSteps.map((step) => {
          const y = PADDING_TOP + plotHeight - step * plotHeight;
          return (
            <SvgText key={step} x={PADDING_LEFT - 8} y={y + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
              {Math.round(max * step)}
            </SvgText>
          );
        })}
        <Polyline points={polylinePoints} fill="none" stroke={colors.primary} strokeWidth={2} />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill={colors.primary} />
        ))}
        {months.map((m, i) => (
          <SvgText
            key={i}
            x={PADDING_LEFT + (i / (months.length - 1)) * plotWidth}
            y={CHART_HEIGHT - 4}
            fontSize={9}
            fill={colors.textMuted}
            textAnchor="middle"
          >
            {MONTH_LABELS[m.month]}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm, alignItems: "center" },
  title: { ...typography.h3, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.sm, alignSelf: "flex-start" },
});
