import { createStackNavigator } from "@react-navigation/stack";
import SellerDashboardScreen from "../screens/seller/SellerDashboardScreen";
import SellerOrdersScreen from "../screens/seller/SellerOrdersScreen";
import SellerOrderDetailScreen from "../screens/seller/SellerOrderDetailScreen";
import AddProductScreen from "../screens/seller/AddProductScreen";
import ProductListScreen from "../screens/seller/ProductListScreen";
import EarningsScreen from "../screens/seller/EarningsScreen";

const Stack = createStackNavigator();

export default function SellerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
      <Stack.Screen name="SellerOrderDetail" component={SellerOrderDetailScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
    </Stack.Navigator>
  );
}
