import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: NAV_H - 18 + Math.max(insets.bottom, 18), paddingTop: 4, paddingHorizontal: 8, paddingBottom: Math.max(insets.bottom, 18),
      flexDirection: "row", backgroundColor: dark ? "rgba(12,14,26,0)" : "rgba(12,14,26,0.96)", borderTopWidth: dark ? 0 : 1, borderTopColor: C.line }}>
      {TABS.map((t) => {
        const on = active === t.key;
        return (
          <Pressable key={t.key} onPress={() => navigation.navigate(t.key)} style={{ flex: 1, alignItems: "center", gap: 3, paddingTop: 8, paddingBottom: 2 }}>
            <Image source={t.img} style={{ width: 28, height: 28, opacity: on ? 1 : 0.55 }} resizeMode="contain" />
            <Text style={{ fontFamily: inter(on ? 700 : 500), fontSize: 10.5, color: on ? C.txt : C.mut }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
