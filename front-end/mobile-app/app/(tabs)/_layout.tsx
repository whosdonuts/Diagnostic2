import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface TabDefinition {
  name: string;
  title: string;
  iconFocused: IoniconsName;
  iconDefault: IoniconsName;
  headerShown?: boolean;
}

const TABS: TabDefinition[] = [
  {
    name: "scanner",
    title: "Scanner",
    iconFocused: "scan",
    iconDefault: "scan-outline",
    headerShown: false,
  },
  {
    name: "triage",
    title: "Triage",
    iconFocused: "mic",
    iconDefault: "mic-outline",
  },
  {
    name: "vitals",
    title: "Vitals",
    iconFocused: "heart",
    iconDefault: "heart-outline",
  },
  {
    name: "funding",
    title: "Funding",
    iconFocused: "wallet",
    iconDefault: "wallet-outline",
  },
  {
    name: "community",
    title: "Community",
    iconFocused: "people",
    iconDefault: "people-outline",
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor:
            Platform.OS === "web"
              ? "rgba(255, 255, 255, 0.88)"
              : Colors.white,
        },
        headerTintColor: Colors.primary,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "700",
          color: Colors.primary,
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: Colors.tabBar.active,
        tabBarInactiveTintColor: Colors.tabBar.inactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar.background,
          borderTopColor: Colors.tabBar.border,
          borderTopWidth: 1,
          ...(Platform.OS === "web"
            ? ({
                backdropFilter: "blur(20px) saturate(150%)",
                WebkitBackdropFilter: "blur(20px) saturate(150%)",
              } as Record<string, string>)
            : {}),
          height: Platform.OS === "web" ? 64 : undefined,
          paddingBottom: Platform.OS === "web" ? 8 : undefined,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerShown: tab.headerShown,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.iconDefault}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
