import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { UniversalLiquidCard } from "../../components/UniversalLiquidCard";
import { ClinicMapView, type ClinicPin } from "../../components/MapView";
import { ClinicianFlipCard } from "../../components/ClinicianFlipCard";
import { usePatientStore } from "../../store/patientStore";
import { submitIntake } from "../../services/apiSync";
import { Colors } from "../../constants/Colors";

/* ───────────────── Mock Data ───────────────── */

interface SymptomSeed {
  id: string;
  label: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

const MOCK_SYMPTOMS: SymptomSeed[] = [
  { id: "sym_01", label: "Chronic pelvic pain radiating to lower back", severity: 5 },
  { id: "sym_02", label: "Menstrual irregularity (>7-day cycle variance)", severity: 4 },
  { id: "sym_03", label: "Persistent fatigue unrelieved by sleep", severity: 4 },
  { id: "sym_04", label: "Painful intercourse (dyspareunia)", severity: 3 },
  { id: "sym_05", label: "Cyclical bloating & GI distress", severity: 3 },
  { id: "sym_06", label: "Urinary frequency without infection", severity: 2 },
];

const LONDON_CLINICS: ClinicPin[] = [
  {
    name: "London Health Sciences Centre",
    address: "339 Windermere Rd, London, ON",
    latitude: 42.993,
    longitude: -81.271,
    distance: "1.2 km",
  },
  {
    name: "St. Joseph's Health Care",
    address: "268 Grosvenor St, London, ON",
    latitude: 42.988,
    longitude: -81.256,
    distance: "2.8 km",
  },
  {
    name: "Victoria Hospital",
    address: "800 Commissioners Rd E, London, ON",
    latitude: 42.967,
    longitude: -81.222,
    distance: "3.5 km",
  },
];

const MOCK_TRANSCRIPT =
  "I've been experiencing severe cramping and lower back pain for the past week. The pain is worse at night and I haven't been able to sleep. I also noticed some bloating that comes and goes with my cycle.";

/* ───────────────── Screen ───────────────── */

export default function TriageScreen() {
  const { width } = useWindowDimensions();
  const addSymptom = usePatientStore((s) => s.addSymptom);
  const setTranscription = usePatientStore((s) => s.setTranscription);

  /* ── Voice recording ── */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch {
      setIsRecording(true);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {
      /* noop */
    }
    setIsRecording(false);
    setRecordingDone(true);
    setTranscription({
      rawText: MOCK_TRANSCRIPT,
      durationMs: 12400,
      recordedAt: new Date().toISOString(),
      languageCode: "en-US",
    });
  }, [setTranscription]);

  const handleMicPress = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  /* ── Symptom card deck ── */
  const [cardIdx, setCardIdx] = useState(0);
  const translateX = useSharedValue(0);
  const cardIdxRef = useRef(0);
  cardIdxRef.current = cardIdx;

