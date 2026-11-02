import React, { useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, LevelBar, H2, Sub, PerfA_Empty, PerfA_Advice, perfaKg } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, bestOf } from "../../store/workout";
import { useProfile } from "../../store/profile";
import { useActivities, bestStreet } from "../../store/activities";
import { byId, e1rm } from "../../data/seed";

const LEVELS = ["Débutant", "Novice", "Intermédiaire", "Avancé", "Élite"];
/** Seuils ratio 1RM / poids de corps [homme, femme] */
const STD: Record<string, [number[], number[]]> = {
  bench: [[0.5, 0.75, 1.0, 1.5, 2.0], [0.25, 0.5, 0.75, 1.0, 1.25]], squat: [[0.75, 1.25, 1.5, 2.25, 2.75], [0.5, 0.75, 1.0, 1.5, 2.0]],
  deadlift: [[1.0, 1.5, 2.0, 2.5, 3.0], [0.5, 1.0, 1.25, 1.75, 2.25]], ohp: [[0.35, 0.55, 0.8, 1.1, 1.4], [0.2, 0.35, 0.5, 0.7, 0.9]], "pullup-weighted": [[0, 0.25, 0.5, 0.8, 1.1], [0, 0.1, 0.25, 0.45, 0.65]],
};
const TABS = ["Barre", "Poids de corps", "Haltères"];
/** Position du marqueur (0..100) entre les paliers, interpolation linéaire */
function levelPct(ratio: number, t: number[]) {
  const pos = [10, 30, 50, 70, 90];
  if (ratio <= t[0]) return t[0] > 0 ? Math.max(0, (ratio / t[0]) * 10) : 10;
  for (let i = 0; i < 4; i++) if (ratio < t[i + 1]) return pos[i] + ((ratio - t[i]) / (t[i + 1] - t[i])) * 20;
  return Math.min(100, 90 + ((ratio - t[4]) / t[4]) * 10);
}
const levelName = (ratio: number, t: number[]) => { let n = "Sous débutant"; t.forEach((x, i) => { if (ratio >= x) n = LEVELS[i]; }); return n; };
const PUSH = new Set(["pecs", "delts", "triceps"]); const PULL = new Set(["lats", "traps", "rear_delts", "biceps"]);

