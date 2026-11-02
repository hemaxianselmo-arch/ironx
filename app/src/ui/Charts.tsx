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

/** Plusieurs courbes normalisées (tendances) — series: [{color, points}] */
export function MultiLine({ series, w = 358, h = 120, labels }: { series: { color: string; points: number[] }[]; w?: number; h?: number; labels?: string[] }) {
  const all = series.flatMap((s) => s.points); const lo = Math.min(...all), hi = Math.max(...all), rng = hi - lo || 1;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {series.map((s, k) => { const n = s.points.length; if (n < 2) return null; const pts = s.points.map((p, i) => [(i * (w - 8)) / (n - 1) + 4, h - 16 - ((p - lo) / rng) * (h - 28)]); const d = "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L"); const l = pts[pts.length - 1];
        return <React.Fragment key={k}><Path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /><Circle cx={l[0]} cy={l[1]} r={4} fill={s.color} stroke={C.bg} strokeWidth={2} /></React.Fragment>; })}
      {labels ? labels.map((t, i) => <SvgText key={i} x={4 + (i * (w - 8)) / Math.max(1, labels.length - 1)} y={h - 3} fontSize={10} fill={C.mut} textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"} fontFamily={inter(400)}>{t}</SvgText>) : null}
    </Svg>
  );
}

/** Radar (toile) — axes: labels, series: valeurs 0..1 par axe */
export function Radar({ axes, series, size = 260 }: { axes: string[]; series: { color: string; values: number[]; fill?: boolean }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 34, n = axes.length;
  const pt = (i: number, v: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v]; };
  const ring = (v: number) => "M" + Array.from({ length: n }, (_, i) => pt(i, v).map((x) => x.toFixed(1)).join(" ")).join(" L") + " Z";
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((v) => <Path key={v} d={ring(v)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />)}
      {axes.map((_, i) => { const [x, y] = pt(i, 1); return <Path key={i} d={`M${cx} ${cy} L${x} ${y}`} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />; })}
      {series.map((s, k) => { const d = "M" + s.values.map((v, i) => pt(i, Math.max(0, Math.min(1, v))).map((x) => x.toFixed(1)).join(" ")).join(" L") + " Z"; return <React.Fragment key={k}><Path d={d} fill={s.fill === false ? "none" : s.color} fillOpacity={0.18} stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" />{s.values.map((v, i) => { const [x, y] = pt(i, Math.max(0, Math.min(1, v))); return <Circle key={i} cx={x} cy={y} r={3.5} fill={s.color} />; })}</React.Fragment>; })}
      {axes.map((a, i) => { const [x, y] = pt(i, 1.17); return <SvgText key={a} x={x} y={y + 4} fontSize={10.5} fill={C.soft} textAnchor="middle" fontFamily={inter(500)}>{a}</SvgText>; })}
    </Svg>
  );
}

/** Carte de chaleur (régularité) : une case par jour, colonnes = semaines */
export function Heatmap({ days, weeks = 26, w = 358 }: { days: Record<string, number>; weeks?: number; w?: number }) {
  const cell = Math.floor((w - (weeks - 1) * 2) / weeks); const h = 7 * (cell + 2);
  const today = new Date(); today.setHours(0, 0, 0, 0); const start = new Date(today); start.setDate(start.getDate() - ((today.getDay() + 6) % 7) - (weeks - 1) * 7);
  const k = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const mx = Math.max(1, ...Object.values(days));
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {Array.from({ length: weeks }, (_, wi) => Array.from({ length: 7 }, (_, di) => { const d = new Date(start); d.setDate(d.getDate() + wi * 7 + di); if (d > today) return null; const v = days[k(d)] ?? 0; const op = v ? 0.35 + 0.65 * Math.min(1, v / mx) : 0; return <Rect key={`${wi}-${di}`} x={wi * (cell + 2)} y={di * (cell + 2)} width={cell} height={cell} rx={2} fill={v ? C.accent : "rgba(255,255,255,0.07)"} fillOpacity={v ? op : 1} />; }))}
    </Svg>
  );
}

/** Barre de niveau (standards) : marqueur sur une échelle de paliers */
export function LevelBar({ pct, labels, w = 358 }: { pct: number; labels: string[]; w?: number }) {
  const n = labels.length;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "visible" }}>
        <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
        <View style={{ position: "absolute", left: `${Math.max(0, Math.min(100, pct))}%`, top: -4, marginLeft: -1.5, width: 3, height: 14, borderRadius: 2, backgroundColor: C.txt }} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>{labels.map((l, i) => <Text key={l} style={{ fontFamily: inter(400), fontSize: 9.5, color: C.mut, width: w / n, textAlign: i === 0 ? "left" : i === n - 1 ? "right" : "center" }}>{l}</Text>)}</View>
    </View>
  );
}
