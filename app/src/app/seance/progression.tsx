import React, { useState } from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Circ, Pills, Pill, Big, Sub, AreaChart, Divider, KV, H2, FRow } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, exoHistory, heaviest, fmtKg, fmtVol } from "../../store/workout";
import { byId, e1rm, PREVIOUS_BEST } from "../../data/seed";

const MOIS = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
/** S13 · Progression d'un exercice : 1RM estimé, charge max, volume, reps — séance par séance */
export default function Progression() {
  const { id } = useLocalSearchParams<{ id: string }>(); useWorkout();
  const e = byId(id!); const [m, setM] = useState(0); const [range, setRange] = useState(1);
  if (!e) return <Page><Top onBack={() => router.back()} title="Progression" /></Page>;
  const hist = exoHistory(e.id).slice().reverse(); // chronologique
  const horizon = [30, 90, 365][range] * 86400e3; const h = hist.filter((x) => Date.now() - x.session.startedAt < horizon);
  const metric = (sets: { kg: number; reps: number }[]) => [Math.max(...sets.map((s) => e1rm(s.kg, s.reps))), Math.max(...sets.map((s) => s.kg)), sets.reduce((a, s) => a + s.kg * s.reps, 0), Math.max(...sets.map((s) => s.reps))][m];
  const seed = PREVIOUS_BEST[e.id] ? metric(PREVIOUS_BEST[e.id]) : null;
  const pts = [...(seed != null ? [seed] : []), ...h.map((x) => metric(x.sets))];
  const cur = pts[pts.length - 1] ?? 0; const first = pts[0] ?? cur; const delta = cur - first;
  const unit = ["kg", "kg", "kg", "reps"][m]; const best = heaviest(e.id);
  const fmtM = (v: number) => (m === 2 ? fmtVol(v) : m === 3 ? String(v) : fmtKg(Math.round(v * 2) / 2));
  return (
    <Page>
      <Top title={e.name} sub={`${e.primary} · ${e.equip} · ${hist.length} séances`} right={<Circ icon="share" size={38} />} onBack={() => router.back()} />
      <Pills items={["1RM estimé", "Charge max", "Volume", "Reps"]} on={m} onChange={setM} />
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}>
          <Big v={fmtM(cur)} unit={m === 2 ? "" : unit} size={52} />
          <Sub><Text style={{ fontFamily: inter(600), color: delta >= 0 ? C.green : C.red }}>{delta >= 0 ? "+" : "−"}{fmtM(Math.abs(delta))}{m === 2 ? "" : " " + unit}</Text> sur la période · {pts.length} point{pts.length > 1 ? "s" : ""}</Sub>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>{["1M", "3M", "1A"].map((r, i) => <Pill key={r} label={r} on={range === i} onPress={() => setRange(i)} />)}</View>
      </View>
      {pts.length >= 2 ? <AreaChart points={pts} h={130} /> : <Sub>Il faut au moins deux séances pour tracer la courbe. {pts.length === 1 ? "Une de plus et elle apparaît." : ""}</Sub>}
      <Divider />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Record" v={best ? `${fmtKg(best.kg)} × ${best.reps}` : "—"} /><KV k="Volume / séance" v={h.length ? fmtVol(h.reduce((a, x) => a + x.sets.reduce((b, s) => b + s.kg * s.reps, 0), 0) / h.length) : "—"} /><KV k="Fréquence" v={h.length ? `${(h.length / Math.max(1, [4, 13, 52][range])).toFixed(1).replace(".", ",")} / sem.` : "—"} /><KV k="Séries" v={String(h.reduce((a, x) => a + x.sets.length, 0))} />
      </View>
      <H2>Dernières séances</H2>
      {hist.slice().reverse().slice(0, 6).map((x, i) => { const d = new Date(x.session.startedAt); const pr = x.sets.some((s) => s.pr); return (
        <FRow key={i} left={<View style={{ width: 44, alignItems: "center" }}><Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{d.getDate()}</Text><Text style={{ fontFamily: inter(400), fontSize: 10, color: C.mut }}>{MOIS[d.getMonth()]}</Text></View>}
          text={<Text style={{ fontFamily: inter(700), color: C.txt }}>{x.sets.map((s) => `${fmtKg(s.kg)} × ${s.reps}`).join(" · ")}</Text>} right={pr ? <Text style={{ fontFamily: inter(700), fontSize: 12, color: C.green }}>PR</Text> : undefined}
          sub={`${x.session.name}${x.sets[0].rpe ? ` · RPE ${x.sets.map((s) => s.rpe ?? 0).reduce((a, b) => Math.max(a, b), 0)}` : ""} · ${fmtVol(x.sets.reduce((a, s) => a + s.kg * s.reps, 0))}`} onPress={() => router.push({ pathname: "/seance/detail", params: { id: x.session.id } })} />); })}
      {!hist.length ? <Sub>Pas encore d'historique pour cet exercice.</Sub> : null}
    </Page>
  );
}
