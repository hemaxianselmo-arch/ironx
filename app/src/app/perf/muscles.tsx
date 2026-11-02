import React, { useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Sub, Figure, GROUPS, PerfA_BarRow, PerfA_Empty, PerfA_Advice } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useWorkout } from "../../store/workout";
import { byId } from "../../data/seed";

/** Groupes affichés : clés de la Figure (front + back) → libellé */
const MUSCLES: { label: string; keys: string[] }[] = [
  { label: "Pectoraux", keys: ["pecs"] }, { label: "Quadriceps", keys: ["quads", "adductors"] }, { label: "Dorsaux", keys: ["lats", "traps", "lower_back"] }, { label: "Épaules", keys: ["delts", "rear_delts"] },
  { label: "Triceps", keys: ["triceps"] }, { label: "Biceps", keys: ["biceps", "forearms"] }, { label: "Fessiers", keys: ["glutes"] }, { label: "Ischios", keys: ["hamstrings"] }, { label: "Mollets", keys: ["calves", "tibialis"] }, { label: "Abdos", keys: ["abs", "obliques"] },
];
const DAYS = [7, 30, 90];

/** R04 · Volume par muscle : figure colorée + séries par groupe sur la période */
export default function PerfMuscles() {
  const { history } = useWorkout(); const [p, setP] = useState(0);
  const { byKey, groups, sessions } = useMemo(() => {
    const lim = Date.now() - DAYS[p] * 86400e3; const byKey: Record<string, number> = {}; let sessions = 0;
    for (const s of history) { if (s.startedAt < lim) continue; sessions++;
      for (const ex of s.exos) { const e = byId(ex.exoId); if (!e) continue; const n = ex.sets.filter((x) => x.done).length; if (!n) continue;
        const hl = { ...(e.hl ?? {}), ...(e.hlBack ?? {}) };
        // série entière pour le muscle principal (intensité ≥ 0,75), demi-série pour les secondaires
        for (const [k, v] of Object.entries(hl)) if (v > 0) byKey[k] = (byKey[k] ?? 0) + n * (v >= 0.75 ? 1 : 0.5); } }
    const groups = MUSCLES.map((m) => ({ ...m, sets: Math.round(m.keys.reduce((a, k) => a + (byKey[k] ?? 0), 0)) })).sort((a, b) => b.sets - a.sets);
    return { byKey, groups, sessions };
  }, [history, p]);
  const mxKey = Math.max(1, ...Object.values(byKey)); const mxGrp = Math.max(1, ...groups.map((g) => g.sets));
  const hlFront: Record<string, number> = {}; const hlBack: Record<string, number> = {};
  for (const [k, v] of Object.entries(byKey)) { if (GROUPS.front[k]) hlFront[k] = v / mxKey; if (GROUPS.back[k]) hlBack[k] = v / mxKey; }
  const weeks = DAYS[p] / 7; const low = groups.filter((g) => g.sets / weeks < 10);
  const color = (sets: number) => (sets / weeks >= 10 ? C.accent : sets / weeks >= 6 ? C.orange : C.red);
  const share = () => Share.share({ message: `Volume par muscle (${["7 jours", "30 jours", "3 mois"][p]}) : ` + groups.filter((g) => g.sets).map((g) => `${g.label} ${g.sets}`).join(" · ") + " — IRONX" }).catch(() => {});

  return (
    <Page>
      <Top title="Volume par muscle" sub={`${sessions} séance${sessions > 1 ? "s" : ""} · séries par groupe`} right={<Circ icon="share" size={38} onPress={share} />} onBack={() => router.back()} />
      <Pills items={["Semaine", "Mois", "3 mois"]} on={p} onChange={setP} />
      {!sessions ? <PerfA_Empty icon="stats" title="Aucune séance sur la période" text="Fais une séance pour voir quels muscles tu as travaillés et combien de séries chacun a reçues." cta="Démarrer une séance" onPress={() => router.push("/seance" as any)} /> : null}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 18, paddingVertical: 6 }}>
        <Figure view="front" hl={hlFront} h={250} />
        <Figure view="back" hl={hlBack} h={250} />
      </View>
      <View>
        {groups.map((g, i) => <PerfA_BarRow key={g.label} label={g.label} pct={(g.sets / mxGrp) * 100} value={g.sets ? (i === 0 ? `${g.sets} séries` : String(g.sets)) : "—"} color={color(g.sets)} bold={i === 0} />)}
      </View>
      {sessions ? (
        low.length === groups.length ? <Sub>Moins de 10 séries par semaine partout : augmente progressivement le volume sur tes groupes prioritaires.</Sub>
        : low.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, lineHeight: 19, color: C.mut }}>{low.map((g) => g.label).join(", ")} sous 10 séries / semaine : ajoute un rappel.</Text>
        : <PerfA_Advice icon="check" color={C.green} title="Volume équilibré" text="Tous les groupes reçoivent au moins 10 séries par semaine." />
      ) : null}
      {sessions > 0 && low.length > 0 && low.length < groups.length ? <PerfA_Advice icon="plus" title={`Ajoute un rappel ${low[0].label.toLowerCase()}`} text={`${low[0].sets} série${low[0].sets > 1 ? "s" : ""} sur la période · vise 10 à 20 séries par semaine pour progresser.`} action="Planifier" onAction={() => router.push("/seance/editeur" as any)} /> : null}
    </Page>
  );
}
