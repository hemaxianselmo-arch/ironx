// Composants partagés du module Performances — lot A (écrans force)
import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import { C, PAD, inter, man } from "../theme/tokens";
import { Icon, IconName } from "./Icon";
import { Btn } from "./Controls";

export const PERFA_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const perfaDate = (t?: number) => { if (!t) return "—"; const d = new Date(t); return `${d.getDate()} ${PERFA_MOIS[d.getMonth()]}`; };
export const perfaPct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v))} %`;
export const perfaKg = (v: number) => String(Math.round(v * 2) / 2).replace(".", ",");

/** État vide élégant : icône, titre, texte et bouton d'action */
export function PerfA_Empty({ icon = "stats", title, text, cta, onPress }: { icon?: IconName; title: string; text: string; cta?: string; onPress?: () => void }) {
  return (
    <View style={{ borderRadius: 22, padding: 22, backgroundColor: C.surf, alignItems: "center", gap: 10, marginTop: 8 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(235,27,63,0.14)", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={26} color={C.accent} w={2} />
      </View>
      <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt, textAlign: "center" }}>{title}</Text>
      <Text style={{ fontFamily: inter(400), fontSize: 13, lineHeight: 19, color: C.mut, textAlign: "center" }}>{text}</Text>
      {cta ? <Btn label={cta} size="md" full={false} onPress={onPress} style={{ marginTop: 4 }} /> : null}
    </View>
  );
}

/** En-tête « hero » rouge pleine largeur (R05) : à utiliser dans <Page pad={false}> */
export function PerfA_Hero({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={["#B4142F", "#7A0F22", C.bg]} locations={[0, 0.55, 1]} style={[{ paddingTop: PAD + insets.top, paddingHorizontal: PAD, paddingBottom: 18, gap: 14, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }, style]}>
      {children}
    </LinearGradient>
  );
}
/** Colonne de contenu sous le hero (marges standard) */
export const PerfA_Body = ({ children }: { children: React.ReactNode }) => <View style={{ paddingHorizontal: PAD, gap: 14 }}>{children}</View>;

/** Barre horizontale avec étiquette à gauche et valeur à droite (volume par muscle, équilibres) */
export function PerfA_BarRow({ label, pct, value, color = C.accent, labelW = 96, bold = false }: { label: string; pct: number; value: string; color?: string; labelW?: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 }}>
      <Text style={{ fontFamily: inter(bold ? 600 : 400), fontSize: 14, color: C.txt, width: labelW }} numberOfLines={1}>{label}</Text>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <View style={{ width: `${Math.max(2, Math.min(100, pct))}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
      </View>
      <Text style={{ fontFamily: man(700), fontSize: 14, color: C.txt, minWidth: 52, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

/** Mini-courbe (sparkline) pour les listes « à améliorer » */
export function PerfA_Spark({ points, w = 80, h = 32, color = C.accent }: { points: number[]; w?: number; h?: number; color?: string }) {
  if (points.length < 2) return <View style={{ width: w, height: h }} />;
  const lo = Math.min(...points), hi = Math.max(...points), rng = hi - lo || 1;
  const pts = points.map((p, i) => [(i * (w - 6)) / (points.length - 1) + 3, h - 4 - ((p - lo) / rng) * (h - 8)] as const);
  const d = "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  const last = pts[pts.length - 1];
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs><SvgGrad id="spk" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity={0.35} /><Stop offset="1" stopColor={color} stopOpacity={0} /></SvgGrad></Defs>
      <Path d={`${d} L${last[0]} ${h} L${pts[0][0]} ${h} Z`} fill="url(#spk)" />
      <Path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={3} fill={color} />
    </Svg>
  );
}

/** Jauge à zones colorées avec marqueur (ACWR) */
export function PerfA_Gauge({ value, zones, min = 0.4, max = 1.9, w = 358 }: { value: number; zones: { to: number; color: string; label: string }[]; min?: number; max?: number; w?: number }) {
  const x = (v: number) => ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * w;
  let from = min;
  return (
    <View style={{ gap: 6 }}>
      <Svg width={w} height={18} viewBox={`0 0 ${w} 18`}>
        {zones.map((z, i) => { const x0 = x(from), x1 = x(z.to); from = z.to; return <Rect key={i} x={x0 + (i ? 1 : 0)} y={6} width={Math.max(0, x1 - x0 - (i ? 1 : 0))} height={6} rx={3} fill={z.color} />; })}
        <Rect x={x(value) - 2} y={1} width={4} height={16} rx={2} fill={C.txt} />
      </Svg>
      <View style={{ flexDirection: "row" }}>
        {zones.map((z, i) => <Text key={i} style={{ flex: 1, fontFamily: inter(400), fontSize: 10, color: C.mut, textAlign: "center" }}>{z.label}</Text>)}
      </View>
    </View>
  );
}

/** Ligne de conseil : icône ronde + titre + explication + action à droite */
export function PerfA_Advice({ icon = "bolt", color = C.accent, title, text, action, onAction }: { icon?: IconName; color?: string; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `${color}22`, alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={17} color={color} w={2.2} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(600), fontSize: 14, color: C.txt }}>{title}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, lineHeight: 16, color: C.mut }}>{text}</Text>
      </View>
      {action ? <Btn label={action} kind="secondary" size="sm" full={false} onPress={onAction} /> : null}
    </View>
  );
}

/** Carte raccourci (hub) : icône + titre + sous-titre + chevron */
export function PerfA_Shortcut({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: C.surf, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(235,27,63,0.14)", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={19} color={C.accent} w={2} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(600), fontSize: 14, color: C.txt }}>{title}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }} numberOfLines={1}>{sub}</Text>
      </View>
      <Icon name="chev" size={18} color={C.mut} />
    </Pressable>
  );
}

/** Étiquette d'état colorée (Plateau / Régresse / Progresse) */
export const PerfA_Tag = ({ label, color }: { label: string; color: string }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${color}22`, alignSelf: "flex-start" }}>
    <Text style={{ fontFamily: inter(600), fontSize: 11, color }}>{label}</Text>
  </View>
);
