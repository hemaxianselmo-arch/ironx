import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Pills, KV, Surf, Sub, Btn, Mono, ExoThumb, Seg, Field } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, actions, bestOf, fmtKg } from "../../store/workout";
import { byId, e1rm, Template, TemplateSet } from "../../data/seed";

const MOVES = ["squat", "bench", "deadlift", "ohp"];
const SCHEMES: { name: string; s: string; sets: (rm: number) => TemplateSet[]; rest: number }[] = [
  { name: "5 × 5 à 80 %", s: "force de base", rest: 180, sets: (rm) => Array.from({ length: 5 }, () => ({ kg: r(rm * 0.8), reps: 5, rpe: 8 })) },
  { name: "4 × 4 à 85 %", s: "force", rest: 210, sets: (rm) => Array.from({ length: 4 }, () => ({ kg: r(rm * 0.85), reps: 4, rpe: 8.5 })) },
  { name: "3 × 3 à 88 %", s: "intensité", rest: 240, sets: (rm) => Array.from({ length: 3 }, () => ({ kg: r(rm * 0.88), reps: 3, rpe: 9 })) },
  { name: "Top single 95 % + 3 × 5 à 80 %", s: "pic + back-off", rest: 240, sets: (rm) => [{ kg: r(rm * 0.95), reps: 1, rpe: 9.5, kind: "top" }, ...Array.from({ length: 3 }, () => ({ kg: r(rm * 0.8), reps: 5, rpe: 8, kind: "backoff" as const }))] },
  { name: "Test de max : 90 / 97 / 102 %", s: "3 tentatives comme en compétition", rest: 300, sets: (rm) => [{ kg: r(rm * 0.9), reps: 1, rpe: 8.5, kind: "top" }, { kg: r(rm * 0.97), reps: 1, rpe: 9.5, kind: "top" }, { kg: r(rm * 1.02), reps: 1, rpe: 10, kind: "top" }] },
  { name: "Vague 3-2-1 × 2", s: "wave loading 85 / 90 / 95 %", rest: 240, sets: (rm) => [0.85, 0.9, 0.95, 0.87, 0.92, 0.97].map((p, i) => ({ kg: r(rm * p), reps: 3 - (i % 3), rpe: 8 + (i % 3) * 0.5 })) },
];
const r = (kg: number) => Math.round(kg / 2.5) * 2.5;
const WARM = [0.4, 0.5, 0.6, 0.7, 0.8];
/** Mode powerlifting : échauffement et tentatives calculés en % du 1RM, puis la séance démarre dans l'écran habituel */
export default function ModePower() {
  useWorkout();
  const [mi, setMi] = useState(0); const [si, setSi] = useState(0); const [rmTxt, setRmTxt] = useState(""); const [warm, setWarm] = useState(1);
  const id = MOVES[mi]; const d = byId(id); const best = bestOf(id);
  const rm = parseFloat(rmTxt.replace(",", ".")) || (best ? e1rm(best.kg, best.reps) : 0);
  const sch = SCHEMES[si];
  const warmSets: TemplateSet[] = rm && warm ? WARM.map((p, i) => ({ kg: r(rm * p), reps: [8, 5, 3, 2, 1][i], kind: "warmup" })) : [];
  const work = rm ? sch.sets(rm) : [];
  const start = () => {
    if (!rm) return;
    const t: Template = { id: "power-" + Date.now(), name: `${d.name} · ${sch.name}`, program: "Powerlifting", photo: d.photo, level: "Avancé", minutes: 15 + (warmSets.length + work.length) * 4, discipline: "powerlifting", exos: [{ exoId: id, rest: sch.rest, sets: [...warmSets, ...work], note: `% du 1RM ${fmtKg(rm)} kg` }] };
    actions.start(t); router.replace("/seance/encours");
  };
  return (
    <Page>
      <Top title="Powerlifting" sub="charges calculées en % de ton 1RM" onBack={() => router.back()} />
      <Pills items={MOVES.map((m) => byId(m).name)} on={mi} onChange={(i) => { setMi(i); setRmTxt(""); }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <ExoThumb hl={d.hl} view={d.view} size={56} />
        <View style={{ flex: 1 }}><KV k="1RM estimé (Epley)" v={best ? `${fmtKg(e1rm(best.kg, best.reps))} kg` : "inconnu"} strong /><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{best ? `meilleur réel ${fmtKg(best.kg)} × ${best.reps}` : "fais une série lourde ou saisis ton max"}</Text></View>
      </View>
      <Field label="Ou ton 1RM connu (kg)" value={rmTxt} onChange={setRmTxt} keyboard="decimal-pad" placeholder={best ? fmtKg(e1rm(best.kg, best.reps)) : "ex. 140"} />
      <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Schéma du jour</Text>
      {SCHEMES.map((s, i) => (
        <Surf key={s.name} pad={12} style={{ borderWidth: 1.5, borderColor: si === i ? C.txt : "transparent" }}>
          <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }} onPress={() => setSi(i)}>
            <View><Text style={{ fontFamily: inter(700), fontSize: 15, color: C.txt }}>{s.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{s.s} · repos {Math.round(s.rest / 60)} min</Text></View>
            {rm ? <Mono size={14}>{s.sets(rm).map((x) => fmtKg(x.kg)).filter((v, k, a) => a.indexOf(v) === k).join(" / ")} kg</Mono> : null}
          </Pressable>
        </Surf>
      ))}
      <Seg items={["Sans échauffement", "Échauffement 40 → 80 %"]} on={warm} onChange={setWarm} />
      {rm ? <Surf><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Ta séance</Text>{[...warmSets, ...work].map((s, i) => <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: s.kind === "warmup" ? C.mut : C.soft }}>{s.kind === "warmup" ? "Échauff." : s.kind === "top" ? "Tentative" : "Série"} {i + 1} · {Math.round((s.kg / rm) * 100)} %</Text><Mono size={14}>{fmtKg(s.kg)} kg × {s.reps}{s.rpe ? ` @${s.rpe}` : ""}</Mono></View>)}</Surf> : <Sub>Indique ton 1RM pour voir les charges.</Sub>}
      <Btn label="Démarrer la séance" icon="play" onPress={start} />
    </Page>
  );
}
