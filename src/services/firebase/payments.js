import { functions } from "./config";

// Amount must be created server-side (never trust a client-supplied amount
// for what Razorpay actually charges) — this callable looks up the order's
// own `total` in Firestore and opens a matching Razorpay order against it.
export const createRazorpayOrder = async (orderId) => {
  const result = await functions().httpsCallable("createRazorpayOrder")({ orderId });
  return result.data;
};

// Payment success is never taken on the client's word — this callable
// re-verifies the Razorpay signature server-side with the secret key before
// marking the order paid, so a tampered client can't fake a successful charge.
export const verifyRazorpayPayment = async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const result = await functions().httpsCallable("verifyRazorpayPayment")({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return result.data;
};
