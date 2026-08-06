import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { formatRupees } from "../../utils/formatters";
import { firestore } from "../../services/firebase/config";
import { useT } from "../../i18n/useT";

export default function OrderConfirmScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const t = useT();

  useEffect(() => {
    firestore()
      .collection("orders")
      .doc(orderId)
      .get()
      .then((doc) => doc.exists && setOrder({ id: doc.id, ...doc.data() }));
  }, [orderId]);

  return (
    <View style={styles.screen}>
      <Text style={styles.icon}>🎉</Text>
      <Text style={styles.title}>{t("ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿದೆ!")}</Text>
      <Text style={styles.orderId}>{orderId}</Text>

      {order ? (
        <View style={styles.card}>
          <Text style={styles.cardRow}>{t("ಒಟ್ಟು")}: {formatRupees(order.total)}</Text>
          <Text style={styles.cardRow}>{t("ಪಾವತಿ")}: 💰 {t("ಹಣ ಸಾಮಾನು ಬಂದ ಮೇಲೆ")}</Text>
          <Text style={styles.whatsapp}>✅ {t("WhatsApp ನಲ್ಲಿ ಖಚಿತೀಕರಣ ಕಳುಹಿಸಲಾಗಿದೆ")}</Text>
        </View>
      ) : (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      )}

      <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.replace("OrderTracking", { orderId })}>
        <Text style={styles.trackBtnText}>{t("ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.homeLink}>
        <Text style={styles.homeLinkText}>{t("ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", padding: spacing.screenPadding },
  icon: { fontSize: 72 },
  title: { ...typography.h2, color: colors.primary, marginTop: spacing.md },
  orderId: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
  card: { backgroundColor: colors.grayLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginTop: spacing.lg, width: "100%" },
  cardRow: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.xs },
  whatsapp: { ...typography.caption, color: colors.primaryMid, marginTop: spacing.xs },
  trackBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  trackBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  homeLink: { marginTop: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  homeLinkText: { ...typography.body, color: colors.textMuted },
});
