import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SlideInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  UniversalCamera,
  type CameraHandle,
} from "../../components/UniversalCamera";
import { UniversalLiquidCard } from "../../components/UniversalLiquidCard";
import { Colors } from "../../constants/Colors";

const BRACKET_SIZE = 52;
const BRACKET_WEIGHT = 3.5;
const FRAME_RATIO = 0.72;

export default function ScannerScreen() {
  const cameraRef = useRef<CameraHandle>(null);
  const { width, height } = useWindowDimensions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const shutterScale = useSharedValue(1);

  const frameW = width * FRAME_RATIO;
  const frameH = frameW * 1.35;
  const frameTop = (height - frameH) / 2 - 30;
  const frameLeft = (width - frameW) / 2;

  const handleCapture = useCallback((uri: string) => {
    setCapturedUri(uri);
  }, []);

  const handleShutterPress = useCallback(() => {
    shutterScale.value = withSpring(0.82, { damping: 10, stiffness: 400 });
    setTimeout(() => {
      shutterScale.value = withSpring(1, { damping: 14, stiffness: 300 });
    }, 120);
    cameraRef.current?.capture();
  }, []);

  const handleDismiss = useCallback(() => {
    setCapturedUri(null);
  }, []);

  const shutterAnim = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* ─── Live Camera Feed ─── */}
      <UniversalCamera
        ref={cameraRef}
        onCapture={handleCapture}
        isActive={true}
      />

      {/* ─── Viewfinder Overlay ─── */}
      {!capturedUri && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Instruction */}
          <View style={styles.instructionWrap}>
            <View style={styles.instructionPill}>
              <Ionicons name="scan-outline" size={16} color="#fff" />
              <Text style={styles.instructionText}>
                Align document within frame
              </Text>
            </View>
          </View>

          {/* Bracket: Top-Left */}
          <View
            style={[
              styles.bracket,
              {
                top: frameTop,
                left: frameLeft,
                borderTopWidth: BRACKET_WEIGHT,
                borderLeftWidth: BRACKET_WEIGHT,
              },
            ]}
          />
          {/* Bracket: Top-Right */}
          <View
            style={[
              styles.bracket,
              {
                top: frameTop,
                right: frameLeft,
                borderTopWidth: BRACKET_WEIGHT,
                borderRightWidth: BRACKET_WEIGHT,
              },
            ]}
          />
          {/* Bracket: Bottom-Left */}
          <View
            style={[
              styles.bracket,
              {
                top: frameTop + frameH - BRACKET_SIZE,
                left: frameLeft,
                borderBottomWidth: BRACKET_WEIGHT,
                borderLeftWidth: BRACKET_WEIGHT,
              },
            ]}
          />
          {/* Bracket: Bottom-Right */}
          <View
            style={[
              styles.bracket,
              {
                top: frameTop + frameH - BRACKET_SIZE,
                right: frameLeft,
                borderBottomWidth: BRACKET_WEIGHT,
                borderRightWidth: BRACKET_WEIGHT,
              },
            ]}
          />
        </View>
      )}

      {/* ─── Shutter Button ─── */}
      {!capturedUri && (
        <View style={styles.shutterWrap}>
          <Animated.View style={shutterAnim}>
            <Pressable onPress={handleShutterPress} style={styles.shutterRing}>
              <View style={styles.shutterDisc} />
            </Pressable>
          </Animated.View>
        </View>
      )}

      {/* ─── Results Modal ─── */}
      {capturedUri && (
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(180)}
          style={styles.modalWrap}
        >
          <UniversalLiquidCard
            variant="elevated"
            style={styles.modalCard}
          >
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header row */}
            <View style={styles.headerRow}>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={Colors.accent}
              />
              <Text style={styles.headerTitle}>Scan Complete</Text>
              <Pressable onPress={handleDismiss} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.forest[700]} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
            >
              {/* Section label */}
              <Text style={styles.sectionLabel}>AI Summary</Text>

              {/* Bullet 1 */}
              <View style={styles.bulletRow}>
                <Ionicons
                  name="medical"
                  size={20}
                  color={Colors.forest[600]}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Metformin 500 mg</Text> detected —
                  oral hypoglycemic for Type 2 Diabetes management. Take with
                  meals to reduce gastrointestinal side effects.
                </Text>
              </View>

              {/* Bullet 2 */}
              <View style={styles.bulletRow}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={Colors.forest[600]}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Drug interaction flag:</Text> Avoid
                  combining with excess alcohol — increases risk of lactic
                  acidosis. Inform your provider of all current supplements.
                </Text>
              </View>

              {/* Bullet 3 */}
              <View style={styles.bulletRow}>
                <Ionicons
                  name="fitness"
                  size={20}
                  color={Colors.forest[600]}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Lifestyle note:</Text> Pairing this
                  medication with 30-minute daily walks is shown to improve A1C
                  outcomes by up to 1.2% in clinical trials.
                </Text>
              </View>

              {/* ─── Nutritional Swap Accent ─── */}
              <View style={styles.swapCard}>
                <View style={styles.swapHeader}>
                  <Ionicons name="nutrition" size={22} color="#fff" />
                  <Text style={styles.swapTitle}>Nutritional Swap</Text>
                </View>
                <Text style={styles.swapBody}>
                  Replace white rice with{" "}
                  <Text style={styles.swapBold}>cauliflower rice</Text> —
                  reduces glycemic load by ~72 % per serving while maintaining
                  satiety and fiber intake.
                </Text>
              </View>
            </ScrollView>
          </UniversalLiquidCard>
        </Animated.View>
      )}
    </View>
  );
}

/* ────────────────────── Styles ────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  /* Instruction pill */
  instructionWrap: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Alignment brackets */
  bracket: {
    position: "absolute",
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    borderColor: "#FFFFFF",
    borderRadius: 6,
  },

  /* Shutter */
  shutterWrap: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterDisc: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
  },

  /* Results modal */
  modalWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "85%",
  },
  modalCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 44,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.forest[300],
    alignSelf: "center",
    marginBottom: 16,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.forest[100],
    alignItems: "center",
    justifyContent: "center",
  },

  /* Scroll */
  scroll: {
    flexGrow: 0,
  },

  /* Bullets */
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.forest[600],
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.forest[800],
  },
  bold: {
    fontWeight: "700",
    color: Colors.primary,
  },

  /* Nutritional swap accent */
  swapCard: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
  },
  swapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  swapTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  swapBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
  },
  swapBold: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
