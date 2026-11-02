import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Circ, Media, Shade, Ov, OvText, H2, FRow, B, Sub, Pills } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume, setsDone, repsDone, fmtT, fmtVol, fmtKg, exoName, Session } from "../../store/workout";
import { e1rm } from "../../data/seed";

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const dstr = (s: Session) => { const d = new Date(s.startedAt); return `${d.getDate()} ${MOIS[d.getMonth()]}`; };
const avgRpe = (s: Session) => { const r = s.exos.flatMap((e) => e.sets.filter((x) => x.done && x.rpe).map((x) => x.rpe!)); return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0; };
/** S22 · Comparer deux séances (par défaut : la dernière et la précédente du même nom) */
export default function Comparer() {
  const { id } = useLocalSearchParams<{ id?: string }>(); const { history } = useWorkout();
  const a0 = history.find((s) => s.id === id) ?? history[0];
  const sameName = history.filter((s) => s.name === a0?.name && s.id !== a0?.id);
  const [bi, setBi] = useState(0); const b = sameName[bi] ?? history.find((s) => s.id !== a0?.id);
  if (!a0 || !b) return <Page><Top title="Comparer" onBack={() => router.back()} /><Sub>Il faut au moins deux séances enregistrées pour comparer. Termine une deuxième séance et reviens ici.</Sub></Page>;
  const a = a0;
  const D = (va: number, ba: number, fmt: (v: number) => string, pct = false, invert = false) => { const d = va - ba; const good = invert ? d <= 0 : d >= 0; const txt = pct && ba ? `${d >= 0 ? "+" : "−"}${Math.abs(Math.round((d / ba) * 100))} %` : `${d >= 0 ? "+" : "−"}${fmt(Math.abs(d))}`; return <Text style={{ fontFamily: inter(700), color: d === 0 ? C.mut : good ? C.green : C.red }}>{d === 0 ? "=" : txt}</Text>; };
  const rows: [string, number, number, (v: number) => string, boolean, boolean][] = [
    ["Volume", volume(a), volume(b), fmtVol, true, false], ["Séries", setsDone(a), setsDone(b), String, false, false], ["Reps", repsDone(a), repsDone(b), String, false, false],
    ["Durée", (a.endedAt ?? a.startedAt) - a.startedAt, (b.endedAt ?? b.startedAt) - b.startedAt, (v) => fmtT(v), false, true], ["RPE moyen", avgRpe(a), avgRpe(b), (v) => v.toFixed(1).replace(".", ","), false, false]];
  const exos = [...new Set([...a.exos, ...b.exos].map((e) => e.exoId))].map((id) => {
    const va = a.exos.filter((e) => e.exoId === id).flatMap((e) => e.sets.filter((x) => x.done)); const vb = b.exos.filter((e) => e.exoId === id).flatMap((e) => e.sets.filter((x) => x.done));
    const vol = (s: typeof va) => s.reduce((x, y) => x + y.kg * y.reps, 0); const best = (s: typeof va) => s.reduce((m, y) => (e1rm(y.kg, y.reps) > e1rm(m.kg, m.reps) ? y : m), s[0]);
    return { id, va, vb, dv: vol(va) - vol(vb), ba: best(va), bb: best(vb) };
  }).filter((x) => x.va.length || x.vb.length);
  return (
    <Page>
      <Top title="Comparer" sub={`${a.name} · ${dstr(a)} vs ${dstr(b)}`} right={<Circ icon="share" size={38} />} onBack={() => router.back()} />
      {sameName.length > 1 ? <Pills items={sameName.map((s) => dstr(s))} on={bi} onChange={setBi} /> : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[a, b].map((s, i) => (
          <View key={i} style={{ flex: 1 }}><Media photo={s.photo as any} h={90} r={16}><Shade /><Ov x={10} y={8} anchor="lb"><OvText>{dstr(s)}</OvText><Text style={{ fontFamily: inter(700), fontSize: 14, color: "#fff" }}>{s.name} · {fmtT((s.endedAt ?? s.startedAt) - s.startedAt)}</Text></Ov></Media></View>
        ))}
      </View>
      {rows.map(([k, va, vb, fmt, pct, inv]) => (
        <View key={k} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Text style={{ flex: 1, fontFamily: man(700), fontSize: 16, color: C.txt }}>{fmt(va)}</Text>
          <View style={{ flex: 1, alignItems: "center" }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{k}</Text>{D(va, vb, fmt, pct, inv)}</View>
          <Text style={{ flex: 1, textAlign: "right", fontFamily: man(700), fontSize: 16, color: C.mut }}>{fmt(vb)}</Text>
        </View>
      ))}
      <H2>Par exercice</H2>
      {exos.map((x) => (
        <FRow key={x.id} text={<B>{exoName(x.id)}</B>} right={x.va.length && x.vb.length ? D(x.dv, 0, fmtVol) : <Text style={{ fontFamily: inter(600), fontSize: 12, color: C.mut }}>{x.va.length ? "nouveau" : "absent"}</Text>}
          sub={`${x.ba ? `${fmtKg(x.ba.kg)}×${x.ba.reps}` : "—"} vs ${x.bb ? `${fmtKg(x.bb.kg)}×${x.bb.reps}` : "—"} · ${fmtVol(x.va.reduce((s, y) => s + y.kg * y.reps, 0))} vs ${fmtVol(x.vb.reduce((s, y) => s + y.kg * y.reps, 0))}`} />
      ))}
    </Page>
  );
}
