import { auth, firestore } from "./config";

let confirmationResult = null;

export const sendOTP = async (phoneNumber) => {
  // phoneNumber must be E.164, e.g. +91XXXXXXXXXX
  confirmationResult = await auth().signInWithPhoneNumber(phoneNumber);
  return confirmationResult;
};

export const verifyOTP = async (code) => {
  if (!confirmationResult) throw new Error("NO_OTP_REQUEST_IN_PROGRESS");
  const credential = await confirmationResult.confirm(code);
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

export const signOutUser = async () => {
  await auth().signOut();
};

export const onAuthStateChanged = (callback) => auth().onAuthStateChanged(callback);
