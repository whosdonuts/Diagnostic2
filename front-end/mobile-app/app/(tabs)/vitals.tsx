import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { UniversalLiquidCard } from "../../components/UniversalLiquidCard";
import {
  getMockBiometrics,
  type BiometricSeries,
} from "../../providers/MockHealthKit";
import { Colors } from "../../constants/Colors";

const METRICS = getMockBiometrics();

export default function VitalsScreen() {
  const { width } = useWindowDimensions();
  const [activeKey, setActiveKey] = useState("hrv");

  const active: BiometricSeries =
    METRICS.find((m) => m.key === activeKey) ?? METRICS[0];

  const chartData = useMemo(
    () =>
      active.data.map((d) => ({
        value: d.value,
        label: d.date.split(" ")[1],
        dataPointColor: d.flag ? Colors.accent : Colors.primary,
        dataPointRadius: d.flag ? 7 : 4,
        customDataPoint: d.flag
          ? () => (
              <View style={styles.spikeOuter}>
                <View style={styles.spikeInner} />
              </View>
            )
          : undefined,
      })),
    [active],
  );

  const latest = active.data[active.data.length - 1];
  const delta = latest.value - active.baselineAvg;
  const deltaSign = delta >= 0 ? "+" : "";
  const isAnomaly =
    Math.abs(delta) > Math.abs(active.baselineAvg) * 0.15 ||
    active.data.some((d) => d.flag);

  const chartWidth = Math.min(width - 90, 500);

  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* ── Metric Selector Pills ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {METRICS.map((m) => {
          const isActive = m.key === activeKey;
          return (
            <Pressable
              key={m.key}
              onPress={() => setActiveKey(m.key)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {m.shortLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Chart Card ── */}
      <UniversalLiquidCard variant="elevated" style={styles.chartCard}>
        <Text style={styles.chartTitle}>{active.label}</Text>

        <View style={styles.chartWrap}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={200}
            curved
            areaChart
            color={Colors.primary}
            thickness={3}
            startFillColor="rgba(22,101,52,0.30)"
            endFillColor="rgba(255,255,255,0)"
            startOpacity={0.4}
            endOpacity={0}
            hideDataPoints={false}
            dataPointsColor={Colors.primary}
            dataPointsHeight={8}
            dataPointsWidth={8}
            xAxisColor={Colors.forest[200]}
            yAxisColor="transparent"
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            rulesType="dashed"
            dashWidth={4}
            dashGap={4}
            rulesColor={Colors.forest[100]}
            noOfSections={4}
            showReferenceLine1
            referenceLine1Position={active.baselineAvg}
            referenceLine1Config={{
              color: Colors.forest[400],
              dashWidth: 6,
              dashGap: 4,
              thickness: 1.5,
            }}
            spacing={(chartWidth - 40) / (active.data.length - 1)}
            initialSpacing={20}
            endSpacing={20}
            isAnimated
            animationDuration={800}
          />
        </View>

        {/* Baseline legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendLine} />
          <Text style={styles.legendLabel}>
            26-week baseline: {active.baselineAvg} {active.unit}
          </Text>
        </View>
      </UniversalLiquidCard>

      {/* ── Delta Summary ── */}
      <UniversalLiquidCard
        variant={isAnomaly ? "active" : "default"}
        style={styles.deltaCard}
      >
        <View style={styles.deltaRow}>
          <View style={styles.deltaLeft}>
            <Text style={styles.deltaMetric}>
              {latest.value}{" "}
              <Text style={styles.deltaUnit}>{active.unit}</Text>
            </Text>
            <Text style={styles.deltaLabel}>Current (Feb 21)</Text>
          </View>

          <View style={styles.deltaDivider} />

          <View style={styles.deltaRight}>
            <Text
              style={[
                styles.deltaValue,
                { color: isAnomaly ? Colors.accent : Colors.forest[600] },
              ]}
            >
              {deltaSign}
              {delta.toFixed(1)} {active.unit}
            </Text>
            <Text style={styles.deltaLabel}>vs baseline</Text>
          </View>
        </View>

        {isAnomaly && (
          <View style={styles.flagRow}>
            <Ionicons
              name="warning"
              size={16}
              color={Colors.accent}
            />
            <Text style={styles.flagText}>
              Clinically significant deviation detected
            </Text>
          </View>
        )}
      </UniversalLiquidCard>

      {/* ── Data Source Note ── */}
      <UniversalLiquidCard variant="subtle" style={styles.noteCard}>
        <View style={styles.noteRow}>
          <Ionicons name="information-circle" size={18} color={Colors.forest[500]} />
          <Text style={styles.noteText}>
            Displaying deterministic mock data for web deployment. Connect Apple
            Watch on iOS for live biometric streaming.
          </Text>
        </View>
      </UniversalLiquidCard>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 60 },

  blob1: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: Colors.forest[50],
    opacity: 0.45,
    top: -100,
    left: -40,
  },
  blob2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.forest[200],
    opacity: 0.2,
    bottom: 80,
    right: -60,
  },

  /* Pills */
  pillRow: { gap: 8, paddingVertical: 8, paddingBottom: 16 },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.forest[50],
    borderWidth: 1,
    borderColor: Colors.forest[200],
  },
  pillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pillText: { fontSize: 14, fontWeight: "600", color: Colors.forest[700] },
  pillTextActive: { color: "#fff" },

  /* Chart card */
  chartCard: { padding: 20, marginBottom: 14 },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 16,
  },
  chartWrap: { marginLeft: -8, marginBottom: 8 },
  axisText: { fontSize: 11, color: Colors.forest[500] },

  /* Spike data points */
  spikeOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(34,197,94,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  spikeInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: "#fff",
  },

  /* Baseline legend */
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  legendLine: {
    width: 20,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.forest[400],
  },
  legendLabel: { fontSize: 12, color: Colors.forest[500] },

  /* Delta card */
  deltaCard: { padding: 20, marginBottom: 14 },
  deltaRow: { flexDirection: "row", alignItems: "center" },
  deltaLeft: { flex: 1 },
  deltaRight: { flex: 1, alignItems: "flex-end" },
  deltaDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.forest[200],
    marginHorizontal: 16,
  },
  deltaMetric: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
  },
  deltaUnit: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.forest[600],
  },
  deltaLabel: {
    fontSize: 12,
    color: Colors.forest[500],
    marginTop: 2,
  },
  deltaValue: { fontSize: 22, fontWeight: "700" },

  flagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "rgba(34,197,94,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  flagText: { fontSize: 13, fontWeight: "600", color: Colors.primary },

  /* Note */
  noteCard: { padding: 16 },
  noteRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19, color: Colors.forest[600] },
});
