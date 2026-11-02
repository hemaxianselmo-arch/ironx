import React, { useMemo } from "react";
import { View, Text, Pressable, Image, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Actions, Pills, Label, Big, Sub, AreaChart, H2, ExoThumb, PerfA_Empty, PerfA_Shortcut, perfaDate, perfaKg } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, allRecords, bestOf, fmtKg, exoHistory } from "../../store/workout";
import { useActivities, bestStreet, fmtStreet, streetMove, STREET_MOVES } from "../../store/activities";
import { byId, e1rm, PREVIOUS_BEST } from "../../data/seed";

const LIFTS = ["squat", "bench", "deadlift"] as const;
const PILLS = ["Records", "Semaine", "Hyrox", "Course", "Street", "Forme", "Objectifs", "Régularité", "Année"];
const ROUTES = ["", "/perf/semaine", "/perf/endurance", "/perf/course", "/perf/street", "/perf/forme", "/perf/objectifs", "/perf/regularite", "/perf/annee"];

/** R01 · Performances (hub) : total SBD, courbe, records, raccourcis vers tout le module */
export default function PerfHub() {
  const { history } = useWorkout(); const { street } = useActivities();
  const total = LIFTS.map((id) => bestOf(id)).reduce((a, b) => a + (b ? e1rm(b.kg, b.reps) : 0), 0);
  const parts = LIFTS.map((id) => { const b = bestOf(id); return b ? e1rm(b.kg, b.reps) : 0; });

  // total SBD il y a 90 jours : données de départ + séances d'avant cette date
  const past = useMemo(() => {
    const lim = Date.now() - 90 * 86400e3; let t = 0;
    for (const id of LIFTS) { let best = Math.max(0, ...(PREVIOUS_BEST[id] ?? []).map((s) => e1rm(s.kg, s.reps))); for (const s of history) if (s.startedAt < lim) for (const e of s.exos) if (e.exoId === id) for (const x of e.sets) if (x.done) best = Math.max(best, e1rm(x.kg, x.reps)); t += best; }
    return t;
  }, [history]);
  const delta = total - past;

  // courbe : meilleur total cumulé, séance par séance (séances contenant au moins un des 3 mouvements)
  const curve = useMemo(() => {
    const best: Record<string, number> = {}; for (const id of LIFTS) best[id] = Math.max(0, ...(PREVIOUS_BEST[id] ?? []).map((s) => e1rm(s.kg, s.reps)));
    const out: number[] = [];
    for (const s of history.slice().reverse()) { let hit = false; for (const e of s.exos) if ((LIFTS as readonly string[]).includes(e.exoId)) for (const x of e.sets) if (x.done) { hit = true; best[e.exoId] = Math.max(best[e.exoId], e1rm(x.kg, x.reps)); } if (hit) out.push(LIFTS.reduce((a, id) => a + best[id], 0)); }
    return out;
  }, [history]);

  // records : exercices (1RM est.) + tests street, triés par date (les plus récents d'abord)
  const records = useMemo(() => {
    const ex = allRecords().filter((r) => byId(r.exoId)).map((r) => {
      const cur = e1rm(r.best.kg, r.best.reps);
      // record précédent : meilleur 1RM avant la séance du record (données de départ + séances antérieures)
      let prev = r.date ? Math.max(0, ...(PREVIOUS_BEST[r.exoId] ?? []).map((s) => e1rm(s.kg, s.reps))) : 0;
      if (r.date) for (const h of exoHistory(r.exoId)) if (h.session.startedAt < r.date) for (const x of h.sets) prev = Math.max(prev, e1rm(x.kg, x.reps));
      return { key: "exo-" + r.exoId, exoId: r.exoId, name: byId(r.exoId).name, date: r.date, value: r.best.kg ? `${fmtKg(r.best.kg)} × ${r.best.reps}` : `${r.best.reps} reps`, sub: r.best.kg ? `1RM est. ${perfaKg(cur)}` : "poids de corps", delta: prev > 0 && r.best.kg ? cur - prev : null, deltaUnit: "kg", onPress: () => router.push({ pathname: "/perf/record", params: { id: r.exoId } }) };
    });
    const st = STREET_MOVES.map((m) => bestStreet(m.id)).filter((t): t is NonNullable<typeof t> => !!t).map((t) => {
      const older = street.filter((x) => x.move === t.move && x.at < t.at); const prev = older.length ? Math.max(...older.map((x) => x.value)) : null; const k = streetMove(t.move)?.kind;
      return { key: "st-" + t.move, exoId: t.move === "pullup-w" ? "pullup-weighted" : t.move === "dips-w" ? "dips" : t.move === "frontlever" ? "front-lever" : t.move === "muscleup" ? "muscle-up" : t.move, name: streetMove(t.move)?.name ?? t.move, date: t.at, value: fmtStreet(t.move, t.value), sub: t.variant ?? "test max", delta: prev != null ? t.value - prev : null, deltaUnit: k === "sec" ? "s" : k === "kg" ? "kg" : "reps", onPress: () => router.push("/perf/street" as any) };
    });
    return [...ex, ...st].sort((a, b) => (b.date ?? 0) - (a.date ?? 0));
  }, [history, street]);

  const share = () => Share.share({ message: `Mon total SBD estimé : ${perfaKg(total)} kg (squat ${perfaKg(parts[0])} · couché ${perfaKg(parts[1])} · soulevé ${perfaKg(parts[2])}) — IRONX` }).catch(() => {});
  const empty = !history.length && !street.length;

  return (
    <Page>
      <Top left={<Image source={IMG["record"]} style={{ width: 38, height: 38 }} resizeMode="contain" />} title="Performances" right={<Actions><Circ icon="search" size={38} onPress={() => router.push("/seance/bibliotheque" as any)} /><Circ icon="share" size={38} onPress={share} /></Actions>} />
      <Pills items={PILLS} on={0} onChange={(i) => { if (ROUTES[i]) router.push(ROUTES[i] as any); }} />

      {empty ? (
        <PerfA_Empty icon="trophy" title="Fais ta première séance" text="Tes records, ton total SBD et toutes tes tendances apparaîtront ici dès ta première séance validée." cta="Démarrer une séance" onPress={() => router.push("/seance" as any)} />
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 2, flex: 1 }}>
          <Label>total SBD estimé</Label>
          <Big v={perfaKg(total)} unit="kg" size={52} />
          <Sub>
            {past > 0 ? <Text style={{ fontFamily: inter(600), color: delta >= 0 ? C.green : C.red }}>{delta >= 0 ? "+" : "−"}{perfaKg(Math.abs(delta))} kg</Text> : <Text style={{ fontFamily: inter(600), color: C.soft }}>—</Text>}
            {" "}sur 3 mois · squat {perfaKg(parts[0])} · couché {perfaKg(parts[1])} · soulevé {perfaKg(parts[2])}
          </Sub>
        </View>
        <Image source={IMG["record"]} style={{ width: 64, height: 64 }} resizeMode="contain" />
      </View>
      {curve.length >= 2 ? <AreaChart points={curve} h={110} /> : <Sub>La courbe du total apparaît après deux séances avec squat, couché ou soulevé.</Sub>}

      <H2 action="Tout" onAction={() => router.push("/seance/records" as any)}>Records</H2>
      {records.slice(0, 8).map((r) => { const e = byId(r.exoId); return (
        <Pressable key={r.key} onPress={r.onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
          {e ? <ExoThumb hl={e.hl} view={e.view} size={48} /> : <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.surf }} />}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{r.name}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{r.sub} · {r.date ? perfaDate(r.date) : "avant IRONX"}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text style={{ fontFamily: man(700), fontSize: 16, color: C.txt }}>{r.value}</Text>
            {r.delta == null ? <Text style={{ fontFamily: inter(500), fontSize: 11, color: C.mut }}>{r.date ? "premier" : "stable"}</Text>
              : r.delta === 0 ? <Text style={{ fontFamily: inter(500), fontSize: 11, color: C.mut }}>stable</Text>
              : <Text style={{ fontFamily: inter(600), fontSize: 11, color: r.delta > 0 ? C.green : C.red }}>{r.delta > 0 ? "+" : "−"}{perfaKg(Math.abs(r.delta))} {r.deltaUnit}</Text>}
          </View>
        </Pressable>); })}
      {!records.length && !empty ? <Sub>Pas encore de record : valide une série au-dessus de ton meilleur connu.</Sub> : null}

      <H2>Analyser</H2>
      <View style={{ gap: 8 }}>
        <PerfA_Shortcut icon="stats" title="Volume par muscle" sub="Séries par groupe, figure colorée" onPress={() => router.push("/perf/muscles" as any)} />
        <PerfA_Shortcut icon="bolt" title="Charge et récupération" sub="Ratio aiguë / chronique, décharge" onPress={() => router.push("/perf/charge" as any)} />
        <PerfA_Shortcut icon="stats" title="Tendances" sub="Couché, squat, soulevé sur 12 semaines" onPress={() => router.push("/perf/tendances" as any)} />
        <PerfA_Shortcut icon="trophy" title="Standards de force" sub="Débutant → Élite, ratios poids de corps" onPress={() => router.push("/perf/standards" as any)} />
        <PerfA_Shortcut icon="filter" title="À améliorer" sub="Plateaux et régressions détectés" onPress={() => router.push("/perf/ameliorer" as any)} />
        <PerfA_Shortcut icon="star" title="Mes classements" sub="Salle, abonnés, région" onPress={() => router.push("/perf/classements" as any)} />
        <PerfA_Shortcut icon="cal" title="Rapport du mois" sub="Volume, records, à partager" onPress={() => router.push("/perf/rapport" as any)} />
        <PerfA_Shortcut icon="clock" title="Bloc en cours" sub="Semaines, intensité, prochain bloc" onPress={() => router.push("/perf/bloc" as any)} />
        <PerfA_Shortcut icon="play" title="Se challenger" sub="Défis contre toi, tes amis, ta salle" onPress={() => router.push("/perf/defis" as any)} />
        <PerfA_Shortcut icon="run" title="Comparer Hyrox" sub="Deux simulations, écarts par station" onPress={() => router.push("/perf/comparer-hyrox" as any)} />
        <PerfA_Shortcut icon="run" title="Points faibles Hyrox" sub="Radar toi vs allure objectif" onPress={() => router.push("/perf/radar-hyrox" as any)} />
        <PerfA_Shortcut icon="timer" title="Fractionné" sub="Reps, dérive, FC" onPress={() => router.push("/perf/fractionne" as any)} />
      </View>
    </Page>
  );
}
