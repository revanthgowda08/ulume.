import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Switch, Alert } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { searchFarmersByCrop, createProcurementRequest, toggleSavedFarmer } from "../../services/firebase/firestore";

export default function SearchFarmersScreen({ navigation }) {
  const { buyer, setBuyer } = useAuthStore();
  const [cropName, setCropName] = useState("");
  const [state, setState] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const farmers = await searchFarmersByCrop({
        cropName: cropName.trim() || null,
        state: state.trim() || null,
        isOrganic,
      });
      setResults(farmers);
    } finally {
      setLoading(false);
    }
  };

  const savedFarmerIds = buyer?.savedFarmerIds || [];

  const handleToggleSave = async (farmerId) => {
    const isSaved = savedFarmerIds.includes(farmerId);
    await toggleSavedFarmer(buyer.uid, farmerId, isSaved);
    setBuyer({
      ...buyer,
      savedFarmerIds: isSaved ? savedFarmerIds.filter((id) => id !== farmerId) : [...savedFarmerIds, farmerId],
    });
  };

  const handleRequestProcurement = async (farmer, listing) => {
    try {
      await createProcurementRequest({
        buyerId: buyer.uid,
        buyerName: buyer.name,
        farmerId: farmer.farmerId,
        farmerName: farmer.farmerName,
        cropListingId: listing.id,
        cropName: listing.cropName,
        quantity: listing.quantity,
        pricePerUnit: listing.pricePerUnit,
      });
      Alert.alert("Request sent", `Your procurement request for ${listing.cropName} has been sent to ${farmer.farmerName}.`);
    } catch (e) {
      Alert.alert("Error", "Couldn't send the request. Please try again.");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Farmers</Text>
      </View>

      <View style={styles.filters}>
        <TextInput style={styles.input} value={cropName} onChangeText={setCropName} placeholder="Crop name (e.g. Tomato)" placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="State" placeholderTextColor={colors.textMuted} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Organic only</Text>
          <Switch value={isOrganic} onValueChange={setIsOrganic} trackColor={{ true: colors.primaryMid }} />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.searchBtnText}>Search</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.farmerId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.farmerCard}>
            <View style={styles.farmerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.farmerName}>{item.farmerName}</Text>
                <Text style={styles.farmerLocation}>{item.district}, {item.state}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggleSave(item.farmerId)}>
                <Text style={styles.saveIcon}>{savedFarmerIds.includes(item.farmerId) ? "♥" : "♡"}</Text>
              </TouchableOpacity>
            </View>
            {item.listings.map((listing) => (
              <View key={listing.id} style={styles.listingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingCrop}>{listing.cropName} {listing.variety ? `(${listing.variety})` : ""}</Text>
                  <Text style={styles.listingDetail}>
                    {listing.quantity} {listing.unit} @ ₹{listing.pricePerUnit}/{listing.unit}
                    {listing.isOrganic ? " · Organic" : ""}
                  </Text>
                </View>
                <TouchableOpacity style={styles.requestBtn} onPress={() => handleRequestProcurement(item, listing)}>
                  <Text style={styles.requestBtnText}>Request</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          searched && !loading ? <Text style={styles.emptyText}>No farmers found. Try a different search.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.screenPadding, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: spacing.minTouchTarget, height: spacing.minTouchTarget, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.h3, color: colors.textPrimary },
  filters: { padding: spacing.screenPadding, backgroundColor: colors.white, gap: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { ...typography.body, color: colors.textPrimary },
  searchBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", minHeight: spacing.minTouchTarget, justifyContent: "center" },
  searchBtnText: { color: colors.white, fontWeight: "700" },
  list: { padding: spacing.screenPadding },
  farmerCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.md },
  farmerHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  farmerName: { ...typography.h3, fontSize: 16, color: colors.textPrimary },
  farmerLocation: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  saveIcon: { fontSize: 24, color: colors.error },
  listingRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  listingCrop: { ...typography.body, fontWeight: "600", color: colors.textPrimary },
  listingDetail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  requestBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: spacing.minTouchTarget - 8, justifyContent: "center" },
  requestBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
