import React from "react";
import { Stack } from "expo-router";
import { C } from "../../theme/tokens";
export default function PerfLayout() { return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: "slide_from_right" }} />; }
