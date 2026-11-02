import React from "react";
import { View, Text } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Circle, Rect, Text as SvgText } from "react-native-svg";
import { C, inter, man } from "../theme/tokens";

/** Courbe avec aire (area_chart) */
export function AreaChart({ points, w = 358, h = 110, color = C.accent }: { points: number[]; w?: number; h?: number; color?: string }) {
  const n = points.length, lo = Math.min(...points), hi = Math.max(...points), rng = hi - lo || 1;
  const pts = points.map((p, i) => [(i * w) / (n - 1), h - 10 - ((p - lo) / rng) * (h - 24)] as const);
  const path = "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  const area = `${path} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#ag)" />
      <Path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={5} fill={color} stroke={C.bg} strokeWidth={3} />
    </Svg>
  );
}

/** Barres (bars) — la dernière (ou hl) en accent */
export function Bars({ vals, w = 358, h = 90, labels, hl = -1 }: { vals: number[]; w?: number; h?: number; labels?: string[]; hl?: number }) {
  const n = vals.length, mx = Math.max(...vals) || 1, bw = w / n;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {vals.map((v, i) => {
        const bh = Math.max(6, (v / mx) * (h - 22));
        const on = i === hl || (hl === -1 && i === n - 1);
        return (
          <React.Fragment key={i}>
            <Rect x={i * bw + bw * 0.2} y={h - 18 - bh} width={bw * 0.6} height={bh} rx={5} fill={on ? C.accent : "rgba(255,255,255,0.14)"} />
            {labels ? <SvgText x={i * bw + bw / 2} y={h - 3} fontSize={10} fill={C.mut} textAnchor="middle" fontFamily={inter(400)}>{labels[i]}</SvgText> : null}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

/** Anneau de progression (ring) */
export function Ring({ pct, size = 84, thick = 9, color = C.accent, children }: { pct: number; size?: number; thick?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - thick) / 2, circ = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={thick} />
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thick} strokeLinecap="round" strokeDasharray={`${(circ * pct) / 100} ${circ}`} />
      </Svg>
      <View style={{ alignItems: "center" }}>{children}</View>
    </View>
  );
}

/** Barre de macro (macro) */
export function Macro({ label, v, g, color }: { label: string; v: number; g: number; color: string }) {
  return (
    <View style={{ flex: 1, gap: 5 }}>
      <View style={{ gap: 1 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.soft }}>{label}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}><Text style={{ fontFamily: inter(700), color: C.txt }}>{v}</Text> / {g} g</Text>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <View style={{ width: `${Math.min(100, Math.round((v / g) * 100))}%`, height: 5, borderRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
}
export const Progress = ({ pct, color = C.accent, h = 6 }: { pct: number; color?: string; h?: number }) => (
  <View style={{ height: h, borderRadius: h / 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
    <View style={{ width: `${pct}%`, height: h, borderRadius: h / 2, backgroundColor: color }} />
  </View>
);
export const Mono = ({ children, size = 15, color = C.txt }: { children: React.ReactNode; size?: number; color?: string }) => (
  <Text style={{ fontFamily: man(700), fontSize: size, color, letterSpacing: -0.3 }}>{children}</Text>
);
