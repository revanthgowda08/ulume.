import { createStackNavigator } from "@react-navigation/stack";
import BuyerDashboardScreen from "../screens/buyer/BuyerDashboardScreen";
import SearchFarmersScreen from "../screens/buyer/SearchFarmersScreen";

const Stack = createStackNavigator();

export default function BuyerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerDashboard" component={BuyerDashboardScreen} />
      <Stack.Screen name="SearchFarmers" component={SearchFarmersScreen} />
    </Stack.Navigator>
  );
}
