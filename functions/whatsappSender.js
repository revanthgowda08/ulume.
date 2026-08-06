const axios = require("axios");
const functions = require("firebase-functions");

const WHATSAPP_PHONE_ID = process.env.EXPO_PUBLIC_WHATSAPP_PHONE_ID || functions.config().whatsapp?.phone_id;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || functions.config().whatsapp?.access_token;
const GRAPH_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;

const sendWhatsappText = async (toPhone, body) => {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.warn("WhatsApp credentials missing — skipping send to", toPhone);
    return null;
  }
  try {
    const res = await axios.post(
      GRAPH_URL,
      {
        messaging_product: "whatsapp",
        to: toPhone.replace("+", ""),
        type: "text",
        text: { body },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` } }
    );
    return res.data;
  } catch (e) {
    console.error("WhatsApp send failed", e.response?.data || e.message);
    return null;
  }
};

const sendOrderConfirmationToFarmer = (order) =>
  sendWhatsappText(
    order.farmerPhone,
    `🌾 ULUME - ಆರ್ಡರ್ ಖಚಿತ!\n\nಆರ್ಡರ್ ID: ${order.orderId}\nಮೊತ್ತ: ₹${order.total}\nಪಾವತಿ: ಹಣ ಸಾಮಾನು ಬಂದ ಮೇಲೆ\n\nನಿಮ್ಮ ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಮಾರಾಟಗಾರರು ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.`
  );

const sendOrderAlertToSeller = (order) =>
  sendWhatsappText(
    order.sellerPhone,
    `🔔 ULUME - ಹೊಸ ಆರ್ಡರ್!\n\nಆರ್ಡರ್ ID: ${order.orderId}\nರೈತ: ${order.farmerName || order.farmerPhone}\nಮೊತ್ತ: ₹${order.total}\n\nಆಪ್ ತೆರೆದು ಆರ್ಡರ್ ಕನ್ಫರ್ಮ್ ಮಾಡಿ.`
  );

const sendStatusUpdateToFarmer = (order, message) => sendWhatsappText(order.farmerPhone, message);

const sendOutForDeliveryAlert = (order) =>
  sendWhatsappText(order.farmerPhone, `🚚 ULUME - ${order.orderId} ದಾರಿಯಲ್ಲಿ ಇದೆ! ಶೀಘ್ರದಲ್ಲೇ ತಲುಪುತ್ತದೆ.`);

const sendWeeklyPayoutAlert = (seller, settlement) =>
  sendWhatsappText(
    seller.phone,
    `💰 ULUME ಸಾಪ್ತಾಹಿಕ ಪಾವತಿ\n\n${settlement.totalOrders} ಆರ್ಡರ್‌ಗಳಿಗೆ ₹${settlement.netPayout} ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ.`
  );

module.exports = {
  sendWhatsappText,
  sendOrderConfirmationToFarmer,
  sendOrderAlertToSeller,
  sendStatusUpdateToFarmer,
  sendOutForDeliveryAlert,
  sendWeeklyPayoutAlert,
};
