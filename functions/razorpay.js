const crypto = require("crypto");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");

const KEY_ID = process.env.RAZORPAY_KEY_ID || functions.config().razorpay?.key_id;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay?.key_secret;

const razorpayInstance = () => {
  if (!KEY_ID || !KEY_SECRET) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Razorpay isn't configured on the server yet (missing key_id/key_secret)."
    );
  }
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
};

// Creates a Razorpay order sized to the ULUME order's own `total` — the
// amount is never taken from the client, only looked up server-side, so a
// tampered app can't talk the server into charging less than the real total.
const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  const { orderId } = data;
  if (!orderId) {
    throw new functions.https.HttpsError("invalid-argument", "orderId is required");
  }

  const db = admin.firestore();
  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }
  const order = orderDoc.data();

  if (order.farmerId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "This isn't your order");
  }
  if (order.paymentStatus === "paid") {
    throw new functions.https.HttpsError("failed-precondition", "This order is already paid");
  }

  const amountPaise = Math.round(order.total * 100);
  const razorpayOrder = await razorpayInstance().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: orderId,
    notes: { ulumeOrderId: orderId },
  });

  await orderRef.update({ razorpayOrderId: razorpayOrder.id });

  return { razorpayOrderId: razorpayOrder.id, amount: amountPaise, currency: "INR", keyId: KEY_ID };
});

// The client reports a "successful" payment via the Razorpay SDK callback,
// but that report is never trusted on its own — the signature is
// recomputed here with the secret key (which never leaves the server) and
// compared byte-for-byte before the order is marked paid.
const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new functions.https.HttpsError("invalid-argument", "Missing payment verification fields");
  }

  const db = admin.firestore();
  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }
  const order = orderDoc.data();

  if (order.farmerId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "This isn't your order");
  }
  if (order.razorpayOrderId !== razorpayOrderId) {
    throw new functions.https.HttpsError("failed-precondition", "Razorpay order mismatch");
  }

  if (!KEY_SECRET) {
    throw new functions.https.HttpsError("failed-precondition", "Razorpay isn't configured on the server yet.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const signaturesMatch =
    expectedSignature.length === razorpaySignature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));

  if (!signaturesMatch) {
    throw new functions.https.HttpsError("failed-precondition", "Payment signature verification failed");
  }

  await orderRef.update({
    paymentStatus: "paid",
    razorpayPaymentId,
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
