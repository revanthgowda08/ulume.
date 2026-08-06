import { geohashQueryBounds, distanceBetween, geohashForPoint } from "geofire-common";
import firestore from "@react-native-firebase/firestore";

export const getNearbyProducts = async (center, radiusKm, category = null) => {
  const bounds = geohashQueryBounds(center, radiusKm * 1000);
  let baseQuery = firestore().collection("products").where("isAvailable", "==", true);
  if (category) baseQuery = baseQuery.where("category", "==", category);

  const promises = bounds.map((b) =>
    baseQuery.orderBy("geohash").startAt(b[0]).endAt(b[1]).get()
  );
  const snapshots = await Promise.all(promises);

  const products = [];
  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      const dist = distanceBetween([data.location.latitude, data.location.longitude], center);
      if (dist <= radiusKm) {
        products.push({ id: doc.id, ...data, distanceKm: Math.round(dist * 10) / 10 });
      }
    }
  }
  return products.sort((a, b) => a.distanceKm - b.distanceKm);
};

export const getNearbySellersGeo = async (center, radiusKm) => {
  const bounds = geohashQueryBounds(center, radiusKm * 1000);
  const baseQuery = firestore().collection("sellers").where("isActive", "==", true);

  const promises = bounds.map((b) =>
    baseQuery.orderBy("geohash").startAt(b[0]).endAt(b[1]).get()
  );
  const snapshots = await Promise.all(promises);

  const sellers = [];
  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      const dist = distanceBetween([data.location.latitude, data.location.longitude], center);
      if (dist <= radiusKm) {
        sellers.push({ id: doc.id, ...data, distanceKm: Math.round(dist * 10) / 10 });
      }
    }
  }
  return sellers.sort((a, b) => a.distanceKm - b.distanceKm);
};

export const getGeohash = (lat, lng) => geohashForPoint([lat, lng]);
