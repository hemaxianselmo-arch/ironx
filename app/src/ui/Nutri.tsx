import React from "react";
import { View, Text, Pressable } from "react-native";
import { C, inter, man } from "../theme/tokens";
import { Media } from "./Layout";
import { Macro } from "./Charts";
export const MP = "#4DB8FF", MG = "#FFB84D", ML = "#FF6B9A";
/** Ligne aliment (food_row) */
export function FoodRow({ name, s, kcal, photo, right, onPress }: { name: string; s: string; kcal?: number | string; photo: string; right?: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <Media photo={photo as any} h={48} w={48} r={12} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(600), fontSize: 14.5, color: C.txt }} numberOfLines={1}>{name}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }} numberOfLines={1}>{s}</Text>
      </View>
      {right ?? <Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{kcal}</Text>}
    </Pressable>
  );
}
export const Macros3 = ({ p, g, l, pg, gg, lg }: { p: number; g: number; l: number; pg: number; gg: number; lg: number }) => (
  <View style={{ flexDirection: "row", gap: 14 }}><Macro label="Protéines" v={Math.round(p)} g={pg} color={MP} /><Macro label="Glucides" v={Math.round(g)} g={gg} color={MG} /><Macro label="Lipides" v={Math.round(l)} g={lg} color={ML} /></View>
);
