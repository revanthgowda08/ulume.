import * as ImageManipulator from "expo-image-manipulator";
import { storage } from "./config";

// STEP 15.5 — compress before any Storage upload: max width 800px, quality 0.75
export const compressImage = async (uri) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.WEBP }
  );
  return result.uri;
};

export const uploadProductImage = async (sellerId, productId, localUri, index) => {
  const compressedUri = await compressImage(localUri);
  const path = `sellers/${sellerId}/products/${productId}/image_${index}.webp`;
  const ref = storage().ref(path);
  await ref.putFile(compressedUri);
  return ref.getDownloadURL();
};

export const uploadAudioClip = async (path, localUri) => {
  const ref = storage().ref(path);
  await ref.putFile(localUri);
  return ref.getDownloadURL();
};

export const uploadSellerDocument = async (sellerId, localUri, docName) => {
  const path = `sellers/${sellerId}/documents/${docName}`;
  const ref = storage().ref(path);
  await ref.putFile(localUri);
  return ref.getDownloadURL();
};
