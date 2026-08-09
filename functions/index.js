const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { onOrderCreated, onOrderStatusUpdate } = require("./orderHandler");
const { weeklySettlement } = require("./settlementJob");
const { sendOrderConfirmationToFarmer, sendWhatsappText } = require("./whatsappSender");
const { createRazorpayOrder, verifyRazorpayPayment } = require("./razorpay");

exports.onOrderCreated = onOrderCreated;
exports.onOrderStatusUpdate = onOrderStatusUpdate;
exports.weeklySettlement = weeklySettlement;
exports.createRazorpayOrder = createRazorpayOrder;
exports.verifyRazorpayPayment = verifyRazorpayPayment;

// Triggered when the admin panel approves/rejects a seller (writes isVerified).
// Sends the WhatsApp notification server-side so the access token never has
// to live in the admin panel's browser bundle.
exports.onSellerVerified = functions.firestore
  .document("sellers/{sellerId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.isVerified === after.isVerified) return null;

    const message = after.isVerified
      ? `🎉 ULUME - ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಅಂಗಡಿ "${after.shopNameKannada || after.shopName}" ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಈಗ ನೀವು ಮಾರಾಟ ಪ್ರಾರಂಭಿಸಬಹುದು!`
      : `ULUME - ನಿಮ್ಮ ಅಂಗಡಿ ನೋಂದಣಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;

    await sendWhatsappText(after.phone, message);
    return null;
  });

exports.referralCredit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  const { referralCode } = data;
  if (!referralCode) {
    throw new functions.https.HttpsError("invalid-argument", "referralCode is required");
  }

  const db = admin.firestore();
  const referrerSnap = await db.collection("users").where("referralCode", "==", referralCode).limit(1).get();
  if (referrerSnap.empty) {
    throw new functions.https.HttpsError("not-found", "Invalid referral code");
  }

  const referrerDoc = referrerSnap.docs[0];
  await referrerDoc.ref.update({
    walletBalance: admin.firestore.FieldValue.increment(50),
  });

  const fcmToken = referrerDoc.data().fcmToken;
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title: "ULUME", body: "🎁 ನಿಮಗೆ ₹50 ರೆಫರಲ್ ಬೋನಸ್ ಸಿಕ್ಕಿದೆ!" },
    }).catch((e) => console.error("Referral FCM failed", e));
  }

  return { success: true, referrerId: referrerDoc.id };
});

exports.resendOrderWhatsapp = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  const { orderId } = data;
  const orderDoc = await admin.firestore().collection("orders").doc(orderId).get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }
  await sendOrderConfirmationToFarmer({ ...orderDoc.data(), orderId });
  return { success: true };
});
