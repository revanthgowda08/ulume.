import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Switch,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../store/authStore";
import { signOutUser, createFarmerProfile } from "../../services/firebase/auth";
import { uploadFarmPhoto } from "../../services/firebase/storage";
import {
  getFarmerCropListings,
  listenToFarmerProcurementRequests,
  updateProcurementRequestStatus,
} from "../../services/firebase/firestore";
import { formatOrderDate } from "../../utils/formatters";

const TABS = ["My Crops", "Buyer Leads", "Farm Profile", "Notifications"];

const STATUS_COLORS = {
  pending: colors.accent,
  accepted: colors.primaryMid,
  rejected: colors.error,
  active: colors.primaryMid,
  sold: colors.textMuted,
};

const CERTIFICATIONS = ["organic", "fair-trade", "gap"];

export default function FarmerDashboardScreen({ navigation }) {
  const { user, setUser, clearAuth } = useAuthStore();
  const [tab, setTab] = useState("My Crops");

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadListings = useCallback(() => {
    if (!user?.uid) return Promise.resolve();
    setListingsError(false);
    return getFarmerCropListings(user.uid)
      .then(setListings)
      .catch((error) => {
        console.error("getFarmerCropListings failed:", error);
        setListingsError(true);
      });
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      setListingsLoading(true);
      loadListings().finally(() => setListingsLoading(false));
    }, [loadListings])
  );

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = listenToFarmerProcurementRequests(
      user.uid,
      (data) => {
        setRequests(data);
        setRequestsLoading(false);
        setRequestsError(false);
      },
      () => {
        setRequestsLoading(false);
        setRequestsError(true);
      }
    );
    return unsubscribe;
  }, [user?.uid]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings().finally(() => setRefreshing(false));
  };

  const handleRespond = async (requestId, status) => {
    setUpdatingId(requestId);
    try {
      await updateProcurementRequestStatus(requestId, status);
    } catch (e) {
      Alert.alert("Error", "Couldn't update the request. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const revenue = acceptedRequests.reduce((sum, r) => sum + (r.quantity || 0) * (r.pricePerUnit || 0), 0);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ULUME</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate("AITools")} style={styles.aiToolsBtn}>
            <Text style={styles.aiToolsBtnText}>🤖 AI Tools</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await signOutUser(); clearAuth(); }}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>Farmer Dashboard</Text>
        <Text style={styles.subtitle}>Manage crops, respond to buyers, track revenue.</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌱</Text>
            <Text style={styles.statValue}>{listings.length}</Text>
            <Text style={styles.statCardSub}>Crop Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statCardSub}>Buyer Leads</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💳</Text>
            <Text style={styles.statValue}>{revenue}</Text>
            <Text style={styles.statCardSub}>Revenue (₹)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔔</Text>
            <Text style={styles.statValue}>{acceptedRequests.length}</Text>
            <Text style={styles.statCardSub}>Accepted</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]} numberOfLines={1}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "My Crops" && (
          <MyCropsTab
            listings={listings}
            loading={listingsLoading}
            error={listingsError}
            onAdd={() => navigation.navigate("AddCropListing")}
          />
        )}

        {tab === "Buyer Leads" && (
          <BuyerLeadsTab
            requests={requests}
            loading={requestsLoading}
            error={requestsError}
            updatingId={updatingId}
            onRespond={handleRespond}
          />
        )}

        {tab === "Farm Profile" && <FarmProfileTab user={user} setUser={setUser} />}

        {tab === "Notifications" && <NotificationsTab requests={requests} loading={requestsLoading} />}
      </ScrollView>
    </View>
  );
}

