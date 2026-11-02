import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, NAV_H, inter } from "../theme/tokens";
import { IMG } from "../theme/images";

export const TABS = [
  { key: "index", label: "Accueil", img: IMG["nav-accueil"] },
  { key: "fil", label: "Fil", img: IMG["nav-fil"] },
  { key: "seance", label: "Séance", img: IMG["nav-seance"] },
  { key: "nutrition", label: "Nutrition", img: IMG["nav-nutrition"] },
  { key: "salle", label: "Salle", img: IMG["nav-salle"] },
];

/** Barre d'onglets des maquettes (nav()) : images fournies, fond flouté sombre */
export function TabBar({ state, navigation, dark = false }: any) {
  const insets = useSafeAreaInsets();
  const active = state.routes[state.index].name;
  return (
    <View style={{ height: NAV_H - 18 + Math.max(insets.bottom, 18), paddingTop: 4, paddingHorizontal: 8, paddingBottom: Math.max(insets.bottom, 18), zIndex: 50, elevation: 50,
      flexDirection: "row", backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line }}>
      {TABS.map((t) => {
        const on = active === t.key;
        return (
          <Pressable key={t.key} onPress={() => { try { navigation.navigate(t.key); } catch { router.navigate(("/(tabs)/" + (t.key === "index" ? "" : t.key)) as any); } }} hitSlop={6} style={{ flex: 1, alignItems: "center", gap: 3, paddingTop: 8, paddingBottom: 2 }}>
            <Image source={t.img} style={{ width: 28, height: 28, opacity: on ? 1 : 0.55 }} resizeMode="contain" />
            <Text style={{ fontFamily: inter(on ? 700 : 500), fontSize: 10.5, color: on ? C.txt : C.mut }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
