import React, { useMemo, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Sub, MultiLine, PerfA_Empty, PERFA_MOIS, perfaKg } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, fmtVol } from "../../store/workout";
import { e1rm } from "../../data/seed";

const MOVES = [{ id: "bench", name: "Couché", color: C.accent }, { id: "squat", name: "Squat", color: C.blue }, { id: "deadlift", name: "Soulevé", color: C.orange }];
const METRICS = ["1RM", "Volume", "Fréquence", "Durée", "RPE"];
const WEEKS = 12;
const weekStart = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };

/** R06 · Tendances : couché / squat / soulevé sur 12 semaines, par métrique */
export default function PerfTendances() {
  const { history } = useWorkout(); const [m, setM] = useState(0);
  const w0 = weekStart(Date.now()) - (WEEKS - 1) * 7 * 86400e3;
  const data = useMemo(() => MOVES.map((mv) => {
    // valeurs brutes par semaine (undefined = pas de séance avec ce mouvement)
    const weeks: (number | undefined)[] = Array.from({ length: WEEKS }, () => undefined);
    const acc: { e1: number; vol: number; n: number; dur: number; rpe: number[]; }[] = Array.from({ length: WEEKS }, () => ({ e1: 0, vol: 0, n: 0, dur: 0, rpe: [] }));
    for (const s of history) { const wi = Math.floor((weekStart(s.startedAt) - w0) / (7 * 86400e3)); if (wi < 0 || wi >= WEEKS) continue;
      const sets = s.exos.filter((e) => e.exoId === mv.id).flatMap((e) => e.sets.filter((x) => x.done && x.kg > 0 && x.reps > 0)); if (!sets.length) continue;
      const a = acc[wi]; a.n++; a.e1 = Math.max(a.e1, ...sets.map((x) => e1rm(x.kg, x.reps))); a.vol += sets.reduce((b, x) => b + x.kg * x.reps, 0); a.dur += s.endedAt ? (s.endedAt - s.startedAt) / 60000 : 0; a.rpe.push(...sets.map((x) => x.rpe).filter((x): x is number => x != null)); }
    acc.forEach((a, i) => { if (!a.n) return; weeks[i] = [a.e1, a.vol, a.n, a.dur / a.n, a.rpe.length ? a.rpe.reduce((x, y) => x + y, 0) / a.rpe.length : undefined][m]; });
    const known = weeks.filter((v): v is number => v != null);
    // courbe : les semaines sans séance reprennent la valeur précédente (1RM) ou valent 0 (volume, fréquence)
    let last: number | undefined; const points: number[] = []; let started = false;
    weeks.forEach((v) => { if (v != null) { last = v; started = true; } if (!started) return; points.push(m === 0 || m === 4 || m === 3 ? (v ?? last ?? 0) : (v ?? 0)); });
    return { ...mv, points, first: known[0], lastV: known[known.length - 1], n: known.length };
  }).filter((d) => d.n > 0), [history, m, w0]);
  const series = data.filter((d) => d.points.length >= 2);
  // les séries doivent partager le même axe : on complète à gauche avec la première valeur
  const len = Math.max(0, ...series.map((s) => s.points.length));
  const aligned = series.map((s) => ({ color: s.color, points: [...Array.from({ length: len - s.points.length }, () => s.points[0]), ...s.points] }));
  const labels = [0, Math.floor((WEEKS - 1) / 2), WEEKS - 1].map((i) => PERFA_MOIS[new Date(w0 + i * 7 * 86400e3).getMonth()]);
  const fmt = (v: number) => (m === 0 ? `${perfaKg(v)} kg` : m === 1 ? fmtVol(v) : m === 2 ? `${v} / sem.` : m === 3 ? `${Math.round(v)} min` : v.toFixed(1).replace(".", ","));
  const pct = (a?: number, b?: number) => (a && b ? ((b - a) / a) * 100 : 0);
  const best = data.length ? data.reduce((a, b) => (pct(b.first, b.lastV) > pct(a.first, a.lastV) ? b : a)) : null;
  const allUp = data.length > 1 && data.every((d) => pct(d.first, d.lastV) > 0);

  return (
    <Page>
      <Top title="Tendances" sub="12 dernières semaines" right={<Circ icon="filter" size={38} />} onBack={() => router.back()} />
      <Pills items={METRICS} on={m} onChange={setM} />
      {!data.length ? <PerfA_Empty icon="stats" title="Pas encore de tendance" text="Fais des séances avec le développé couché, le squat ou le soulevé de terre : leurs courbes apparaîtront ici sur 12 semaines." cta="Démarrer une séance" onPress={() => router.push("/seance" as any)} /> : (
        <>
          {aligned.length ? <MultiLine series={aligned} labels={labels} h={150} /> : <Sub>Il faut au moins deux semaines avec un mouvement pour tracer sa courbe.</Sub>}
          <View style={{ flexDirection: "row", gap: 14 }}>
            {data.map((d) => <View key={d.id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: d.color }} /><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{d.name}</Text></View>)}
          </View>
          <View>
            {data.map((d) => { const p = pct(d.first, d.lastV); return (
              <View key={d.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt, flex: 1 }}>{d.name}</Text>
                <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{d.n > 1 ? `${fmt(d.first!)} → ${fmt(d.lastV!)}` : fmt(d.lastV!)}</Text>
                <Text style={{ fontFamily: man(700), fontSize: 14, color: d.n < 2 || p === 0 ? C.mut : p > 0 ? C.green : C.red, width: 56, textAlign: "right" }}>{d.n < 2 ? "—" : `${p > 0 ? "+" : p < 0 ? "−" : ""}${Math.abs(Math.round(p))} %`}</Text>
              </View>); })}
          </View>
          <Sub>
            {best && best.n > 1 && pct(best.first, best.lastV) > 0
              ? `${allUp ? "Progression régulière sur les " + data.length + " mouvements. " : ""}Le ${best.name.toLowerCase()} progresse le plus vite (${perfaKg(Math.abs(pct(best.first, best.lastV)))} % sur la période).`
              : data.some((d) => d.n > 1) ? "Pas de progression nette sur la période : vérifie l'écran « À améliorer »." : "Encore une semaine ou deux et l'analyse automatique apparaît."}
          </Sub>
        </>
      )}
    </Page>
  );
}
