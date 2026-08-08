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
import FarmerDashboardScreen from "../screens/farmer/FarmerDashboardScreen";
import AddCropListingScreen from "../screens/farmer/AddCropListingScreen";
import AIToolsScreen from "../screens/farmer/AIToolsScreen";
import CropAdvisorScreen from "../screens/farmer/CropAdvisorScreen";
import DiseaseDetectionScreen from "../screens/farmer/DiseaseDetectionScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={FarmerDashboardScreen} />
      <Stack.Screen name="AddCropListing" component={AddCropListingScreen} />
      <Stack.Screen name="AITools" component={AIToolsScreen} />
      <Stack.Screen name="CropAdvisor" component={CropAdvisorScreen} />
      <Stack.Screen name="DiseaseDetection" component={DiseaseDetectionScreen} />
    </Stack.Navigator>
  );
}

// The original voice/category marketplace browser (buying agri-inputs) lives
// under the Search tab now that Home is the ulume.shop-style Farmer Dashboard.
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={HomeScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
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
