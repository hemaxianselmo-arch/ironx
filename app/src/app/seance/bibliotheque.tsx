import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Circ, Search, Pills, H2, ExoThumb, Icon, Mono } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { GROUPS_LIST, EQUIPS, normalize, Exercise } from "../../data/exercises";
import { useLibrary, allExercises, setPendingAdd } from "../../store/library";
import { useWorkout, bestOf, fmtKg, exoHistory, addExoToActive } from "../../store/workout";

/** Ligne d'exercice (exo_row) */
export function ExoRow({ e, right, onPress }: { e: Exercise; right?: React.ReactNode; onPress?: () => void }) {
  const best = bestOf(e.id); const n = exoHistory(e.id).length;
  const s = `${e.equip}${best ? ` · ton max ${best.kg ? fmtKg(best.kg) + " kg" : best.reps + " reps"}` : " · jamais fait"}${n ? ` · ${n} séance${n > 1 ? "s" : ""}` : ""}`;
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 }}>
      <ExoThumb hl={e.hl} view={e.view} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{e.name}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>{s}</Text>
      </View>
      {right ?? (best ? <Mono size={14}>{best.kg ? `${fmtKg(best.kg)} kg` : `${best.reps}`}</Mono> : <Icon name="chev" size={18} color={C.mut} />)}
    </Pressable>
  );
}

/** S02 · Bibliothèque d'exercices — mode "pick" : renvoie l'exercice choisi à l'écran appelant */
export default function Bibliotheque() {
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  useLibrary(); useWorkout();
  const [q, setQ] = useState(""); const [g, setG] = useState(0); const [eq, setEq] = useState(-1);
  const list = useMemo(() => {
    const all = allExercises(); const nq = normalize(q);
    return all.filter((e) => (g === 0 || e.group === GROUPS_LIST[g - 1]) && (eq < 0 || e.equip === EQUIPS[eq]) && (!nq || normalize(e.name + " " + e.primary + " " + e.equip).includes(nq)));
  }, [q, g, eq]);
  const done = allExercises().filter((e) => exoHistory(e.id).length || bestOf(e.id)).length;
  const groups = g === 0 && !q ? GROUPS_LIST.map((gr) => [gr, list.filter((e) => e.group === gr)] as const).filter(([, l]) => l.length) : [["Résultats", list] as const];
  const choose = (e: Exercise) => {
    if (pick === "active") { addExoToActive(e); router.back(); return; }
    if (pick === "editor") { setPendingAdd(e.id); router.back(); return; }
    router.push({ pathname: "/seance/exo", params: { id: e.id } });
  };
  return (
    <Page>
      <Top title={pick ? "Ajouter un exercice" : "Exercices"} sub={`${allExercises().length} exercices · ${done} que tu as déjà faits`} right={<Circ icon="plus" size={38} kind="primary" onPress={() => router.push("/seance/creer-exo")} />} onBack={() => router.back()} />
      <Search ph="Nom, muscle, matériel…" value={q} onChange={setQ} />
      <Pills items={["Tous", ...GROUPS_LIST]} on={g} onChange={setG} />
      <Pills items={EQUIPS} on={eq} onChange={(i) => setEq(i === eq ? -1 : i)} />
      {groups.map(([gr, l]) => (
        <View key={gr}>
          <H2>{gr} · {l.length}</H2>
          {l.map((e) => <ExoRow key={e.id} e={e} onPress={() => choose(e)} right={pick ? <Circ icon="plus" size={32} kind="secondary" onPress={() => choose(e)} /> : undefined} />)}
        </View>
      ))}
      {!list.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Aucun exercice ne correspond. Tu peux le créer avec le bouton +.</Text> : null}
    </Page>
  );
}