/** R16 · Standards de force : niveau par mouvement, ratios poids de corps, équilibres */
export default function PerfStandards() {
  const { history } = useWorkout(); useActivities(); const p = useProfile(); const [tab, setTab] = useState(0);
  const sex = p.sexe === 1 ? 1 : 0; const bw = p.poids || 1;
  const rows = useMemo(() => {
    const lift = (id: string, note?: string) => { const b = bestOf(id); if (!b || !b.kg) return null; const v = e1rm(b.kg, b.reps); return { id, name: byId(id)?.name ?? id, value: v, ratio: v / bw, t: STD[id][sex], note, label: `${perfaKg(v)} kg` }; };
    if (tab === 0) return [lift("bench"), lift("squat"), lift("deadlift"), lift("ohp")];
    if (tab === 1) {
      const w = (move: string, exoId: string, name: string) => { const s = bestStreet(move)?.value; const b = bestOf(exoId); const v = s ?? (b?.kg ? b.kg : undefined); if (v == null) return null; return { id: exoId, name, value: v, ratio: v / bw, t: STD["pullup-weighted"][sex], note: move === "dips-w" ? "même barème que les tractions" : undefined, label: `+${perfaKg(v)} kg` }; };
      return [w("pullup-w", "pullup-weighted", "Tractions lestées"), w("dips-w", "dips", "Dips lestés")];
    }
    // haltères : barème approché = 40 % du standard barre par haltère
    const db = (id: string, ref: string) => { const b = bestOf(id); if (!b || !b.kg) return null; const v = e1rm(b.kg, b.reps); return { id, name: byId(id)?.name ?? id, value: v, ratio: v / bw, t: STD[ref][sex].map((x) => x * 0.4), note: "barème approché · par haltère", label: `${perfaKg(v)} kg` }; };
    return [db("db-press", "bench"), db("incline-db", "bench"), db("db-ohp", "ohp")];
  }, [tab, history, bw, sex]);
  const list = rows.filter((r): r is NonNullable<typeof r> => !!r);

  // équilibres
  const b = { bench: bestOf("bench"), squat: bestOf("squat"), deadlift: bestOf("deadlift") };
  const v = (x?: { kg: number; reps: number }) => (x ? e1rm(x.kg, x.reps) : 0);
  const r1 = v(b.bench) && v(b.squat) ? v(b.bench) / v(b.squat) : 0; const r2 = v(b.squat) && v(b.deadlift) ? v(b.squat) / v(b.deadlift) : 0;
  const { push, pull } = useMemo(() => { const lim = Date.now() - 28 * 86400e3; let push = 0, pull = 0; for (const s of history) { if (s.startedAt < lim) continue; for (const ex of s.exos) { const e = byId(ex.exoId); if (!e) continue; const n = ex.sets.filter((x) => x.done).length; const hl = { ...(e.hl ?? {}), ...(e.hlBack ?? {}) }; for (const [k, val] of Object.entries(hl)) { if (val < 0.75) continue; if (PUSH.has(k)) push += n; if (PULL.has(k)) pull += n; } } } return { push, pull }; }, [history]);
  const r3 = push ? pull / push : 0;
  const BAL = [
    { name: "Couché / squat", ideal: "idéal 0,75 – 0,85", v: r1, ok: r1 >= 0.75 && r1 <= 0.85, tip: r1 && r1 < 0.75 ? "ton squat domine : ajoute une séance de poussée haut du corps" : r1 > 0.85 ? "ton couché domine : renforce les jambes (squat, presse)" : "" },
    { name: "Squat / soulevé", ideal: "idéal 0,75 – 0,85", v: r2, ok: r2 >= 0.75 && r2 <= 0.85, tip: r2 && r2 < 0.75 ? "ton soulevé domine : travaille le squat lourd et le front squat" : r2 > 0.85 ? "ton soulevé est en retard : ajoute du soulevé roumain et du tirage lourd" : "" },
    { name: "Tirage / poussée (volume)", ideal: "idéal ≈ 1", v: r3, ok: r3 >= 0.85 && r3 <= 1.15, tip: r3 && r3 < 0.85 ? "pas assez de tirage : ajoute 2 blocs de rowing ou tractions par semaine" : r3 > 1.15 ? "beaucoup de tirage : équilibre avec un développé supplémentaire" : "" },
  ].filter((x) => x.v > 0);
  const share = () => Share.share({ message: "Standards de force : " + list.map((r) => `${r.name} ${r.label} (${levelName(r.ratio, r.t)})`).join(" · ") + " — IRONX" }).catch(() => {});

  return (
    <Page>
      <Top title="Standards de force" sub={`${sex ? "Femme" : "Homme"} · ${perfaKg(bw)} kg · 1RM estimés`} right={<Circ icon="share" size={38} onPress={share} />} onBack={() => router.back()} />
      <Pills items={TABS} on={tab} onChange={setTab} />
      {!list.length ? <PerfA_Empty icon="trophy" title="Pas encore de record ici" text={tab === 1 ? "Enregistre un test de tractions ou de dips lestés pour te situer de Débutant à Élite." : "Fais une séance avec ces mouvements pour te situer de Débutant à Élite."} cta={tab === 1 ? "Enregistrer un test" : "Démarrer une séance"} onPress={() => router.push((tab === 1 ? "/perf/street" : "/seance") as any)} /> : null}
      {list.map((r) => (
        <View key={r.id} style={{ gap: 8, paddingVertical: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <View style={{ flex: 1, gap: 1 }}><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{r.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{levelName(r.ratio, r.t)}{r.note ? ` · ${r.note}` : ""}</Text></View>
            <Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{r.label} <Text style={{ color: C.mut, fontFamily: inter(400), fontSize: 13 }}>· × {r.ratio.toFixed(2).replace(".", ",")}</Text></Text>
          </View>
          <LevelBar pct={levelPct(r.ratio, r.t)} labels={LEVELS} />
        </View>
      ))}
      <H2>Équilibres</H2>
      {!BAL.length ? <Sub>Les équilibres apparaissent quand tu as un record sur au moins deux des trois mouvements de base.</Sub> : null}
      {BAL.map((x) => (
        <View key={x.name} style={{ gap: 6, paddingVertical: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ gap: 1 }}><Text style={{ fontFamily: inter(600), fontSize: 14, color: C.txt }}>{x.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{x.ideal}</Text></View>
            <Text style={{ fontFamily: man(700), fontSize: 17, color: x.ok ? C.green : C.orange }}>{x.v.toFixed(2).replace(".", ",")}</Text>
          </View>
          {x.tip ? <Text style={{ fontFamily: inter(400), fontSize: 12, lineHeight: 17, color: C.mut }}>{x.tip}</Text> : null}
        </View>
      ))}
      {BAL.length > 0 && BAL.every((x) => x.ok) ? <PerfA_Advice icon="check" color={C.green} title="Équilibres dans l'idéal" text="Continue sur la même répartition." /> : null}
    </Page>
  );
}
