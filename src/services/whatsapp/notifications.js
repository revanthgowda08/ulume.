import functions from "@react-native-firebase/functions";
import firestoreModule from "@react-native-firebase/firestore";

// NOTE: The WhatsApp Business API access token must never live on the client.
// Actual message sending happens server-side in functions/whatsappSender.js,
// triggered automatically by Firestore order writes (see functions/orderHandler.js).
// This module only exposes a callable to request a resend from the app UI
// (e.g. a "Resend confirmation" button on OrderTrackingScreen).

export const resendOrderWhatsapp = async (orderId) => {
  const callable = functions().httpsCallable("resendOrderWhatsapp");
  const { data } = await callable({ orderId });
  return data;
};

export const markWhatsappSent = async (orderId) => {
  await firestoreModule()
    .collection("orders")
    .doc(orderId)
    .update({ whatsappSent: true });
};
