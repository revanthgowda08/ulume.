import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import BottomNav from "../components/BottomNav";

import HomeScreen from "../screens/farmer/HomeScreen";
import SearchResultsScreen from "../screens/farmer/SearchResultsScreen";
import CategoryScreen from "../screens/farmer/CategoryScreen";
import ProductDetailScreen from "../screens/farmer/ProductDetailScreen";
import CartScreen from "../screens/farmer/CartScreen";
import CheckoutScreen from "../screens/farmer/CheckoutScreen";
import OrderConfirmScreen from "../screens/farmer/OrderConfirmScreen";
import OrderTrackingScreen from "../screens/farmer/OrderTrackingScreen";
import OrderHistoryScreen from "../screens/farmer/OrderHistoryScreen";
import WalletScreen from "../screens/farmer/WalletScreen";
import ProfileScreen from "../screens/farmer/ProfileScreen";
import MyCropsScreen from "../screens/farmer/MyCropsScreen";
import AddCropListingScreen from "../screens/farmer/AddCropListingScreen";
import BuyerLeadsScreen from "../screens/farmer/BuyerLeadsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const sharedStackScreens = (StackNav) => (
  <>
    <StackNav.Screen name="Category" component={CategoryScreen} />
    <StackNav.Screen name="SearchResults" component={SearchResultsScreen} />
    <StackNav.Screen name="ProductDetail" component={ProductDetailScreen} />
    <StackNav.Screen name="Cart" component={CartScreen} />
    <StackNav.Screen name="Checkout" component={CheckoutScreen} />
    <StackNav.Screen name="OrderConfirm" component={OrderConfirmScreen} />
    <StackNav.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <StackNav.Screen name="MyCrops" component={MyCropsScreen} />
    <StackNav.Screen name="AddCropListing" component={AddCropListingScreen} />
    <StackNav.Screen name="BuyerLeads" component={BuyerLeadsScreen} />
  </>
);

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      {sharedStackScreens(Stack)}
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchResultsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirm" component={OrderConfirmScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderHistoryMain" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}

function WalletStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="MyCrops" component={MyCropsScreen} />
      <Stack.Screen name="AddCropListing" component={AddCropListingScreen} />
      <Stack.Screen name="BuyerLeads" component={BuyerLeadsScreen} />
    </Stack.Navigator>
  );
}

export default function FarmerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Wallet" component={WalletStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