  const onSwipe = useCallback(
    (confirmed: boolean) => {
      const idx = cardIdxRef.current;
      if (idx >= MOCK_SYMPTOMS.length) return;
      const sym = MOCK_SYMPTOMS[idx];
      addSymptom({ id: sym.id, label: sym.label, severity: sym.severity, confirmed });
      setCardIdx(idx + 1);
      translateX.value = 0;
    },
    [addSymptom],
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = width * 0.22;
      if (e.translationX > threshold) {
        translateX.value = withTiming(width, { duration: 250 }, (done) => {
          if (done) runOnJS(onSwipe)(true);
        });
      } else if (e.translationX < -threshold) {
        translateX.value = withTiming(-width, { duration: 250 }, (done) => {
          if (done) runOnJS(onSwipe)(false);
        });
      } else {
        translateX.value = withSpring(0, { damping: 16, stiffness: 200 });
      }
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-width, 0, width], [-12, 0, 12])}deg` },
    ],
  }));

  const confirmLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, width * 0.22], [0, 1], Extrapolation.CLAMP),
  }));

  const dismissLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-width * 0.22, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const visibleSymptoms = MOCK_SYMPTOMS.slice(cardIdx, cardIdx + 3);
  const allReviewed = cardIdx >= MOCK_SYMPTOMS.length;

  const handleClinicianHandoff = useCallback(async () => {
    await submitIntake();
  }, []);

  /* ── Render ── */
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

      {/* ────── Section 1: Voice Triage ────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Triage</Text>
        <Text style={styles.sectionSub}>
          Describe your symptoms in your own words
        </Text>

        <View style={styles.micWrap}>
          <Pressable
            onPress={handleMicPress}
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={36}
              color={isRecording ? "#fff" : Colors.accent}
            />
          </Pressable>
        </View>

        <Text style={styles.micLabel}>
          {isRecording
            ? "Recording… tap to stop"
            : recordingDone
              ? "Recording complete"
              : "Tap to start recording"}
        </Text>

        {recordingDone && (
          <UniversalLiquidCard variant="subtle" style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>TRANSCRIPT</Text>
            <Text style={styles.transcriptText}>"{MOCK_TRANSCRIPT}"</Text>
          </UniversalLiquidCard>
        )}
      </View>

      {/* ────── Section 2: Symptom Card Deck ────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptom Confirmation</Text>
        <Text style={styles.sectionSub}>
          Swipe right to confirm · left to dismiss
        </Text>

        <View style={styles.deckWrap}>
          {!allReviewed ? (
            visibleSymptoms.map((sym, i) => {
              const isTop = i === 0;
              const stackOffset = i;

              const cardEl = (
                <Animated.View
                  key={sym.id}
                  style={[
                    styles.deckCard,
                    {
                      zIndex: visibleSymptoms.length - i,
                      transform: isTop
                        ? undefined
                        : [
                            { scale: 1 - stackOffset * 0.045 },
                            { translateY: stackOffset * 10 },
                          ],
                    },
                    isTop && cardAnimStyle,
                  ]}
                >
                  {/* Swipe overlays (top card only) */}
                  {isTop && (
                    <>
                      <Animated.View style={[styles.swipeBadge, styles.confirmBadge, confirmLabelStyle]}>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.swipeBadgeText}>CONFIRM</Text>
                      </Animated.View>
                      <Animated.View style={[styles.swipeBadge, styles.dismissBadge, dismissLabelStyle]}>
                        <Ionicons name="close-circle" size={18} color="#fff" />
                        <Text style={styles.swipeBadgeText}>DISMISS</Text>
                      </Animated.View>
                    </>
                  )}

                  <UniversalLiquidCard variant={isTop ? "active" : "default"}>
                    <View style={styles.symptomInner}>
                      <View style={styles.symptomTopRow}>
                        <View style={styles.severityBadge}>
                          <Text style={styles.severityNum}>{sym.severity}</Text>
                        </View>
                        <Text style={styles.severityLabel}>
                          Severity {sym.severity}/5
                        </Text>
                      </View>
                      <Text style={styles.symptomLabel}>{sym.label}</Text>
                      <View style={styles.dotsRow}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <View
                            key={n}
                            style={[
                              styles.dot,
                              n <= sym.severity && styles.dotFilled,
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </UniversalLiquidCard>
                </Animated.View>
              );

              if (isTop) {
                return (
                  <GestureDetector key={sym.id} gesture={panGesture}>
                    {cardEl}
                  </GestureDetector>
                );
              }
              return cardEl;
            })
          ) : (
            <UniversalLiquidCard variant="active" style={styles.doneCard}>
              <View style={styles.doneInner}>
                <Ionicons name="checkmark-done-circle" size={44} color={Colors.accent} />
                <Text style={styles.doneTitle}>All Symptoms Reviewed</Text>
                <Text style={styles.doneSub}>
                  {MOCK_SYMPTOMS.length} symptoms processed and saved
                </Text>
              </View>
            </UniversalLiquidCard>
          )}
        </View>

        {/* Button fallbacks */}
        {!allReviewed && (
          <View style={styles.btnRow}>
            <Pressable
              onPress={() => onSwipe(false)}
              style={[styles.actionBtn, styles.dismissBtn]}
            >
              <Ionicons name="close" size={20} color={Colors.forest[700]} />
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </Pressable>
            <Pressable
              onPress={() => onSwipe(true)}
              style={[styles.actionBtn, styles.confirmBtn]}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ────── Section 3: Nearby Clinics ────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearest Clinics</Text>
        <Text style={styles.sectionSub}>London, Ontario</Text>

        <View style={styles.mapContainer}>
          <ClinicMapView clinics={LONDON_CLINICS} height={220} />
        </View>

        {LONDON_CLINICS.map((c) => (
          <UniversalLiquidCard
            key={c.name}
            variant="default"
            pressable
            style={styles.clinicCard}
          >
            <View style={styles.clinicRow}>
              <View style={styles.clinicIcon}>
                <Ionicons name="location" size={20} color={Colors.accent} />
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{c.name}</Text>
                <Text style={styles.clinicAddr}>{c.address}</Text>
              </View>
              <View style={styles.distBadge}>
                <Text style={styles.distText}>{c.distance}</Text>
              </View>
            </View>
          </UniversalLiquidCard>
        ))}
      </View>

      {/* ────── Section 4: Clinician Handoff ────── */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Clinician Handoff</Text>
        <Text style={styles.sectionSub}>
          Tap the card to flip between patient & clinician views
        </Text>
        <ClinicianFlipCard onBeforeFlip={handleClinicianHandoff} />
      </View>
    </ScrollView>
    </View>
  );
}

/* ───────────────── Styles ───────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 },

  blob1: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: Colors.forest[100],
    opacity: 0.35,
    top: -80,
    right: -60,
  },
  blob2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.forest[200],
    opacity: 0.2,
    bottom: 120,
    left: -50,
  },

  /* ── Section chrome ── */
  section: { marginBottom: 36 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 14,
    color: Colors.forest[600],
    marginBottom: 18,
  },

  /* ── Mic ── */
  micWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  micBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.forest[50],
    borderWidth: 2.5,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.forest[300],
  },
  micLabel: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: Colors.forest[700],
    marginTop: 16,
    marginBottom: 16,
  },
  transcriptCard: {
    padding: 16,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.forest[600],
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.forest[800],
    fontStyle: "italic",
  },

  /* ── Card Deck ── */
  deckWrap: {
    height: 200,
    marginBottom: 12,
  },
  deckCard: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  symptomInner: { padding: 20 },
  symptomTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  severityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  severityNum: { color: "#fff", fontWeight: "800", fontSize: 15 },
  severityLabel: { fontSize: 13, fontWeight: "600", color: Colors.forest[600] },
  symptomLabel: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    color: Colors.primary,
    marginBottom: 14,
  },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.forest[200],
  },
  dotFilled: { backgroundColor: Colors.accent },

  /* Swipe overlays */
  swipeBadge: {
    position: "absolute",
    top: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  confirmBadge: { right: 16, backgroundColor: Colors.accent },
  dismissBadge: { left: 16, backgroundColor: Colors.forest[700] },
  swipeBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },

  /* Button fallbacks */
  btnRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  dismissBtn: {
    backgroundColor: Colors.forest[100],
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
  },
  dismissBtnText: { fontSize: 15, fontWeight: "600", color: Colors.forest[700] },
  confirmBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  /* Done state */
  doneCard: { padding: 0 },
  doneInner: { alignItems: "center", padding: 32 },
  doneTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary, marginTop: 12 },
  doneSub: { fontSize: 14, color: Colors.forest[600], marginTop: 4 },

  /* ── Map ── */
  mapContainer: { marginBottom: 14, borderRadius: 20, overflow: "hidden" },
  clinicCard: { marginBottom: 10, padding: 0 },
  clinicRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  clinicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.forest[50],
    alignItems: "center",
    justifyContent: "center",
  },
  clinicInfo: { flex: 1 },
  clinicName: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  clinicAddr: { fontSize: 13, color: Colors.forest[600], marginTop: 2 },
  distBadge: {
    backgroundColor: Colors.forest[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distText: { fontSize: 12, fontWeight: "700", color: Colors.forest[700] },
});
