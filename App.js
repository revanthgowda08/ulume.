import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { colors } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Errors thrown inside promises/async callbacks (e.g. a failed Firestore
// read in a useEffect) never reach React's render-time error boundary and,
// left unhandled, terminate the app in a release build with no trace. This
// routes them through the same logging path as render errors so at least
// `adb logcat` shows what happened instead of a silent close.
if (global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("Global error handler:", isFatal ? "FATAL" : "non-fatal", error);
    defaultHandler(error, isFatal);
  });
}

export default function App() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "NotoSansKannada-Regular": require("./assets/fonts/NotoSansKannada-Regular.ttf"),
          "NotoSansKannada-Bold": require("./assets/fonts/NotoSansKannada-Bold.ttf"),
          "PlayfairDisplay-Regular": require("./assets/fonts/PlayfairDisplay-Regular.ttf"),
          "PlayfairDisplay-Bold": require("./assets/fonts/PlayfairDisplay-Bold.ttf"),
          "PlayfairDisplay-Black": require("./assets/fonts/PlayfairDisplay-Black.ttf"),
        });
      } catch (e) {
        // Fonts missing in dev — fall back to system font rather than crash.
      } finally {
        setFontsReady(true);
      }
    }
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.primary }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <ErrorBoundary>
        <AppNavigator />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
