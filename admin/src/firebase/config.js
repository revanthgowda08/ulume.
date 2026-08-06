import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Temporary diagnostic — remove once the "auth/api-key-not-valid" issue is
// resolved. Logs the exact config the running app parsed from .env so we can
// spot a stray character, missing value, etc.
console.log("[ULUME DEBUG] firebaseConfig:", JSON.stringify(firebaseConfig));
console.log("[ULUME DEBUG] apiKey length:", firebaseConfig.apiKey?.length);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
