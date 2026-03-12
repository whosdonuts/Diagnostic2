/**
 * Design tokens for the MyHealthPal "Liquid Glass" green theme.
 * Use these in StyleSheet.create or Reanimated when Tailwind classes
 * aren't available (e.g. animated interpolation targets).
 */

export const Colors = {
  primary: "#166534",
  secondary: "#DCFCE7",
  accent: "#22C55E",
  surface: "#FAFFFE",
  white: "#FFFFFF",

  forest: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
    950: "#052E16",
  },

  glass: {
    fill: "rgba(255, 255, 255, 0.08)",
    fill12: "rgba(255, 255, 255, 0.12)",
    fill20: "rgba(255, 255, 255, 0.20)",
    border: "rgba(255, 255, 255, 0.25)",
    borderStrong: "rgba(255, 255, 255, 0.35)",
    green: "rgba(220, 252, 231, 0.15)",
    green20: "rgba(220, 252, 231, 0.20)",
  },

  shadow: {
    greenTint: "rgba(22, 101, 52, 0.12)",
    greenTintHover: "rgba(22, 101, 52, 0.18)",
    accentGlow: "rgba(34, 197, 94, 0.4)",
    specularWhite: "rgba(255, 255, 255, 0.35)",
  },
} as const;

export const GlassRadius = {
  sm: 20,
  md: 30,
  lg: 40,
} as const;
