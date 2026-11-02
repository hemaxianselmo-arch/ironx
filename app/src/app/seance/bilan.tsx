import React from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Label, Big, Bars, Figure, H2, FRow, B, Sub } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useWorkout, volume, fmtVol, fmtKg, exoName } from "../../store/workout";
import { byId } from "../../data/seed";
import { Highlight } from "../../ui/Figure";

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
/** S23 · Bilan hebdomadaire calculé depuis l'historique */
export default function Bilan() {
  const { history } = useWorkout();
  const now = new Date(); const dow = (now.getDay() + 6) % 7; const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - dow);
  const wk = history.filter((s) => s.startedAt >= monday.getTime()); const prev = history.filter((s) => s.startedAt < monday.getTime() && s.startedAt >= monday.getTime() - 7 * 86400e3);
  const vol = wk.reduce((a, s) => a + volume(s), 0); const pv = prev.reduce((a, s) => a + volume(s), 0);
  const byDay = Array.from({ length: 7 }, (_, i) => wk.filter((s) => (new Date(s.startedAt).getDay() + 6) % 7 === i).reduce((a, s) => a + volume(s), 0) / 1000);
  const front: Highlight = {}, back: Highlight = {}; const setsByGroup: Record<string, number> = {};
  for (const s of wk) for (const e of s.exos) { const d = byId(e.exoId); if (!d) continue; const n = e.sets.filter((x) => x.done).length; if (!n) continue; setsByGroup[d.primary] = (setsByGroup[d.primary] ?? 0) + n;
    for (const [g, v] of Object.entries(d.view === "front" ? d.hl : (d.hlBack ?? {}))) front[g] = Math.min(1, (front[g] ?? 0) + v * 0.4); for (const [g, v] of Object.entries(d.view === "back" ? d.hl : (d.hlBack ?? {}))) back[g] = Math.min(1, (back[g] ?? 0) + v * 0.4); }
  const groups = Object.entries(setsByGroup).sort((a, b) => b[1] - a[1]);
  const prs = wk.flatMap((s) => s.exos.flatMap((e) => e.sets.filter((x) => x.pr).map((x) => ({ s, e, x }))));
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const weekNo = Math.ceil((((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / 86400e3) + new Date(monday.getFullYear(), 0, 1).getDay() + 1) / 7);
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Semaine {weekNo}</Text><Circ icon="share" size={38} kind="glass" />
      </View>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Label>{monday.getDate()} {MOIS[monday.getMonth()]} → {sunday.getDate()} {MOIS[sunday.getMonth()]} · volume</Label>
        <Big v={Math.round(vol).toLocaleString("fr-FR")} unit="kg" size={54} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{pv ? <><Text style={{ fontFamily: inter(600), color: vol >= pv ? C.green : C.red }}>{vol >= pv ? "+" : "−"}{Math.abs(Math.round(((vol - pv) / pv) * 100))} %</Text> vs semaine passée · </> : null}{wk.length} séance{wk.length > 1 ? "s" : ""} · {prs.length} record{prs.length > 1 ? "s" : ""}</Text>
      </View>
      <Bars vals={byDay.map((v) => v || 0.001)} labels={["L", "M", "M", "J", "V", "S", "D"]} h={90} hl={byDay.indexOf(Math.max(...byDay))} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Figure view="front" hl={front} h={150} /><Figure view="back" hl={back} h={150} />
        <View style={{ flex: 1, gap: 6 }}>
          {groups.slice(0, 4).map(([g, n]) => <Text key={g} style={{ fontFamily: inter(400), fontSize: 12.5, color: C.txt }}><B>{g}</B> {n} série{n > 1 ? "s" : ""}</Text>)}
          {groups.length > 4 ? <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>{groups.slice(4).map(([g, n]) => `${g} ${n}`).join(" · ")}</Text> : null}
          {!groups.length ? <Sub>Aucune séance cette semaine.</Sub> : null}
        </View>
      </View>
      <H2>Records de la semaine</H2>
      {prs.length ? prs.map((p, i) => <FRow key={i} left={<Image source={IMG["record"]} style={{ width: 36, height: 36 }} resizeMode="contain" />} text={<><B>{exoName(p.e.exoId)}</B> {fmtKg(p.x.kg)} × {p.x.reps}</>} sub={new Date(p.s.startedAt).toLocaleDateString("fr-FR", { weekday: "long" })} />) : <Sub>Pas de record cette semaine.</Sub>}
    </Page>
  );
}
