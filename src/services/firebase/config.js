// @react-native-firebase/* modules auto-initialize from google-services.json on Android,
// so no manual initializeApp() call is required. This file re-exports the native
// module instances so the rest of the app has one place to import them from, and
// applies the 2G/offline-friendly Firestore settings from STEP 15.
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import messaging from "@react-native-firebase/messaging";

firestore().settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  persistence: true,
});

export { firestore, auth, storage, messaging };
