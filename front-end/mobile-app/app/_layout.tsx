import "../global.css";

import { useEffect } from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "../constants/Colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor:
              Platform.OS === "web"
                ? "rgba(255, 255, 255, 0.85)"
                : Colors.white,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: "700",
            color: Colors.primary,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.white },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
