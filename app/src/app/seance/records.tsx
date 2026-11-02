import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Label, Big, Sub, AreaChart, H2, Media, Mono } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useWorkout, allRecords, fmtKg, exoHistory } from "../../store/workout";
import { byId, e1rm } from "../../data/seed";

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
/** Records personnels (R01) : total SBD estimé, courbe, liste par exercice */
export default function Records() {
  const { history } = useWorkout(); const [f, setF] = useState(0);
  const recs = allRecords().sort((a, b) => e1rm(b.best.kg, b.best.reps) - e1rm(a.best.kg, a.best.reps));
  const sbd = ["squat", "bench", "deadlift"].map((id) => recs.find((r) => r.exoId === id)).map((r) => (r ? e1rm(r.best.kg, r.best.reps) : 0));
  const total = sbd.reduce((a, b) => a + b, 0);
  const sessionsTotals = history.slice().reverse().map((s) => { const b = (id: string) => Math.max(0, ...s.exos.filter((e) => e.exoId === id).flatMap((e) => e.sets.filter((x) => x.done).map((x) => e1rm(x.kg, x.reps)))); return b("squat") + b("bench") + b("deadlift"); }).filter((v) => v > 0);
  const curve = sessionsTotals;
  const list = f === 0 ? recs : f === 1 ? recs.filter((r) => ["squat", "bench", "deadlift", "ohp"].includes(r.exoId)) : recs.filter((r) => !r.best.kg);
  return (
    <Page>
      <Top title="Records" sub={`${recs.length} exercices avec un record`} right={<Circ icon="share" size={38} />} onBack={() => router.back()} />
      <Pills items={["Tous", "Force (SBD)", "Poids de corps"]} on={f} onChange={setF} />
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}><Label>total SBD estimé</Label><Big v={fmtKg(Math.round(total))} unit="kg" size={52} /><Sub>squat {fmtKg(sbd[0])} · couché {fmtKg(sbd[1])} · soulevé {fmtKg(sbd[2])}</Sub></View>
        <Image source={IMG["record"]} style={{ width: 64, height: 64 }} resizeMode="contain" />
      </View>
      {curve.length >= 2 ? <AreaChart points={curve} h={110} /> : <Sub>La courbe du total apparaît après deux séances de force (squat, couché ou soulevé).</Sub>}
      <H2>Par exercice</H2>
      {list.map((r) => { const e = byId(r.exoId); if (!e) return null; const d = r.date ? new Date(r.date) : null; return (
        <View key={r.exoId} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 }} onTouchEnd={() => router.push({ pathname: "/seance/progression", params: { id: r.exoId } })}>
          <Media photo={e.photo as any} h={48} w={48} r={12} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{e.name}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{r.best.kg ? `1RM est. ${fmtKg(e1rm(r.best.kg, r.best.reps))} kg` : "poids de corps"}{d ? ` · ${d.getDate()} ${MOIS[d.getMonth()]}` : " · avant IRONX"} · {exoHistory(r.exoId).length} séances</Text>
          </View>
          <Mono size={16}>{r.best.kg ? `${fmtKg(r.best.kg)} × ${r.best.reps}` : `${r.best.reps} reps`}</Mono>
        </View>); })}
      {!list.length ? <Sub>Aucun record dans cette catégorie pour l'instant.</Sub> : null}
    </Page>
  );
}
