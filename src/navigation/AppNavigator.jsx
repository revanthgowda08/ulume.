import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged, getFarmerProfile, getSellerProfile, getBuyerProfile, signOutUser } from "../services/firebase/auth";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import AuthNavigator from "./AuthNavigator";
import FarmerNavigator from "./FarmerNavigator";
import SellerNavigator from "./SellerNavigator";
import BuyerNavigator from "./BuyerNavigator";

export default function AppNavigator() {
  const { userType, isLoading, setUser, setSeller, setBuyer, clearAuth, setLoading } = useAuthStore();
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth();
        setLoadError(null);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const seller = await getSellerProfile(firebaseUser.uid);
        if (seller) {
          setSeller(seller);
          return;
        }
        const buyer = await getBuyerProfile(firebaseUser.uid);
        if (buyer) {
          setBuyer(buyer);
          return;
        }
        const farmer = await getFarmerProfile(firebaseUser.uid);
        if (farmer) {
          setUser(farmer);
          return;
        }
        // Authenticated but no profile yet — still in the signup flow.
        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile after sign-in:", error);
        setLoading(false);
        setLoadError(error.message || "Couldn't load your account.");
      }
    });
    return unsubscribe;
  }, [clearAuth, setLoading, setSeller, setBuyer, setUser]);

  if (isLoading) return null;

  if (loadError) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Couldn't sign you in</Text>
        <Text style={styles.errorMessage}>{loadError}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={async () => {
            await signOutUser();
            clearAuth();
            setLoadError(null);
          }}
        >
          <Text style={styles.errorButtonText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userType === "seller" ? (
        <SellerNavigator />
      ) : userType === "buyer" ? (
        <BuyerNavigator />
      ) : userType === "farmer" ? (
        <FarmerNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: spacing.screenPadding },
  errorIcon: { fontSize: 48, marginBottom: spacing.md },
  errorTitle: { ...typography.h2, color: colors.primary, marginBottom: spacing.sm, textAlign: "center" },
  errorMessage: { ...typography.caption, color: colors.textMuted, textAlign: "center", marginBottom: spacing.lg },
  errorButton: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  errorButtonText: { color: colors.white, fontWeight: "700" },
});
