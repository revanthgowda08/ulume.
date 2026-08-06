import { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getOrCreateAudioForText, playAudioFile } from "../services/voice/textToSpeech";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useT } from "../i18n/useT";

// Never autoplays — only fetches/plays audio when the farmer taps this button (STEP 15.6).
export default function AudioPlayer({ cacheKey, text }) {
  const [status, setStatus] = useState("idle"); // idle | loading | playing
  const t = useT();

  const handlePress = async () => {
    if (status === "loading" || status === "playing" || !text) return;
    try {
      setStatus("loading");
      const uri = await getOrCreateAudioForText(cacheKey, text);
      const sound = await playAudioFile(uri);
      setStatus("playing");
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.didJustFinish) setStatus("idle");
      });
    } catch (e) {
      setStatus("idle");
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handlePress} accessibilityLabel={t("ಆಡಿಯೋ ಕೇಳಿ")}>
      {status === "loading" ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Text style={styles.icon}>{status === "playing" ? "🔊" : "🔈"}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    borderRadius: spacing.minTouchTarget / 2,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
});
