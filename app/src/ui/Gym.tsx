import React from "react";
import { View, Text, Pressable } from "react-native";
import { C, inter, man, accentA } from "../theme/tokens";
import { Avatar } from "./Controls";
export const GOLD = "#FFD54A", SILVER = "#C9CDDA", BRONZE = "#E0A070";
export const Rank = ({ n }: { n: number }) => <Text style={{ width: 24, textAlign: "center", fontFamily: man(700), fontSize: 15, color: ({ 1: GOLD, 2: SILVER, 3: BRONZE } as any)[n] ?? C.mut }}>{n}</Text>;
export function MemberRow({ ini, name, s, right, me, ring = true, onPress }: { ini: string; name: string; s: string; right?: React.ReactNode; me?: boolean; ring?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 }}>
      <Avatar ini={ini} size={44} ring={ring} />
      <View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(me ? 700 : 600), fontSize: 15, color: C.txt }}>{name}</Text><Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }} numberOfLines={1}>{s}</Text></View>
      {right}
    </Pressable>
  );
}
export function RankRow({ n, ini, name, val, s, me, onPress }: { n: number; ini: string; name: string; val: string; s: string; me?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: me ? 8 : 0, marginHorizontal: me ? -8 : 0, borderRadius: 14, backgroundColor: me ? accentA(0.1) : "transparent" }}>
      <Rank n={n} /><Avatar ini={ini} size={40} ring />
      <View style={{ flex: 1, gap: 1 }}><Text style={{ fontFamily: inter(me ? 700 : 600), fontSize: 15, color: C.txt }}>{name}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{s}</Text></View>
      <Text style={{ fontFamily: man(700), fontSize: 16, color: me ? C.accent : C.txt }}>{val}</Text>
    </Pressable>
  );
}
