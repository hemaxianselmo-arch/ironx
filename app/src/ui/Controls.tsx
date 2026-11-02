import React from "react";
import { Pressable, Text, View, ViewStyle, StyleSheet, Image, ScrollView } from "react-native";
import { C, accentA, inter, man } from "../theme/tokens";
import { Icon, IconName } from "./Icon";
import { IMG, ImgName } from "../theme/images";

type Kind = "primary" | "secondary" | "white" | "glass";
const KIND: Record<Kind, { bg: string; fg: string; shadow?: string }> = {
  primary: { bg: C.accent, fg: C.onAccent, shadow: `0 6px 18px ${accentA(0.35)}` },
  secondary: { bg: "rgba(255,255,255,0.08)", fg: C.txt },
  white: { bg: C.txt, fg: C.bg },
  glass: { bg: "rgba(255,255,255,0.14)", fg: "#fff" },
};

/** Bouton pilule (btn des maquettes) */
export function Btn({ label, kind = "primary", icon, size = "lg", full = true, onPress, style }: {
  label: string; kind?: Kind; icon?: IconName; size?: "lg" | "md" | "sm"; full?: boolean; onPress?: () => void; style?: ViewStyle;
}) {
  const h = { lg: 54, md: 46, sm: 36 }[size];
  const fs = { lg: 16, md: 15, sm: 13 }[size];
  const k = KIND[kind];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      { height: h, borderRadius: h / 2, backgroundColor: k.bg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        paddingHorizontal: full ? 0 : Math.round(h * 0.45), alignSelf: full ? "stretch" : "flex-start", opacity: pressed ? 0.85 : 1,
        boxShadow: k.shadow } as any, style]}>
      {icon ? <Icon name={icon} size={fs + 2} color={k.fg} w={2.2} /> : null}
      <Text style={{ fontFamily: man(700), fontSize: fs, color: k.fg }}>{label}</Text>
    </Pressable>
  );
}

/** Bouton rond (circ) avec étiquette optionnelle dessous */
export function Circ({ icon, size = 40, kind = "secondary", label, onPress, style }: {
  icon: IconName; size?: number; kind?: Kind; label?: string; onPress?: () => void; style?: ViewStyle;
}) {
  const k = KIND[kind];
  const b = (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: k.bg, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.8 : 1, boxShadow: k.shadow } as any, !label && style]}>
      <Icon name={icon} size={Math.round(size * (label ? 0.46 : 0.5))} color={k.fg} w={2} />
    </Pressable>
  );
  if (!label) return b;
  return (
    <View style={[{ alignItems: "center", gap: 7 }, style]}>
      {b}
      <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.soft }}>{label}</Text>
    </View>
  );
}

export function Pill({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, justifyContent: "center", backgroundColor: on ? C.txt : "rgba(255,255,255,0.08)" }}>
      <Text style={{ fontFamily: inter(on ? 700 : 500), fontSize: 13, color: on ? C.bg : C.txt }}>{label}</Text>
    </Pressable>
  );
}
export function Pills({ items, on = 0, onChange }: { items: string[]; on?: number; onChange?: (i: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 8, paddingRight: 16 }} style={{ marginRight: -16 }}>
      {items.map((t, i) => <Pill key={t} label={t} on={i === on} onPress={() => onChange?.(i)} />)}
    </ScrollView>
  );
}
export function Tabs({ items, on = 0, onChange }: { items: string[]; on?: number; onChange?: (i: number) => void }) {
  return (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line }}>
      {items.map((t, i) => (
        <Pressable key={t} onPress={() => onChange?.(i)} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: i === on ? C.txt : "transparent", marginBottom: -1 }}>
          <Text style={{ fontFamily: inter(i === on ? 700 : 500), fontSize: 14, color: i === on ? C.txt : C.mut }}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Seg({ items, on = 0, onChange }: { items: string[]; on?: number; onChange?: (i: number) => void }) {
  return (
    <View style={{ flexDirection: "row", padding: 3, borderRadius: 14, backgroundColor: C.surf }}>
      {items.map((t, i) => (
        <Pressable key={t} onPress={() => onChange?.(i)} style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 11, backgroundColor: i === on ? C.txt : "transparent" }}>
          <Text style={{ fontFamily: inter(i === on ? 700 : 500), fontSize: 13, color: i === on ? C.bg : C.mut }}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Toggle({ on, onChange }: { on: boolean; onChange?: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange?.(!on)} style={{ width: 48, height: 29, borderRadius: 15, backgroundColor: on ? C.accent : "rgba(255,255,255,0.14)" }}>
      <View style={{ position: "absolute", top: 2, [on ? "right" : "left"]: 2, width: 25, height: 25, borderRadius: 13, backgroundColor: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" } as any} />
    </Pressable>
  );
}

/** Avatar initiales avec anneau accent (maquettes : avatar(ini, size, ring)) */
export function Avatar({ ini, size = 40, ring = false, style }: { ini: string; size?: number; ring?: boolean; style?: ViewStyle }) {
  const inner = (
    <View style={{ flex: 1, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: "#272B42", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
      <Text style={{ fontFamily: man(700), fontSize: Math.floor(size / 3), color: C.txt }}>{ini}</Text>
    </View>
  );
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, padding: ring ? 2 : 0, backgroundColor: ring ? C.accent : "transparent", boxShadow: ring ? `0 0 10px ${accentA(0.35)}` : undefined } as any, style]}>
      {inner}
    </View>
  );
}

/** Logo de discipline (image fournie) dans sa tuile */
export function Logo({ name, size = 56, on = true, badge = true }: { name: string; size?: number; on?: boolean; badge?: boolean }) {
  const img = <Image source={IMG[("logo-" + name) as ImgName]} style={{ width: size * 0.9, height: size * 0.9, opacity: on ? 1 : 0.55 }} resizeMode="contain" />;
  if (!badge) return img;
  return (
    <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), alignItems: "center", justifyContent: "center",
      backgroundColor: on ? accentA(0.22) : "#262A40", borderWidth: 1, borderColor: on ? accentA(0.55) : "rgba(255,255,255,0.08)",
      boxShadow: on ? `0 8px 20px ${accentA(0.3)}` : "0 4px 12px rgba(0,0,0,0.35)" } as any}>
      {img}
    </View>
  );
}

/** Icône chromée du lot "actions" */
export const AIco = ({ name, size = 24 }: { name: string; size?: number }) => (
  <Image source={IMG[("ico-" + name) as ImgName]} style={{ width: size, height: size }} resizeMode="contain" />
);
export const Img = ({ name, size, w, h, style }: { name: ImgName; size?: number; w?: number; h?: number; style?: any }) => (
  <Image source={IMG[name]} style={[{ width: w ?? size, height: h ?? size }, style]} resizeMode="contain" />
);

export const styles = StyleSheet.create({});
