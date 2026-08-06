import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged, getFarmerProfile, getSellerProfile } from "../services/firebase/auth";
import { useAuthStore } from "../store/authStore";
import AuthNavigator from "./AuthNavigator";
import FarmerNavigator from "./FarmerNavigator";
import SellerNavigator from "./SellerNavigator";

export default function AppNavigator() {
  const { userType, isLoading, setUser, setSeller, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth();
        return;
      }
      setLoading(true);
      const seller = await getSellerProfile(firebaseUser.uid);
      if (seller) {
        setSeller(seller);
        return;
      }
      const farmer = await getFarmerProfile(firebaseUser.uid);
      if (farmer) {
        setUser(farmer);
        return;
      }
      // Authenticated but no profile yet — still in onboarding (LanguageSelect/PhoneLogin flow
      // will create the profile after OTP verification).
      setLoading(false);
    });
    return unsubscribe;
  }, [clearAuth, setLoading, setSeller, setUser]);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      {userType === "seller" ? (
        <SellerNavigator />
      ) : userType === "farmer" ? (
        <FarmerNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
