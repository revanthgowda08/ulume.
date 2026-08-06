// Manual Indian-style digit grouping (e.g. 1234567 -> "12,34,567") instead of
// Number.prototype.toLocaleString("en-IN"). Hermes on Android commonly throws
// "RangeError: Incorrect locale information provided" for toLocaleString /
// toLocaleDateString with a locale argument unless the app was built with
// full ICU data, which this app isn't — so these run everywhere, including
// unconditionally on screens with zero data (e.g. the seller dashboard's
// ₹0 GMV stat), causing an immediate crash on render.
const groupIndianDigits = (digits) => {
  if (digits.length <= 3) return digits;
  let result = "," + digits.slice(-3);
  let rest = digits.slice(0, -3);
  while (rest.length > 2) {
    result = "," + rest.slice(-2) + result;
    rest = rest.slice(0, -2);
  }
  return rest + result;
};

export const formatRupees = (amount) => {
  const num = Number(amount ?? 0);
  const isNegative = num < 0;
  const grouped = groupIndianDigits(String(Math.round(Math.abs(num))));
  return `₹${isNegative ? "-" : ""}${grouped}`;
};

export const formatDistance = (km) => {
  if (km == null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatOrderDate = (timestamp) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
};

export const ORDER_STATUS_LABELS_KN = {
  placed: "ಆರ್ಡರ್ ಆಯ್ತು",
  confirmed: "ದೃಢಪಟ್ಟಿದೆ",
  out_for_delivery: "ದಾರಿಯಲ್ಲಿ ಇದೆ",
  delivered: "ತಲುಪಿತು",
  cancelled: "ರದ್ದಾಗಿದೆ",
  returned: "ವಾಪಸ್ ಆಗಿದೆ",
};

export const ORDER_STATUS_LABELS_EN = {
  placed: "Order placed",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

// Prefer this over indexing ORDER_STATUS_LABELS_KN directly so status labels
// respect the selected language.
export const getOrderStatusLabel = (status, language) =>
  (language === "en" ? ORDER_STATUS_LABELS_EN : ORDER_STATUS_LABELS_KN)[status] || status;

export const ORDER_STATUS_STEPS = ["placed", "confirmed", "out_for_delivery", "delivered"];
export const ORDER_STATUS_ICONS = ["📋", "✅", "🚚", "🏠"];

export const calculateDeliveryCharge = (subtotal, isFirstOrder) => {
  if (isFirstOrder) return 0;
  if (subtotal >= 299) return 0;
  return 30;
};

export const maskPhone = (phone) => (phone ? `${phone.slice(0, -4).replace(/./g, "•")}${phone.slice(-4)}` : "");
