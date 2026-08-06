import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useCartStore } from "../store/cartStore";
import { useT } from "../i18n/useT";

const TABS = [
  { name: "Home", icon: "🏠", label: "ಮುಖಪುಟ" },
  { name: "Search", icon: "🔍", label: "ಹುಡುಕಿ" },
  { name: "Orders", icon: "📦", label: "ಆರ್ಡರ್" },
  { name: "Wallet", icon: "💰", label: "ವ್ಯಾಲೆಟ್" },
  { name: "Profile", icon: "👤", label: "ಪ್ರೊಫೈಲ್" },
];

export default function BottomNav({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const count = useCartStore((s) => s.getCount());
  const t = useT();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab, i) => {
        const focused = state.index === i;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
            accessibilityLabel={t(tab.label)}
          >
            <View>
              <Text style={[styles.icon, focused && styles.iconActive]}>{tab.icon}</Text>
              {tab.name === "Orders" && count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{t(tab.label)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 48 },
  icon: { fontSize: 22, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: "700" },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
});
