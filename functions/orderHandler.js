const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  sendOrderConfirmationToFarmer,
  sendOrderAlertToSeller,
  sendStatusUpdateToFarmer,
  sendOutForDeliveryAlert,
} = require("./whatsappSender");

const db = () => admin.firestore();

const STATUS_MESSAGES_KN = {
  confirmed: "ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢಪಟ್ಟಿದೆ",
  out_for_delivery: "ದಾರಿಯಲ್ಲಿ ಇದೆ",
};

const onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    // Free delivery on a farmer's first order, regardless of subtotal.
    if (order.isFirstOrder && order.deliveryCharge !== 0) {
      await snap.ref.update({
        deliveryCharge: 0,
        total: order.subtotal,
      });
    }

    // Push to seller's device.
    const sellerDoc = await db().collection("sellers").doc(order.sellerId).get();
    const sellerFcmToken = sellerDoc.data()?.fcmToken;
    if (sellerFcmToken) {
      await admin.messaging().send({
        token: sellerFcmToken,
        notification: {
          title: "ಹೊಸ ಆರ್ಡರ್!",
          body: `${order.farmerName || order.farmerPhone} — ₹${order.total}`,
        },
        data: { orderId, type: "new_order" },
      }).catch((e) => console.error("FCM to seller failed", e));
    }

    await Promise.all([
      sendOrderConfirmationToFarmer({ ...order, orderId }),
      sendOrderAlertToSeller({ ...order, orderId }),
    ]);

    await snap.ref.update({ whatsappSent: true });
  });

const onOrderStatusUpdate = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    if (before.status === after.status) return null;

    const farmerDoc = await db().collection("users").doc(after.farmerId).get();
    const farmerFcmToken = farmerDoc.data()?.fcmToken;

    const notify = async (title, body) => {
      if (farmerFcmToken) {
        await admin.messaging().send({
          token: farmerFcmToken,
          notification: { title, body },
          data: { orderId, type: "order_status" },
        }).catch((e) => console.error("FCM to farmer failed", e));
      }
    };

    if (before.status === "placed" && after.status === "confirmed") {
      await notify("ULUME", STATUS_MESSAGES_KN.confirmed);
      await sendStatusUpdateToFarmer({ ...after, orderId }, `✅ ULUME - ${STATUS_MESSAGES_KN.confirmed}. ಆರ್ಡರ್: ${orderId}`);
    }

    if (before.status === "confirmed" && after.status === "out_for_delivery") {
      await notify("ULUME", STATUS_MESSAGES_KN.out_for_delivery);
      await sendOutForDeliveryAlert({ ...after, orderId });
    }

    if (before.status === "out_for_delivery" && after.status === "delivered") {
      await notify("ULUME", `₹${after.total} ಕೊಡಿ`);

      const sellerRef = db().collection("sellers").doc(after.sellerId);
      await sellerRef.update({
        totalGmv: admin.firestore.FieldValue.increment(after.total),
        totalOrders: admin.firestore.FieldValue.increment(1),
      });

      await db().collection("users").doc(after.farmerId).update({
        totalOrders: admin.firestore.FieldValue.increment(1),
      });

      if (after.isFirstOrder && after.referredBy) {
        await db().collection("referralCredits").add({
          referrerCode: after.referredBy,
          farmerId: after.farmerId,
          orderId,
          amount: 50,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    return null;
  });

module.exports = { onOrderCreated, onOrderStatusUpdate };
