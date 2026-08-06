import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/onboarding/SplashScreen";
import LanguageSelectScreen from "../screens/onboarding/LanguageSelectScreen";
import PhoneLoginScreen from "../screens/onboarding/PhoneLoginScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
    </Stack.Navigator>
  );
}