function MyCropsTab({ listings, loading, error, onAdd }) {
  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />;
  return (
    <View>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Couldn't load your crops right now. Pull down to retry.</Text>
        </View>
      )}
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>+ Add Crop Listing</Text>
      </TouchableOpacity>
      {listings.length === 0 ? (
        <Text style={styles.emptyText}>No crop listings yet. Add one for buyers to find.</Text>
      ) : (
        listings.map((item) => (
          <View key={item.id} style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.cropName} {item.variety ? `(${item.variety})` : ""}</Text>
              <Text style={styles.cardDetail}>
                {item.quantity} kg @ ₹{item.pricePerUnit}/kg{item.isOrganic ? " · Organic" : ""}
              </Text>
              {item.harvestDate && <Text style={styles.cardDetail}>Harvest: {item.harvestDate}</Text>}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function BuyerLeadsTab({ requests, loading, error, updatingId, onRespond }) {
  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />;
  return (
    <View>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Couldn't load buyer leads right now.</Text>
        </View>
      )}
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No buyer requests yet.</Text>
      ) : (
        requests.map((item) => (
          <View key={item.id} style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.buyerName}</Text>
              <Text style={styles.cardDetail}>Wants {item.quantity} kg @ ₹{item.pricePerUnit}/kg</Text>
            </View>
            {item.status === "pending" ? (
              <View style={styles.actionsCol}>
                <TouchableOpacity
                  style={[styles.smallBtn, styles.acceptBtn]}
                  onPress={() => onRespond(item.id, "accepted")}
                  disabled={updatingId === item.id}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, styles.declineBtn]}
                  onPress={() => onRespond(item.id, "rejected")}
                  disabled={updatingId === item.id}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
}

function FarmProfileTab({ user, setUser }) {
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [village, setVillage] = useState(user?.village || "");
  const [state, setState] = useState(user?.state || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [sizeAcres, setSizeAcres] = useState(user?.sizeAcres ? String(user.sizeAcres) : "");
  const [latitude, setLatitude] = useState(user?.latitude ? String(user.latitude) : "");
  const [longitude, setLongitude] = useState(user?.longitude ? String(user.longitude) : "");
  const [description, setDescription] = useState(user?.description || "");
  const [certifications, setCertifications] = useState(user?.certifications || []);
  const [photoUri, setPhotoUri] = useState(user?.farmPhotoUrl || null);
  const [saving, setSaving] = useState(false);

  const toggleCertification = (cert) => {
    setCertifications((prev) => (prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]));
  };

  const handlePickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let farmPhotoUrl = user?.farmPhotoUrl || null;
      if (photoUri && photoUri !== user?.farmPhotoUrl) {
        farmPhotoUrl = await uploadFarmPhoto(user.uid, photoUri);
      }
      const updated = await createFarmerProfile(user.uid, {
        farmName: farmName.trim(),
        village: village.trim(),
        state: state.trim(),
        district: district.trim(),
        sizeAcres: sizeAcres ? Number(sizeAcres) : null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        description: description.trim(),
        certifications,
        farmPhotoUrl,
      });
      setUser({ ...user, ...updated });
      Alert.alert("Saved", "Your farm profile has been updated.");
    } catch (e) {
      Alert.alert("Error", "Couldn't save your farm profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.fieldLabel}>Farm Name</Text>
      <TextInput style={styles.input} value={farmName} onChangeText={setFarmName} placeholderTextColor={colors.textMuted} />

      <Text style={styles.fieldLabel}>Village</Text>
      <TextInput style={styles.input} value={village} onChangeText={setVillage} placeholderTextColor={colors.textMuted} />

      <Text style={styles.fieldLabel}>State</Text>
      <TextInput style={styles.input} value={state} onChangeText={setState} placeholderTextColor={colors.textMuted} />

      <Text style={styles.fieldLabel}>District</Text>
      <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholderTextColor={colors.textMuted} />

      <Text style={styles.fieldLabel}>Size (acres)</Text>
      <TextInput style={styles.input} value={sizeAcres} onChangeText={setSizeAcres} keyboardType="numeric" placeholderTextColor={colors.textMuted} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Latitude</Text>
          <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Longitude</Text>
          <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Farm photo</Text>
      <TouchableOpacity style={styles.photoUpload} onPress={handlePickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoUploadText}>⬆ Upload farm photo</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.fieldLabel}>Certifications</Text>
      <View style={styles.certRow}>
        {CERTIFICATIONS.map((cert) => (
          <TouchableOpacity
            key={cert}
            style={[styles.certChip, certifications.includes(cert) && styles.certChipActive]}
            onPress={() => toggleCertification(cert)}
          >
            <Text style={[styles.certChipText, certifications.includes(cert) && styles.certChipTextActive]}>{cert}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>Save Farm Profile</Text>}
      </TouchableOpacity>
    </View>
  );
}

function NotificationsTab({ requests, loading }) {
  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />;
  if (requests.length === 0) {
    return <Text style={styles.emptyText}>No notifications yet.</Text>;
  }
  return (
    <View>
      {requests.map((item) => (
        <View key={item.id} style={styles.notificationCard}>
          <Text style={styles.notificationIcon}>
            {item.status === "accepted" ? "✅" : item.status === "rejected" ? "❌" : "🔔"}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardDetail}>
              {item.status === "pending"
                ? `${item.buyerName} wants ${item.quantity} kg of ${item.cropName}.`
                : `Your request from ${item.buyerName} was ${item.status}.`}
            </Text>
            <Text style={styles.notificationDate}>{formatOrderDate(item.createdAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, padding: spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.h3, color: colors.primary },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  aiToolsBtn: { backgroundColor: colors.primaryLight, borderRadius: 16, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  aiToolsBtnText: { ...typography.caption, color: colors.primary, fontWeight: "700" },
  logout: { ...typography.body, color: colors.error, fontWeight: "600" },
  body: { padding: spacing.screenPadding, flex: 1 },
  title: { ...typography.h1, fontSize: 26, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg },
  statCard: { width: "48%", backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm, minHeight: 100, justifyContent: "center" },
  statIcon: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { ...typography.h1, fontSize: 26, color: colors.textPrimary },
  statCardSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  tabRow: { flexDirection: "row", backgroundColor: colors.grayLight, borderRadius: 24, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: 20, paddingHorizontal: 2 },
  tabActive: { backgroundColor: colors.white },
  tabText: { ...typography.caption, color: colors.textMuted, fontWeight: "600", fontSize: 11 },
  tabTextActive: { color: colors.textPrimary },
  errorBanner: { backgroundColor: "#FDECEA", padding: spacing.md, borderRadius: spacing.cardRadius, marginBottom: spacing.sm },
  errorBannerText: { ...typography.caption, color: colors.error },
  addBtn: { backgroundColor: colors.accent, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginBottom: spacing.md, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  addBtnText: { color: colors.white, fontWeight: "700" },
  listCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  cardTitle: { ...typography.body, fontWeight: "700", color: colors.textPrimary },
  cardDetail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  actionsCol: { gap: spacing.xs },
  smallBtn: { borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minHeight: 32, justifyContent: "center", alignItems: "center" },
  acceptBtn: { backgroundColor: colors.primary },
  acceptBtnText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  declineBtn: { borderWidth: 1, borderColor: colors.error },
  declineBtnText: { color: colors.error, fontWeight: "700", fontSize: 12 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  formCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md },
  fieldLabel: { ...typography.caption, color: colors.textPrimary, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.buttonRadius, padding: spacing.md, ...typography.body, color: colors.textPrimary },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: spacing.md },
  photoUpload: { borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", borderRadius: spacing.buttonRadius, alignItems: "center", justifyContent: "center", minHeight: 80, overflow: "hidden" },
  photoUploadText: { ...typography.caption, color: colors.textMuted },
  photoPreview: { width: "100%", height: 120 },
  certRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  certChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  certChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryMid },
  certChipText: { ...typography.caption, color: colors.textMuted, fontWeight: "600" },
  certChipTextActive: { color: colors.primary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg, minHeight: spacing.minTouchTarget, justifyContent: "center" },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  notificationCard: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.md, marginBottom: spacing.sm },
  notificationIcon: { fontSize: 18 },
  notificationDate: { ...typography.caption, color: colors.textMuted, marginTop: 2, fontSize: 11 },
});
