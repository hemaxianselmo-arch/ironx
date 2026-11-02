import React from "react";
import { View, Text, ScrollView, ViewStyle, Image, ImageSourcePropType, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, PAD, NAV_H, inter, man, accentA } from "../theme/tokens";
import { IMG, ImgName } from "../theme/images";
import { Circ } from "./Controls";
import { IconName } from "./Icon";

/** Dégradé radial "hero" en haut de page (page(hero=True)) */
function Hero() {
  return (
    <Svg width="100%" height={380} style={StyleSheet.absoluteFill as any} pointerEvents="none">
      <Defs>
        <RadialGradient id="hero" cx="50%" cy="-5%" rx="90%" ry="60%" gradientUnits="objectBoundingBox">
          <Stop offset="0" stopColor={C.accent} stopOpacity={1} />
          <Stop offset="0.35" stopColor={C.accent} stopOpacity={0.45} />
          <Stop offset="0.65" stopColor={C.accent} stopOpacity={0.08} />
          <Stop offset="1" stopColor={C.bg} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="380" fill="url(#hero)" />
    </Svg>
  );
}

/** Conteneur d'écran : fond, dégradé hero, colonne à gap 14, marge 16 */
export function Page({ children, hero = false, pad = true, scroll = true, withNav = false, style }: {
  children: React.ReactNode; hero?: boolean; pad?: boolean; scroll?: boolean; withNav?: boolean; style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const col: ViewStyle = { gap: 14, paddingHorizontal: pad ? PAD : 0, paddingTop: pad ? PAD + insets.top : 0, paddingBottom: (withNav ? NAV_H : 0) + 24 + Math.max(insets.bottom, 12) };
  return (
    <View style={[{ flex: 1, backgroundColor: C.bg }, style]}>
      {hero ? <Hero /> : null}
      {scroll ? (
        <ScrollView contentContainerStyle={[col, { flexGrow: 1 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      ) : (
        <View style={[col, { flex: 1 }]}>{children}</View>
      )}
    </View>
  );
}

/** Barre de titre : retour, titre + sous-titre, actions à droite (top()) */
export function Top({ title, sub, left, right, onBack }: { title?: string; sub?: string; left?: React.ReactNode; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 40 }}>
      {left ?? <Circ icon="back" size={38} onPress={onBack} />}
      <View style={{ flex: 1, gap: 1 }}>
        {title ? <Text style={{ fontFamily: man(700), fontSize: 20, letterSpacing: -0.4, color: C.txt, lineHeight: 24 }}>{title}</Text> : null}
        {sub ? <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}
export const Actions = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: "row", gap: 8 }}>{children}</View>;

/** Surface plate (surf()) */
export const Surf = ({ children, pad = 16, r = 22, style }: { children: React.ReactNode; pad?: number; r?: number; style?: ViewStyle }) => (
  <View style={[{ borderRadius: r, padding: pad, backgroundColor: C.surf, gap: 10 }, style]}>{children}</View>
);
export const Divider = () => <View style={{ height: 1, backgroundColor: C.line, marginVertical: 2 }} />;
export const Row = ({ children, style, gap = 12 }: { children: React.ReactNode; style?: ViewStyle; gap?: number }) => (
  <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>
);
export const Between = ({ children, style, align = "center" }: { children: React.ReactNode; style?: ViewStyle; align?: "center" | "flex-end" | "flex-start" }) => (
  <View style={[{ flexDirection: "row", alignItems: align, justifyContent: "space-between" }, style]}>{children}</View>
);
export const Col = ({ children, style, gap = 2 }: { children: React.ReactNode; style?: ViewStyle; gap?: number }) => (
  <View style={[{ gap }, style]}>{children}</View>
);

/** Ligne de liste à plat (frow) */
export function FRow({ left, text, right, sub, onPress }: { left?: React.ReactNode; text: React.ReactNode; right?: React.ReactNode; sub?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 }}>
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 14, lineHeight: 19, color: C.txt }}>{text}</Text>
        {sub ? <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{sub}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}
/** Couple étiquette / valeur (kv) */
export const KV = ({ k, v, strong = false, align = "flex-start" }: { k: string; v: string; strong?: boolean; align?: "flex-start" | "flex-end" | "center" }) => (
  <View style={{ gap: 2, alignItems: align }}>
    <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{k}</Text>
    <Text style={{ fontFamily: man(700), fontSize: strong ? 20 : 17, letterSpacing: -0.3, color: C.txt }}>{v}</Text>
  </View>
);

/** Zone photo arrondie avec overlays (media()) */
export function Media({ photo, h = 200, w, r = 20, full = false, pos = "center", children, style }: {
  photo: ImgName; h?: number; w?: number; r?: number; full?: boolean; pos?: "center" | "top" | "bottom"; children?: React.ReactNode; style?: ViewStyle;
}) {
  return (
    <View style={[{ height: h, width: w, borderRadius: full ? 0 : r, overflow: "hidden", backgroundColor: "#1B1E31", marginHorizontal: full ? -PAD : 0 }, style]}>
      <Image source={IMG[photo] as ImageSourcePropType} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      {children}
    </View>
  );
}
/** Voile dégradé bas (shade()) ou haut */
export const Shade = ({ top = false }: { top?: boolean }) => (
  <LinearGradient
    colors={top ? ["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"] : ["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]}
    style={top ? { position: "absolute", left: 0, right: 0, top: 0, height: "40%" } : { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" }}
  />
);
/** Overlay positionné (ov()) */
export function Ov({ x = 14, y = 12, anchor = "lb", children, style }: { x?: number; y?: number; anchor?: "lt" | "rt" | "lb" | "rb"; children: React.ReactNode; style?: ViewStyle }) {
  const pos: Record<string, any> = { position: "absolute", gap: 6 };
  if (anchor.includes("l")) pos.left = x; else pos.right = x;
  if (anchor.includes("t")) pos.top = y; else pos.bottom = y;
  return <View style={[pos, style]}>{children}</View>;
}
export const Play = ({ size = 44 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" }}>
    <Text style={{ color: "#fff" }}>{/* triangle */}</Text>
    <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.3, borderTopWidth: size * 0.18, borderBottomWidth: size * 0.18, borderLeftColor: "#fff", borderTopColor: "transparent", borderBottomColor: "transparent", marginLeft: size * 0.08 }} />
  </View>
);
export const OvText = ({ children, size = 12, dim = 0.8, w = 400 }: { children: React.ReactNode; size?: number; dim?: number; w?: 400 | 600 }) => (
  <Text style={{ fontFamily: inter(w), fontSize: size, color: `rgba(255,255,255,${dim})`, lineHeight: size * 1.35 }}>{children}</Text>
);
export const OvTitle = ({ children, size = 22 }: { children: React.ReactNode; size?: number }) => (
  <Text style={{ fontFamily: man(700), fontSize: size, letterSpacing: -0.4, color: "#fff", lineHeight: size * 1.15 }}>{children}</Text>
);
