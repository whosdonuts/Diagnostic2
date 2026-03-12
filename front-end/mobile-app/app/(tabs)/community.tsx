import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { UniversalLiquidCard } from "../../components/UniversalLiquidCard";
import { Colors } from "../../constants/Colors";

/* ───────── Mock Data ───────── */

interface CommunityRequest {
  id: string;
  title: string;
  category: string;
  requester: string;
  amount: number;
  raised: number;
  daysAgo: number;
}

const REQUESTS: CommunityRequest[] = [
  { id: "r01", title: "Iron supplements for anemia recovery", category: "Supplements", requester: "Patient #4821", amount: 28, raised: 18, daysAgo: 3 },
  { id: "r02", title: "Heating pad for endometriosis flare", category: "Pain Mgmt", requester: "Patient #7392", amount: 35, raised: 35, daysAgo: 1 },
  { id: "r03", title: "Prenatal vitamins (3-month supply)", category: "Supplements", requester: "Patient #1204", amount: 42, raised: 28, daysAgo: 5 },
  { id: "r04", title: "Blood glucose test strips", category: "Monitoring", requester: "Patient #5567", amount: 22, raised: 12, daysAgo: 2 },
  { id: "r05", title: "Compression socks for DVT prevention", category: "Recovery", requester: "Patient #8903", amount: 18, raised: 18, daysAgo: 7 },
  { id: "r06", title: "Post-surgical wound care kit", category: "Recovery", requester: "Patient #2210", amount: 55, raised: 30, daysAgo: 4 },
  { id: "r07", title: "Migraine cold therapy cap", category: "Pain Mgmt", requester: "Patient #6654", amount: 32, raised: 8, daysAgo: 1 },
  { id: "r08", title: "Fiber supplement for GI management", category: "Supplements", requester: "Patient #3318", amount: 15, raised: 15, daysAgo: 6 },
  { id: "r09", title: "Pulse oximeter for home monitoring", category: "Monitoring", requester: "Patient #9045", amount: 38, raised: 22, daysAgo: 2 },
  { id: "r10", title: "Anti-nausea wristbands (pair)", category: "Pain Mgmt", requester: "Patient #1177", amount: 12, raised: 4, daysAgo: 1 },
  { id: "r11", title: "Electrolyte powder (30-day supply)", category: "Supplements", requester: "Patient #5023", amount: 24, raised: 20, daysAgo: 3 },
  { id: "r12", title: "Wrist brace for carpal tunnel", category: "Recovery", requester: "Patient #7788", amount: 28, raised: 14, daysAgo: 4 },
  { id: "r13", title: "Digital thermometer for cycle tracking", category: "Monitoring", requester: "Patient #4402", amount: 20, raised: 12, daysAgo: 5 },
  { id: "r14", title: "Epsom salt for pain relief baths", category: "Pain Mgmt", requester: "Patient #3361", amount: 10, raised: 10, daysAgo: 8 },
  { id: "r15", title: "Blood pressure cuff (digital)", category: "Monitoring", requester: "Patient #8819", amount: 45, raised: 15, daysAgo: 2 },
  { id: "r16", title: "Lactose-free protein powder", category: "Supplements", requester: "Patient #2947", amount: 36, raised: 24, daysAgo: 6 },
  { id: "r17", title: "Knee support brace (adjustable)", category: "Recovery", requester: "Patient #6120", amount: 30, raised: 10, daysAgo: 3 },
  { id: "r18", title: "Melatonin for painsomnia", category: "Pain Mgmt", requester: "Patient #1590", amount: 14, raised: 7, daysAgo: 1 },
  { id: "r19", title: "Yoga mat for physical therapy", category: "Recovery", requester: "Patient #4256", amount: 25, raised: 25, daysAgo: 9 },
  { id: "r20", title: "Humidifier for respiratory support", category: "Monitoring", requester: "Patient #7034", amount: 48, raised: 32, daysAgo: 4 },
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Supplements: "nutrition",
  "Pain Mgmt": "bandage",
  Monitoring: "pulse",
  Recovery: "fitness",
};

/* ───────── Card Component ───────── */

function RequestCard({ item }: { item: CommunityRequest }) {
  const pct = Math.round((item.raised / item.amount) * 100);
  const fulfilled = item.raised >= item.amount;
  const iconName = CATEGORY_ICONS[item.category] ?? "heart";

  return (
    <UniversalLiquidCard variant="default" style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name={iconName} size={18} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.requester}>{item.requester}</Text>
          <Text style={styles.timeAgo}>{item.daysAgo}d ago · {item.category}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle}>{item.title}</Text>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(pct, 100)}%` },
              fulfilled && styles.progressFillDone,
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          ${item.raised} / ${item.amount}
        </Text>
      </View>

      {/* Action */}
      {fulfilled ? (
        <View style={styles.fulfilledBadge}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
          <Text style={styles.fulfilledText}>Fulfilled</Text>
        </View>
      ) : (
        <Pressable style={styles.donateBtn}>
          <Text style={styles.donateBtnText}>Donate</Text>
        </Pressable>
      )}
    </UniversalLiquidCard>
  );
}

/* ───────── Screen ───────── */

export default function CommunityScreen() {
  const renderItem = useCallback(
    ({ item }: { item: CommunityRequest }) => <RequestCard item={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.blob} />

      <FlashList
        data={REQUESTS}
        renderItem={renderItem}
        estimatedItemSize={200}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Community Requests</Text>
            <Text style={styles.headerSub}>
              Help others access the care they need
            </Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{REQUESTS.length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>
                  {REQUESTS.filter((r) => r.raised >= r.amount).length}
                </Text>
                <Text style={styles.statLabel}>Fulfilled</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>
                  $
                  {REQUESTS.reduce((s, r) => s + r.raised, 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Raised</Text>
              </View>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.forest[100],
    opacity: 0.25,
    top: -40,
    left: -40,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 60 },

  /* Header */
  header: { paddingTop: 8, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: Colors.primary },
  headerSub: { fontSize: 14, color: Colors.forest[600], marginTop: 4, marginBottom: 16 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.forest[50],
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  statNum: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.forest[600], marginTop: 2 },

  /* Card */
  card: { padding: 18, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.forest[50],
    alignItems: "center",
    justifyContent: "center",
  },
  requester: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  timeAgo: { fontSize: 12, color: Colors.forest[500], marginTop: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    color: Colors.forest[800],
    marginBottom: 14,
  },

  /* Progress */
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.forest[100],
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  progressFillDone: { backgroundColor: Colors.forest[400] },
  progressLabel: { fontSize: 13, fontWeight: "600", color: Colors.forest[600] },

  /* Actions */
  donateBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  donateBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  fulfilledBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  fulfilledText: { fontSize: 15, fontWeight: "600", color: Colors.accent },
});
