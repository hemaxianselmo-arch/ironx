import React from "react";
import { Text, TextProps, View, StyleSheet } from "react-native";
import { C, inter, man } from "../theme/tokens";

type P = TextProps & { children?: React.ReactNode; color?: string };

/** Texte de base Inter (400) — équivalent du body des maquettes */
export function T({ style, color, ...p }: P & { size?: number; w?: 400 | 500 | 600 | 700 }) {
  const { size = 14, w = 400 } = p as any;
  return <Text {...p} style={[{ fontFamily: inter(w), fontSize: size, color: color ?? C.txt, lineHeight: size * 1.35 }, style]} />;
}
/** Texte Manrope gras (titres, chiffres) */
export function M({ style, color, ...p }: P & { size?: number; w?: 500 | 600 | 700 | 800; ls?: number }) {
  const { size = 16, w = 700, ls = -0.3 } = p as any;
  return <Text {...p} style={[{ fontFamily: man(w), fontSize: size, color: color ?? C.txt, letterSpacing: ls, lineHeight: size * 1.2 }, style]} />;
}

export const H1 = ({ children, size = 30, style }: { children: React.ReactNode; size?: number; style?: any }) => (
  <Text style={[{ fontFamily: man(700), fontSize: size, letterSpacing: -0.8, lineHeight: size * 1.1, color: C.txt }, style]}>{children}</Text>
);

export const H2 = ({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) => (
  <View style={s.h2}>
    <Text style={{ fontFamily: man(700), fontSize: 18, letterSpacing: -0.3, color: C.txt, lineHeight: 22 }}>{children}</Text>
    {action ? (
      <Text onPress={onAction} style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>{action}</Text>
    ) : null}
  </View>
);

export const Big = ({ v, unit, size = 56, color = C.txt }: { v: string; unit?: string; size?: number; color?: string }) => (
  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
    <Text style={{ fontFamily: man(700), fontSize: size, letterSpacing: -2.5, lineHeight: size, color }}>{v}</Text>
    {unit ? <Text style={{ fontFamily: inter(600), fontSize: Math.round(size * 0.32), color: C.mut }}>{unit}</Text> : null}
  </View>
);

export const Sub = ({ children, color = C.mut, style }: { children: React.ReactNode; color?: string; style?: any }) => (
  <Text style={[{ fontFamily: inter(400), fontSize: 13, lineHeight: 13 * 1.45, color }, style]}>{children}</Text>
);
export const Label = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <Text style={[{ fontFamily: inter(400), fontSize: 12, color: C.mut, lineHeight: 16 }, style]}>{children}</Text>
);
/** Span gras à l'intérieur d'un texte */
export const B = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <Text style={{ fontFamily: inter(700), color: color ?? C.txt }}>{children}</Text>
);

const s = StyleSheet.create({
  h2: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 6, paddingBottom: 2 },
});
