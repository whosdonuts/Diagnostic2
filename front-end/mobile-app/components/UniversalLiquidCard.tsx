import React, { useCallback } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Colors, GlassRadius } from "../constants/Colors";

const SPRING_IN = { damping: 18, stiffness: 350, mass: 0.8 };
const SPRING_OUT = { damping: 14, stiffness: 280, mass: 0.6 };

type GlassVariant = "default" | "elevated" | "active" | "subtle";

interface UniversalLiquidCardProps {
  children: React.ReactNode;
  variant?: GlassVariant;
  className?: string;
  pressable?: boolean;
  radius?: keyof typeof GlassRadius;
  style?: ViewStyle;
}

/* ───────────── Variant style maps ───────────── */

const VARIANT_FILL: Record<GlassVariant, ViewStyle> = {
  default: {
    backgroundColor: Colors.glass.fill12,
    borderColor: Colors.glass.border,
    borderWidth: 1,
  },
  elevated: {
    backgroundColor: Colors.glass.fill20,
    borderColor: Colors.glass.borderStrong,
    borderWidth: 1,
  },
  active: {
    backgroundColor: Colors.glass.green20,
    borderColor: Colors.forest[400],
    borderWidth: 1.5,
  },
  subtle: {
    backgroundColor: Colors.glass.fill,
    borderColor: "transparent",
    borderWidth: 0,
  },
};

const WEB_SHADOW: Record<GlassVariant, string> = {
  default:
    "0 8px 32px rgba(22,101,52,0.12), inset 0 1px 0 rgba(255,255,255,0.35)",
  elevated:
    "0 12px 40px rgba(22,101,52,0.18), inset 0 1px 0 rgba(255,255,255,0.45)",
  active:
    "0 4px 20px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
  subtle:
    "0 4px 16px rgba(22,101,52,0.06), inset 0 1px 0 rgba(255,255,255,0.15)",
};

/**
 * UniversalLiquidCard
 *
 * Platform-adaptive frosted-glass container.
 * - **Web:** CSS `backdrop-filter: blur()` + `boxShadow` (never crashes).
 * - **Native:** `expo-blur` BlurView + native shadow props.
 *
 * Accepts NativeWind `className` for outer layout utilities.
 */
export function UniversalLiquidCard({
  children,
  variant = "default",
  className = "",
  pressable = false,
  radius = "md",
  style,
}: UniversalLiquidCardProps) {
  const pressed = useSharedValue(0);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.965]) },
    ],
  }));

  const onPressIn = useCallback(() => {
    if (pressable) pressed.value = withSpring(1, SPRING_IN);
  }, [pressable]);

  const onPressOut = useCallback(() => {
    if (pressable) pressed.value = withSpring(0, SPRING_OUT);
  }, [pressable]);

  const borderRadius = GlassRadius[radius];
  const variantFill = VARIANT_FILL[variant];

  /* ──────────── WEB: CSS backdrop-filter ──────────── */
  if (Platform.OS === "web") {
    return (
      <Animated.View
        onPointerDown={onPressIn}
        onPointerUp={onPressOut}
        onPointerLeave={onPressOut}
        style={[
          scaleStyle,
          variantFill,
          {
            borderRadius,
            overflow: "hidden" as const,
            // @ts-expect-error — web-only CSS properties
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            boxShadow: WEB_SHADOW[variant],
            transition: "box-shadow 0.3s ease",
          },
          style,
        ]}
        className={`relative ${className}`}
      >
        {/* Specular inner glow — raw <div> bypasses RN Web style validation */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
        <View className="relative z-10">{children}</View>
      </Animated.View>
    );
  }

  /* ──────────── NATIVE: expo-blur BlurView ──────────── */
  return (
    <Animated.View
      onTouchStart={onPressIn}
      onTouchEnd={onPressOut}
      onTouchCancel={onPressOut}
      style={[
        scaleStyle,
        nativeStyles.wrapper,
        variantFill,
        { borderRadius },
        style,
      ]}
      className={`relative overflow-hidden ${className}`}
    >
      <BlurView
        intensity={60}
        tint="light"
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <View
        style={[nativeStyles.innerGlow, { borderRadius }]}
        className="absolute inset-0 pointer-events-none"
      />
      <View className="relative z-10">{children}</View>
    </Animated.View>
  );
}

const nativeStyles = StyleSheet.create({
  wrapper: {
    shadowColor: Colors.shadow.greenTint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
  },
  innerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

export default UniversalLiquidCard;
