import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import RazorpayCheckout from "react-native-razorpay";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { formatRupees, calculateDeliveryCharge } from "../../utils/formatters";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { placeOrder, getSellerById } from "../../services/firebase/firestore";
import { createRazorpayOrder, verifyRazorpayPayment } from "../../services/firebase/payments";
import { useT } from "../../i18n/useT";

const STEPS = ["ವಿಳಾಸ", "ಪಾವತಿ", "ಖಚಿತ", "ಯಶಸ್ಸು"];

export default function CheckoutScreen({ navigation }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [commissionRate, setCommissionRate] = useState(0.065);
  const progress = useRef(new Animated.Value(0)).current;

  const { items, getTotal, clearCart } = useCartStore();
  const { user, seller } = useAuthStore();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (step + 1) / STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  useEffect(() => {
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      const pos = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (geocode?.[0]) {
        const g = geocode[0];
        setAddress([g.name, g.street, g.district, g.region].filter(Boolean).join(", "));
      }
    })();
  }, []);

  const subtotal = getTotal();
  const isFirstOrder = (user?.totalOrders || 0) === 0;
  const deliveryCharge = calculateDeliveryCharge(subtotal, isFirstOrder);
  const total = subtotal + deliveryCharge;
  const sellerId = items[0]?.product.sellerId;

  useEffect(() => {
    if (!sellerId) return;
    getSellerById(sellerId).then((s) => {
      if (s?.commissionRate) setCommissionRate(s.commissionRate);
    });
  }, [sellerId]);

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    let id = null;
    try {
      const commissionAmount = Math.round(subtotal * commissionRate);
      id = await placeOrder({
        farmerId: user.uid,
        farmerName: user.name || "",
        farmerPhone: user.phone,
        farmerAddress: address,
        farmerLocation: null,
        sellerId,
        sellerName: items[0]?.product.sellerName,
        sellerPhone: items[0]?.product.sellerPhone,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          productNameKannada: i.product.nameKannada,
          quantity: i.qty,
          price: i.product.price,
          subtotal: i.product.price * i.qty,
        })),
        subtotal,
        deliveryCharge,
        total,
        commissionRate,
        commissionAmount,
        isFirstOrder,
        paymentMethod,
      });
    } catch (e) {
      setPlacing(false);
      Alert.alert(t("ದೋಷ"), t("ಆರ್ಡರ್ ಇಡಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ."));
      return;
    }
    setPlacing(false);

    if (paymentMethod === "cod") {
      setOrderId(id);
      clearCart();
      setStep(3);
      return;
    }

    // Online payment: the order already exists (as "pending") so if the user
    // abandons or the payment fails, it's still there for retry or COD
    // fallback — nothing about the charge itself is decided by this device.
    setPayingOnline(true);
    try {
      const razorpayOrder = await createRazorpayOrder(id);
      const result = await RazorpayCheckout.open({
        order_id: razorpayOrder.razorpayOrderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: razorpayOrder.keyId,
        name: "ULUME",
        description: `Order ${id}`,
        prefill: { contact: user.phone || "", name: user.name || "" },
        theme: { color: "#1A3C34" },
      });
      await verifyRazorpayPayment({
        orderId: id,
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      setOrderId(id);
      clearCart();
      setStep(3);
    } catch (e) {
      Alert.alert(
        "Payment not completed",
        "Your order is saved but payment wasn't confirmed. You can try paying again from Order Tracking, or ask the vendor about Cash on Delivery."
      );
      navigation.replace("OrderTracking", { orderId: id });
    } finally {
      setPayingOnline(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        />
      </View>
      <View style={styles.stepLabels}>
        {STEPS.map((s, i) => (
          <Text key={s} style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{t(s)}</Text>
        ))}
      </View>

      <View style={styles.body}>
        {step === 0 && (
          <View>
            <Text style={styles.sectionTitle}>{t("ವಿಳಾಸ")}</Text>
            <TextInput
              style={styles.addressInput}
              multiline
              value={address}
              onChangeText={setAddress}
              placeholder={t("ನಿಮ್ಮ ಪೂರ್ಣ ವಿಳಾಸ ಬರೆಯಿರಿ")}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(1)} disabled={!address.trim()}>
              <Text style={styles.nextBtnText}>{t("ಮುಂದೆ")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>{t("ಪಾವತಿ")}</Text>
            <TouchableOpacity
              style={[styles.codCard, paymentMethod !== "cod" && styles.paymentCardInactive]}
              onPress={() => setPaymentMethod("cod")}
            >
              <Text style={styles.codCardTitle}>💰 {t("ಹಣ ಸಾಮಾನು ಬಂದ ಮೇಲೆ")} (CoD)</Text>
              <Text style={styles.codCardSub}>{paymentMethod === "cod" ? t("ಆಯ್ಕೆಯಾಗಿದೆ") : "Tap to select"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.upiCard, paymentMethod === "upi" && styles.upiCardActive]}
              onPress={() => setPaymentMethod("upi")}
            >
              <Text style={[styles.upiCardTitle, paymentMethod === "upi" && styles.upiCardTitleActive]}>📱 UPI / Card</Text>
              <Text style={[styles.upiCardSub, paymentMethod === "upi" && styles.upiCardSubActive]}>
                {paymentMethod === "upi" ? t("ಆಯ್ಕೆಯಾಗಿದೆ") : "Pay online via Razorpay — tap to select"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>{t("ಮುಂದೆ")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>{t("ಆರ್ಡರ್ ಸಾರಾಂಶ")}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("ಉಪಮೊತ್ತ")}</Text>
              <Text style={styles.summaryValue}>{formatRupees(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("ಡೆಲಿವರಿ")}</Text>
              <Text style={styles.summaryValue}>{deliveryCharge === 0 ? t("ಉಚಿತ") : formatRupees(deliveryCharge)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t("ಒಟ್ಟು")}</Text>
              <Text style={styles.totalValue}>{formatRupees(total)}</Text>
            </View>
            <Text style={styles.addressPreview}>📍 {address}</Text>
            <Text style={styles.paymentPreview}>
              {paymentMethod === "cod" ? "💰 Cash on Delivery" : "📱 Pay online via UPI/Card"}
            </Text>
            <TouchableOpacity style={styles.nextBtn} onPress={handlePlaceOrder} disabled={placing || payingOnline}>
              {placing || payingOnline ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.nextBtnText}>{t("ಆರ್ಡರ್ ಇಡಿ")}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>{t("ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿದೆ!")}</Text>
            <Text style={styles.orderIdText}>{orderId}</Text>
            <Text style={styles.whatsappText}>✅ {t("WhatsApp ನಲ್ಲಿ ಖಚಿತೀಕರಣ ಕಳುಹಿಸಲಾಗಿದೆ")}</Text>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => navigation.replace("OrderTracking", { orderId })}
            >
              <Text style={styles.nextBtnText}>{t("ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, padding: spacing.screenPadding },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primaryMid },
  stepLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  stepLabel: { ...typography.caption, color: colors.textMuted },
  stepLabelActive: { color: colors.primary, fontWeight: "700" },
  body: { marginTop: spacing.xl, flex: 1 },
  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  addressInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: "top",
    ...typography.body,
    color: colors.textPrimary,
  },
  nextBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  nextBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  codCard: { borderWidth: 2, borderColor: colors.primaryMid, backgroundColor: colors.primaryLight, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  codCardTitle: { ...typography.h3, color: colors.primary },
  codCardSub: { ...typography.caption, color: colors.primaryMid, marginTop: 4 },
  paymentCardInactive: { borderColor: colors.border, backgroundColor: colors.white, opacity: 0.6 },
  upiCard: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  upiCardActive: { borderWidth: 2, borderColor: colors.primaryMid, backgroundColor: colors.primaryLight },
  upiCardTitle: { ...typography.h3, color: colors.textMuted },
  upiCardTitleActive: { color: colors.primary },
  upiCardSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  upiCardSubActive: { color: colors.primaryMid },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.body, color: colors.textPrimary },
  totalRow: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  totalLabel: { ...typography.h3, color: colors.textPrimary },
  totalValue: { ...typography.h3, color: colors.textPrimary },
  addressPreview: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
  paymentPreview: { ...typography.body, color: colors.textPrimary, marginTop: spacing.xs, fontWeight: "600" },
  successBox: { alignItems: "center", marginTop: spacing.xl },
  successIcon: { fontSize: 64 },
  successTitle: { ...typography.h2, color: colors.primary, marginTop: spacing.md },
  orderIdText: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
  whatsappText: { ...typography.body, color: colors.primaryMid, marginTop: spacing.sm },
});
