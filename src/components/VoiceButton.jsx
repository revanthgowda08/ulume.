import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, Easing } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

const SIZE = 96;

const STATE_CONFIG = {
  idle: { bg: colors.primary, label: "ಮಾತಾಡಿ" },
  listening: { bg: colors.error, label: "ಕೇಳ್ತಿದ್ದೇನೆ..." },
  processing: { bg: colors.accent, label: "ಹುಡುಕ್ತಿದ್ದೇನೆ..." },
  done: { bg: colors.primaryMid, label: "ಸಿಕ್ಕಿತು!" },
  error: { bg: colors.error, label: "ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ" },
};

function WaveformBars() {
  const bars = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 1,
            duration: 300 + i * 60,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 300 + i * 60,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.stagger(80, animations).start();
    return () => animations.forEach((a) => a.stop());
  }, [bars]);

  return (
    <View style={styles.waveformRow}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveformBar,
            { transform: [{ scaleY: bar }] },
          ]}
        />
      ))}
    </View>
  );
}

export default function VoiceButton({ voiceState = "idle", onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const config = STATE_CONFIG[voiceState] ?? STATE_CONFIG.idle;

  useEffect(() => {
    let loop;
    if (voiceState === "idle") {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulse.setValue(1);
    }
    return () => loop?.stop();
  }, [voiceState, pulse]);

  useEffect(() => {
    if (voiceState === "error") {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [voiceState, shake]);

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  return (
    <View style={styles.container}>
      {voiceState === "idle" && (
        <Animated.View style={[styles.glow, { transform: [{ scale: pulse }] }]} />
      )}
      <Animated.View style={{ transform: [{ translateX: voiceState === "error" ? translateX : 0 }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          style={[styles.circle, { backgroundColor: config.bg }]}
          accessibilityLabel={config.label}
        >
          {voiceState === "idle" && <Text style={styles.icon}>🎙️</Text>}
          {voiceState === "listening" && <WaveformBars />}
          {voiceState === "processing" && <ActivityIndicator color={colors.white} size="large" />}
          {voiceState === "done" && <Text style={styles.icon}>✅</Text>}
          {voiceState === "error" && <Text style={styles.icon}>🎙️</Text>}
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    width: SIZE + 24,
    height: SIZE + 24,
    borderRadius: (SIZE + 24) / 2,
    backgroundColor: colors.accent,
    opacity: 0.35,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: { fontSize: 36 },
  label: { ...typography.body, color: colors.white, marginTop: 12, fontWeight: "600" },
  waveformRow: { flexDirection: "row", alignItems: "center", height: 32, gap: 4 },
  waveformBar: {
    width: 5,
    height: 28,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
});
