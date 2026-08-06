import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { ORDER_STATUS_STEPS, ORDER_STATUS_ICONS } from "../utils/formatters";

export default function OrderStatusBar({ status }) {
  const currentIndex = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <View style={styles.row}>
      {ORDER_STATUS_STEPS.map((step, i) => {
        const completed = i <= currentIndex;
        return (
          <View key={step} style={styles.stepWrap}>
            <View style={[styles.circle, completed && styles.circleActive]}>
              <Text style={styles.icon}>{ORDER_STATUS_ICONS[i]}</Text>
            </View>
            {i < ORDER_STATUS_STEPS.length - 1 && (
              <View style={[styles.line, i < currentIndex && styles.lineActive]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  stepWrap: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grayLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  circleActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  icon: { fontSize: 18 },
  line: { width: 28, height: 3, backgroundColor: colors.border },
  lineActive: { backgroundColor: colors.primaryMid },
});
