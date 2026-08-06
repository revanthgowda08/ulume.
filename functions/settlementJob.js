const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { sendWeeklyPayoutAlert } = require("./whatsappSender");

const db = () => admin.firestore();

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const weeklySettlement = functions.pubsub
  .schedule("0 9 * * 1")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const now = new Date();
    const weekEnd = startOfWeek(now);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const ordersSnap = await db()
      .collection("orders")
      .where("status", "==", "delivered")
      .where("paymentStatus", "==", "pending")
      .get();

    const bySeller = {};
    ordersSnap.docs.forEach((doc) => {
      const order = doc.data();
      if (!bySeller[order.sellerId]) bySeller[order.sellerId] = { orders: [], totalGmv: 0, totalCommission: 0 };
      bySeller[order.sellerId].orders.push(doc.id);
      bySeller[order.sellerId].totalGmv += order.total || 0;
      bySeller[order.sellerId].totalCommission += order.commissionAmount || 0;
    });

    const batch = db().batch();
    for (const [sellerId, data] of Object.entries(bySeller)) {
      const netPayout = data.totalGmv - data.totalCommission;
      const settlementRef = db().collection("settlements").doc();
      batch.set(settlementRef, {
        sellerId,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        totalOrders: data.orders.length,
        totalGmv: data.totalGmv,
        totalCommission: data.totalCommission,
        netPayout,
        status: "processed",
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        orderIds: data.orders,
      });

      data.orders.forEach((orderId) => {
        batch.update(db().collection("orders").doc(orderId), { paymentStatus: "settled" });
      });

      const sellerDoc = await db().collection("sellers").doc(sellerId).get();
      if (sellerDoc.exists) {
        await sendWeeklyPayoutAlert(sellerDoc.data(), { totalOrders: data.orders.length, netPayout });
      }
    }

    await batch.commit();
    console.log(`Weekly settlement processed for ${Object.keys(bySeller).length} sellers`);
    return null;
  });

module.exports = { weeklySettlement };
