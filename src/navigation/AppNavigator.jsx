import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged, getFarmerProfile, getSellerProfile, getBuyerProfile } from "../services/firebase/auth";
import { useAuthStore } from "../store/authStore";
import AuthNavigator from "./AuthNavigator";
import FarmerNavigator from "./FarmerNavigator";
import SellerNavigator from "./SellerNavigator";
import BuyerNavigator from "./BuyerNavigator";

export default function AppNavigator() {
  const { userType, isLoading, setUser, setSeller, setBuyer, clearAuth, setLoading } = useAuthStore();

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
    });
    return unsubscribe;
  }, [clearAuth, setLoading, setSeller, setBuyer, setUser]);

  if (isLoading) return null;

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
