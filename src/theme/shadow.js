import { Platform } from "react-native";
import { colors } from "./colors";

// A soft, consistent card lift used across dashboards — spread into any
// card-style component for a bit of depth instead of a flat fill.
export const cardShadow = Platform.select({
  android: { elevation: 2 },
  default: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
});
