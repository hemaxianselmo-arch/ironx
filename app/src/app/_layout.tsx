import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppFonts } from "../theme/fonts";
import { C } from "../theme/tokens";
import { loadWorkouts } from "../store/workout";
import { loadProfile } from "../store/profile";

export default function RootLayout() {
  const [loaded] = useAppFonts();
  useEffect(() => { loadWorkouts(); loadProfile(); }, []);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: "fade" }} />
    </SafeAreaProvider>
  );
}
