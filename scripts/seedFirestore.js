/**
 * Seeds Firestore with 3 test sellers and 10 test products (with geohashes)
 * around Mysuru, Karnataka, so the app has data to render during development.
 *
 * Usage:
 *   1. Download a service account key from Firebase Console
 *      (Project Settings > Service Accounts > Generate new private key)
 *      and save it as scripts/serviceAccountKey.json (gitignored).
 *   2. npm run seed
 */
const admin = require("firebase-admin");
const { geohashForPoint } = require("geofire-common");
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
const db = admin.firestore();

// Mysuru, Karnataka area
const MYSURU_CENTER = { lat: 12.2958, lng: 76.6394 };

const jitter = (base, delta = 0.03) => base + (Math.random() - 0.5) * delta * 2;

const SELLERS = [
  {
    uid: "seed-seller-1",
    phone: "+919900000001",
    ownerName: "Ramesh Gowda",
    shopName: "Gowda Agri Center",
    shopNameKannada: "ಗೌಡ ಅಗ್ರಿ ಸೆಂಟರ್",
    address: "Sayyaji Rao Road, Mysuru",
    village: "Mysuru",
    taluk: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    deliveryRadiusKm: 10,
    categories: ["seeds", "fertilizers", "pesticides"],
    isVerified: true,
    plan: "gold",
  },
  {
    uid: "seed-seller-2",
    phone: "+919900000002",
    ownerName: "Lakshmi Devi",
    shopName: "Devi Fertilizers",
    shopNameKannada: "ದೇವಿ ಗೊಬ್ಬರ ಅಂಗಡಿ",
    address: "KRS Road, Mysuru",
    village: "Bogadi",
    taluk: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    deliveryRadiusKm: 8,
    categories: ["fertilizers", "irrigation"],
    isVerified: true,
    plan: "silver",
  },
  {
    uid: "seed-seller-3",
    phone: "+919900000003",
    ownerName: "Suresh Patel",
    shopName: "Patel Farm Tools",
    shopNameKannada: "ಪಟೇಲ್ ಫಾರ್ಮ್ ಟೂಲ್ಸ್",
    address: "Hunsur Road, Mysuru",
    village: "Hunsur Road",
    taluk: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    deliveryRadiusKm: 12,
    categories: ["tools", "machinery", "storage"],
    isVerified: false,
    plan: "basic",
  },
];

const PRODUCTS = [
  { name: "Urea 45kg", nameKannada: "ಯೂರಿಯಾ 45 ಕೆಜಿ", category: "fertilizers", price: 266, mrp: 300, unit: "bag", stock: 200, tags: ["urea", "fertilizer"], sellerIndex: 0 },
  { name: "DAP 50kg", nameKannada: "ಡಿಎಪಿ 50 ಕೆಜಿ", category: "fertilizers", price: 1350, mrp: 1450, unit: "bag", stock: 120, tags: ["dap", "fertilizer"], sellerIndex: 0 },
  { name: "Paddy Seeds - BPT 5204", nameKannada: "ಭತ್ತದ ಬೀಜ - BPT 5204", category: "seeds", price: 60, mrp: 70, unit: "kg", stock: 500, tags: ["seeds", "paddy"], sellerIndex: 0 },
  { name: "Potash 50kg", nameKannada: "ಪೊಟ್ಯಾಶ್ 50 ಕೆಜಿ", category: "fertilizers", price: 850, mrp: 900, unit: "bag", stock: 90, tags: ["potash", "fertilizer"], sellerIndex: 1 },
  { name: "Drip Irrigation Kit", nameKannada: "ಡ್ರಿಪ್ ನೀರಾವರಿ ಕಿಟ್", category: "irrigation", price: 3500, mrp: 4000, unit: "set", stock: 25, tags: ["irrigation", "drip"], sellerIndex: 1 },
  { name: "Water Pump 1HP", nameKannada: "ನೀರಿನ ಪಂಪ್ 1HP", category: "irrigation", price: 4200, mrp: 4800, unit: "unit", stock: 15, tags: ["pump", "irrigation"], sellerIndex: 1 },
  { name: "Sprayer Pump 16L", nameKannada: "ಸ್ಪ್ರೇಯರ್ ಪಂಪ್ 16L", category: "tools", price: 950, mrp: 1100, unit: "unit", stock: 40, tags: ["sprayer", "tools"], sellerIndex: 2 },
  { name: "Sugarcane Cutter", nameKannada: "ಕಬ್ಬು ಕತ್ತರಿಸುವ ಯಂತ್ರ", category: "machinery", price: 2200, mrp: 2500, unit: "unit", stock: 10, tags: ["sugarcane", "machinery"], sellerIndex: 2 },
  { name: "Grain Storage Bin 500kg", nameKannada: "ಧಾನ್ಯ ಸಂಗ್ರಹ ಡಬ್ಬಿ 500 ಕೆಜಿ", category: "storage", price: 5500, mrp: 6000, unit: "unit", stock: 8, tags: ["storage", "grain"], sellerIndex: 2 },
  { name: "Neem Pesticide 1L", nameKannada: "ಬೇವಿನ ಕೀಟನಾಶಕ 1L", category: "pesticides", price: 320, mrp: 380, unit: "litre", stock: 60, tags: ["pesticide", "neem"], sellerIndex: 0 },
];

async function seed() {
  console.log("Seeding sellers...");
  const sellerLocations = [];
  for (const seller of SELLERS) {
    const lat = jitter(MYSURU_CENTER.lat);
    const lng = jitter(MYSURU_CENTER.lng);
    const location = new admin.firestore.GeoPoint(lat, lng);
    const geohash = geohashForPoint([lat, lng]);
    sellerLocations.push({ lat, lng });

    await db.collection("sellers").doc(seller.uid).set({
      ...seller,
      location,
      geohash,
      rating: 4 + Math.random(),
      totalRatings: Math.floor(Math.random() * 50) + 5,
      totalOrders: Math.floor(Math.random() * 100),
      totalGmv: Math.floor(Math.random() * 50000),
      commissionRate: 0.065,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${seller.shopNameKannada}`);
  }

  console.log("Seeding products...");
  for (const product of PRODUCTS) {
    const seller = SELLERS[product.sellerIndex];
    const loc = sellerLocations[product.sellerIndex];
    const location = new admin.firestore.GeoPoint(loc.lat, loc.lng);
    const geohash = geohashForPoint([loc.lat, loc.lng]);

    await db.collection("products").add({
      sellerId: seller.uid,
      sellerName: seller.shopName,
      sellerNameKannada: seller.shopNameKannada,
      sellerPhone: seller.phone,
      district: seller.district,
      location,
      geohash,
      name: product.name,
      nameKannada: product.nameKannada,
      description: product.name,
      descriptionKannada: product.nameKannada,
      category: product.category,
      subcategory: "",
      images: [],
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      stock: product.stock,
      isAvailable: true,
      tags: product.tags,
      synonyms: product.tags,
      isPromoted: false,
      viewCount: 0,
      orderCount: Math.floor(Math.random() * 30),
      rating: 3.5 + Math.random() * 1.5,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${product.nameKannada}`);
  }

  console.log("Done! Seeded 3 sellers and 10 products.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
