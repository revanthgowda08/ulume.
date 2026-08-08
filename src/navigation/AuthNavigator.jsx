import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/onboarding/SplashScreen";
import LandingScreen from "../screens/onboarding/LandingScreen";
import SignupScreen from "../screens/onboarding/SignupScreen";
import LoginScreen from "../screens/onboarding/LoginScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
