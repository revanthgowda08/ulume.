import { auth, firestore } from "./config";

// NOTE: Real Firebase Phone Auth (SMS OTP) requires SHA-1/SHA-256 certificate
// fingerprints registered in the Firebase console, tied to the exact signing
// keystore the APK was built with. That doesn't work with an EAS-managed cloud
// keystore without extra setup, so login here signs in anonymously and treats
// the entered phone number as an unverified profile field instead. Swap this
// back to sendOTP/verifyOTP (still below, unused) once real OTP is wired up.
export const loginWithPhone = async (phoneNumber) => {
  const credential = await auth().signInAnonymously();
  return { user: credential.user, phoneNumber };
};

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
