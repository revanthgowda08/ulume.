import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors } from "../theme/colors";

const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";
const FALLBACK_ICON = "🖼️";

export default function LazyImage({ uri, style, contentFit = "cover" }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return <View style={[styles.fallback, style]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      placeholder={{ blurhash: BLURHASH }}
      contentFit={contentFit}
      transition={200}
      cachePolicy="disk"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.grayLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
