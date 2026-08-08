import { auth, firestore } from "./config";

// Email/password auth, matching ulume.shop's signup form (Name, Phone, Email,
// Password, State, District + role picker). Real Firebase Phone Auth (SMS
// OTP) needs SHA-1/SHA-256 certificate fingerprints tied to the exact signing
// keystore, which isn't practical with an EAS-managed cloud keystore — so
// phone number is stored as a plain (unverified) profile field instead.
export const signUpWithEmail = async (email, password) => {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  return credential.user;
};

export const loginWithEmail = async (email, password) => {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  return credential.user;
};

export const getFarmerProfile = async (uid) => {
  const doc = await firestore().collection("users").doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const getSellerProfile = async (uid) => {
  const doc = await firestore().collection("sellers").doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const getBuyerProfile = async (uid) => {
  const doc = await firestore().collection("buyers").doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const createFarmerProfile = async (uid, data) => {
  const payload = {
    uid,
    walletBalance: 0,
    totalOrders: 0,
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
    ...data,
  };
  await firestore().collection("users").doc(uid).set(payload, { merge: true });
  return payload;
};

export const createSellerProfile = async (uid, data) => {
  const payload = {
    uid,
    isVerified: false,
    plan: "basic",
    rating: 0,
    totalRatings: 0,
    totalOrders: 0,
    totalGmv: 0,
    commissionRate: 0.065,
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
    ...data,
  };
  await firestore().collection("sellers").doc(uid).set(payload, { merge: true });
  return payload;
};

export const createBuyerProfile = async (uid, data) => {
  const payload = {
    uid,
    savedFarmerIds: [],
    totalOrders: 0,
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
    ...data,
  };
  await firestore().collection("buyers").doc(uid).set(payload, { merge: true });
  return payload;
};

export const signOutUser = async () => {
  await auth().signOut();
};

export const onAuthStateChanged = (callback) => auth().onAuthStateChanged(callback);
