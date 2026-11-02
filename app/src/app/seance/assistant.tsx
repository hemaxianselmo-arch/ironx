import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Seg, Figure, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { EXERCISES, Exercise, GROUPS_LIST } from "../../data/exercises";
import { useWorkout, startFromExos, exoHistory } from "../../store/workout";
import { Highlight } from "../../ui/Figure";

const LBL = ({ t }: { t: string }) => <Text style={{ fontFamily: inter(700), fontSize: 13, color: C.mut }}>{t}</Text>;
/** S07 · Création assistée : compose une séance depuis la bibliothèque selon les critères */
export default function Assistant() {
  const { history } = useWorkout();
  const [goal, setGoal] = useState(0); const [time, setTime] = useState(1); const [equip, setEquip] = useState(0);
  const [muscles, setMuscles] = useState<number[]>([0, 3]);
  const EQ = [["Barre", "Haltères", "Poulie", "Machine", "Poids du corps", "Kettlebell"], ["Haltères", "Poids du corps"], ["Poids du corps"]][equip];
  const recent = history.filter((s) => Date.now() - s.startedAt < 36 * 3600e3);
  const tired = new Set(recent.flatMap((s) => s.exos.map((e) => EXERCISES.find((x) => x.id === e.exoId)?.group)).filter(Boolean));
  const hl: Highlight = {}; muscles.forEach((m) => { EXERCISES.filter((e) => e.group === GROUPS_LIST[m]).slice(0, 3).forEach((e) => Object.assign(hl, e.hl)); });
  const compose = () => {
    const n = [4, 5, 7, 9][time]; const sets = goal === 1 ? 5 : goal === 2 ? 3 : 4; const reps = goal === 1 ? 5 : goal === 2 ? 15 : 10; const rest = goal === 1 ? 180 : goal === 2 ? 45 : 90;
    const pool = EXERCISES.filter((e) => muscles.some((m) => e.group === GROUPS_LIST[m]) && EQ.includes(e.equip) && e.group !== "Cardio");
    const scored = pool.map((e) => ({ e, s: (exoHistory(e.id).length ? 2 : 0) + (e.equip === "Barre" ? 1 : 0) + Math.random() })).sort((a, b) => b.s - a.s);
    const picked: Exercise[] = []; const perGroup: Record<string, number> = {};
    for (const { e } of scored) { if (picked.length >= n) break; if ((perGroup[e.group] ?? 0) >= Math.ceil(n / muscles.length)) continue; picked.push(e); perGroup[e.group] = (perGroup[e.group] ?? 0) + 1; }
    startFromExos(`${["Hypertrophie", "Force", "Endurance", "Mobilité"][goal]} · ${muscles.map((m) => GROUPS_LIST[m]).join(" + ")}`, picked.map((e) => ({ exo: e, sets, reps, rest })));
    router.replace("/seance/encours");
  };
  return (
    <Page>
      <Top title="Assistant" sub="Je compose avec ce que tu as fait ces derniers jours" left={<></>} right={<Circ icon="x" size={38} onPress={() => router.back()} />} />
      <View style={{ gap: 8 }}><LBL t="Objectif du jour" /><Pills items={["Hypertrophie", "Force", "Endurance", "Mobilité"]} on={goal} onChange={setGoal} /></View>
      <View style={{ gap: 8 }}><LBL t="Temps disponible" /><Seg items={["30", "45", "60", "90 min"]} on={time} onChange={setTime} /></View>
      <View style={{ gap: 8 }}><LBL t="Matériel" /><Pills items={["Salle complète", "Haltères", "Poids du corps"]} on={equip} onChange={setEquip} /></View>
      <View style={{ gap: 8 }}>
        <LBL t="Muscles" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Figure view="front" hl={hl} h={150} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {GROUPS_LIST.filter((g) => g !== "Cardio").map((g, i) => { const on = muscles.includes(i); return (
                <Text key={g} onPress={() => setMuscles((m) => (on ? m.filter((x) => x !== i) : [...m, i]))} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, fontFamily: inter(on ? 700 : 500), fontSize: 12.5, backgroundColor: on ? C.txt : "rgba(255,255,255,0.08)", color: on ? C.bg : tired.has(g) ? C.red : C.txt }}>{g}</Text>); })}
            </View>
            <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>{tired.size ? `${[...tired].join(", ")} travaillé${tired.size > 1 ? "s" : ""} récemment : en rouge, à éviter.` : "Rien de récent, tout est disponible."}</Text>
          </View>
        </View>
      </View>
      <CTA label="Composer ma séance" icon="bolt" onPress={compose} />
    </Page>
  );
}
