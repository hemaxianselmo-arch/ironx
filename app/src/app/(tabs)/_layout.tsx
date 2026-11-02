import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "../../ui/TabBar";
import { C } from "../../theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }} tabBar={(p) => <TabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="fil" />
      <Tabs.Screen name="seance" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="salle" />
    </Tabs>
  );
}
