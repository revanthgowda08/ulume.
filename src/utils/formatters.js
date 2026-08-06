export const formatRupees = (amount) => `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;

export const formatDistance = (km) => {
  if (km == null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

export const formatOrderDate = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("kn-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const ORDER_STATUS_LABELS_KN = {
  placed: "ಆರ್ಡರ್ ಆಯ್ತು",
  confirmed: "ದೃಢಪಟ್ಟಿದೆ",
  out_for_delivery: "ದಾರಿಯಲ್ಲಿ ಇದೆ",
  delivered: "ತಲುಪಿತು",
  cancelled: "ರದ್ದಾಗಿದೆ",
  returned: "ವಾಪಸ್ ಆಗಿದೆ",
};

export const ORDER_STATUS_STEPS = ["placed", "confirmed", "out_for_delivery", "delivered"];
export const ORDER_STATUS_ICONS = ["📋", "✅", "🚚", "🏠"];

export const calculateDeliveryCharge = (subtotal, isFirstOrder) => {
  if (isFirstOrder) return 0;
  if (subtotal >= 299) return 0;
  return 30;
};

export const maskPhone = (phone) => (phone ? `${phone.slice(0, -4).replace(/./g, "•")}${phone.slice(-4)}` : "");
