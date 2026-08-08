import { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

// Catches uncaught render errors anywhere below it and shows a recoverable
// screen instead of letting the app close outright — release builds have no
// red-screen overlay, so an uncaught error otherwise just terminates the app
// with no explanation.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>ಏನೋ ತಪ್ಪಾಗಿದೆ</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => this.setState({ error: null })}>
            <Text style={styles.buttonText}>ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", padding: spacing.screenPadding },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.primary, marginBottom: spacing.sm },
  message: { ...typography.caption, color: colors.textMuted, textAlign: "center", marginBottom: spacing.lg },
  button: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  buttonText: { color: colors.white, fontWeight: "700" },
});
