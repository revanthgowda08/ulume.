/**
 * Creates the four "Try a demo account" users shown on the Login screen
 * (Farmer / Buyer / Vendor / Admin), matching ulume.shop's demo accounts —
 * a real Firebase Auth user plus a matching Firestore profile doc for each.
 *
 * Usage:
 *   1. Download a service account key from Firebase Console
 *      (Project Settings > Service Accounts > Generate new private key)
 *      and save it as scripts/serviceAccountKey.json (gitignored).
 *   2. npm run seed:demo
 *
 * Safe to re-run: existing accounts/docs are updated in place, not duplicated.
 */
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const keyPath = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(keyPath)) {
  console.error(
    "Missing scripts/serviceAccountKey.json — download it from Firebase Console " +
      "(Project Settings > Service Accounts > Generate new private key) and place it there."
  );
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const auth = admin.auth();
const db = admin.firestore();

// Matches src/screens/onboarding/LoginScreen.jsx DEMO_ACCOUNTS.
const DEMO_PASSWORD = "Demo@1234";

const DEMO_USERS = [
  {
    role: "farmer",
    email: "farmer1@ulume.com",
    collection: "users",
    profile: {
      name: "Ramesh Patil",
      phone: "9900000011",
      state: "Karnataka",
      district: "Mysuru",
      village: "Hunsur",
      farmName: "Green Valley Organics",
      sizeAcres: 12,
      latitude: 12.3035,
      longitude: 76.2912,
      description: "3rd generation organic farm. Certified by India Organic.",
      certifications: ["organic", "fair-trade"],
      walletBalance: 0,
      totalOrders: 0,
      isActive: true,
    },
  },
  {
    role: "buyer",
    email: "buyer@ulume.com",
    collection: "buyers",
    profile: {
      name: "Spice Garden Restaurants",
      phone: "9900000012",
      state: "Karnataka",
      district: "Bengaluru",
      savedFarmerIds: [],
      totalOrders: 0,
      isActive: true,
    },
  },
  {
    role: "vendor",
    email: "vendor@ulume.com",
    collection: "sellers",
    profile: {
      ownerName: "AgroSupply Co.",
      shopName: "AgroSupply Co.",
      shopNameKannada: "ಅಗ್ರೋ ಸಪ್ಲೈ",
      phone: "9900000013",
      state: "Maharashtra",
      district: "Pune",
      isVerified: true,
      plan: "gold",
      rating: 0,
      totalRatings: 0,
      totalOrders: 0,
      totalGmv: 0,
      commissionRate: 0.065,
      isActive: true,
    },
  },
  {
    role: "admin",
    email: "admin@ulume.com",
    collection: "admins",
    profile: {
      name: "ULUME Admin",
      state: "Karnataka",
      district: "Bengaluru",
    },
  },
];

async function upsertUser(email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (e) {
    return auth.createUser({ email, password: DEMO_PASSWORD, emailVerified: true });
  }
}

async function seed() {
  for (const demo of DEMO_USERS) {
    console.log(`Setting up ${demo.role} demo account (${demo.email})...`);
    const userRecord = await upsertUser(demo.email);
    await db
      .collection(demo.collection)
      .doc(userRecord.uid)
      .set(
        {
          uid: userRecord.uid,
          email: demo.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          ...demo.profile,
        },
        { merge: true }
      );
    console.log(`  -> uid ${userRecord.uid}`);
  }
  console.log("\nDone. Demo password for all accounts:", DEMO_PASSWORD);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
