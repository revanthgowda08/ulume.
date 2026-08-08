import { firestore } from "./config";

const PAGE_SIZE = 10;

// --- Products ---

export const getProductsPage = async ({ category = null, district = null, cursor = null } = {}) => {
  let query = firestore().collection("products").where("isAvailable", "==", true);
  if (category) query = query.where("category", "==", category);
  if (district) query = query.where("district", "==", district);
  query = query.orderBy("orderCount", "desc").limit(PAGE_SIZE);
  if (cursor) query = query.startAfter(cursor);

  const snap = await query.get();
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { products, nextCursor };
};

export const getProductById = async (id) => {
  const doc = await firestore().collection("products").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const incrementProductViewCount = (id) =>
  firestore()
    .collection("products")
    .doc(id)
    .update({ viewCount: firestore.FieldValue.increment(1) });

// --- Sellers ---

export const getNearbySellers = async (district, limitCount = 10) => {
  const snap = await firestore()
    .collection("sellers")
    .where("district", "==", district)
    .where("isActive", "==", true)
    .orderBy("rating", "desc")
    .limit(limitCount)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getSellerById = async (id) => {
  const doc = await firestore().collection("sellers").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// --- Orders ---

const generateOrderId = async () => {
  const year = new Date().getFullYear();
  const counterRef = firestore().collection("counters").doc(`orders-${year}`);
  const orderId = await firestore().runTransaction(async (tx) => {
    const counterDoc = await tx.get(counterRef);
    const next = (counterDoc.exists ? counterDoc.data().count : 0) + 1;
    tx.set(counterRef, { count: next }, { merge: true });
    return `ULM-${year}-${String(next).padStart(5, "0")}`;
  });
  return orderId;
};

export const placeOrder = async (orderData) => {
  const orderId = await generateOrderId();
  const payload = {
    orderId,
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "placed",
    statusHistory: [{ status: "placed", timestamp: Date.now(), updatedBy: "farmer" }],
    whatsappSent: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
    ...orderData,
  };
  await firestore().collection("orders").doc(orderId).set(payload);
  return orderId;
};

export const listenToOrder = (orderId, callback) =>
  firestore()
    .collection("orders")
    .doc(orderId)
    .onSnapshot((doc) => {
      if (doc.exists) callback({ id: doc.id, ...doc.data() });
    });

export const getFarmerOrders = async (farmerId, cursor = null) => {
  let query = firestore()
    .collection("orders")
    .where("farmerId", "==", farmerId)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE);
  if (cursor) query = query.startAfter(cursor);
  const snap = await query.get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { orders, nextCursor };
};

export const listenToSellerPendingOrders = (sellerId, callback, onError) =>
  firestore()
    .collection("orders")
    .where("sellerId", "==", sellerId)
    .where("status", "==", "placed")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (error) => {
        console.error("listenToSellerPendingOrders failed:", error);
        onError?.(error);
      }
    );

export const getSellerOrders = async (sellerId, cursor = null) => {
  let query = firestore()
    .collection("orders")
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE);
  if (cursor) query = query.startAfter(cursor);
  const snap = await query.get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { orders, nextCursor };
};

export const updateOrderStatus = async (orderId, status, updatedBy = "seller") => {
  await firestore()
    .collection("orders")
    .doc(orderId)
    .update({
      status,
      statusHistory: firestore.FieldValue.arrayUnion({ status, timestamp: Date.now(), updatedBy }),
      ...(status === "delivered" ? { deliveredAt: firestore.FieldValue.serverTimestamp(), paymentStatus: "collected" } : {}),
    });
};

// --- Products (seller) ---

export const createProduct = async (productData) => {
  const ref = await firestore().collection("products").add({
    isAvailable: true,
    viewCount: 0,
    orderCount: 0,
    rating: 0,
    isPromoted: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
    ...productData,
  });
  return ref.id;
};

export const getSellerProducts = async (sellerId, cursor = null) => {
  let query = firestore()
    .collection("products")
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE);
  if (cursor) query = query.startAfter(cursor);
  const snap = await query.get();
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { products, nextCursor };
};

export { PAGE_SIZE };
