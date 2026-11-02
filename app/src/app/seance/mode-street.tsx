import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Vibration } from "react-native";
import { router } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { Page, Top, Label, Btn, Pills, KV, Surf, Sub, Circ, Mono, Icon } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { act, STREET_MOVES, bestStreet, fmtStreet, fmtTime, useActivities } from "../../store/activities";

const VARIANTS: Record<string, string[]> = { pullup: ["strict", "kipping", "pronation", "supination"], dips: ["strict", "anneaux"], pushup: ["strict", "diamant", "archer"], muscleup: ["strict", "kipping", "anneaux"], hspu: ["strict", "kipping", "libre"], pistol: ["assisté", "libre"],
  frontlever: ["tuck", "advanced tuck", "one leg", "straddle", "full"], backlever: ["tuck", "advanced tuck", "straddle", "full"], planche: ["lean", "tuck", "advanced tuck", "straddle", "full"], lsit: ["genoux", "une jambe", "full"], handstand: ["mur", "libre"], "human-flag": ["tuck", "straddle", "full"] };
/** Mode street workout : test max (reps au compteur, tenue au chrono, lest) avec repos entre tentatives */
export default function ModeStreet() {
  useKeepAwake();
  useActivities();
  const [mi, setMi] = useState(0); const m = STREET_MOVES[mi]; const [variant, setVariant] = useState(0);
  const [count, setCount] = useState(0); const [kg, setKg] = useState(10);
  const [running, setRunning] = useState(false); const [elapsed, setElapsed] = useState(0); const startRef = useRef(0);
  const [attempts, setAttempts] = useState<number[]>([]); const [restUntil, setRestUntil] = useState(0); const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => { setNow(Date.now()); if (running) setElapsed(Date.now() - startRef.current); }, 200); return () => clearInterval(t); }, [running]);
  useEffect(() => { setVariant(0); setCount(0); setAttempts([]); setElapsed(0); setRunning(false); }, [mi]);
  const best = bestStreet(m.id); const vars = VARIANTS[m.id] ?? ["strict"];
  const value = m.kind === "sec" ? Math.round(elapsed / 100) / 10 : m.kind === "kg" ? kg : count;
  const addAttempt = () => { if (value <= 0) return; setAttempts([...attempts, value]); setRestUntil(Date.now() + 180e3); Vibration.vibrate(100); if (m.kind !== "kg") { setCount(0); setElapsed(0); } };
  const bestAttempt = attempts.length ? Math.max(...attempts) : 0;
  const save = () => { if (!bestAttempt) return; act.addStreet({ at: Date.now(), move: m.id, value: bestAttempt, variant: vars[variant] }); router.replace("/perf/street"); };
  const restLeft = Math.max(0, restUntil - now);
  return (
    <Page>
      <Top title="Test max" sub="street workout · tentatives et repos" onBack={() => router.back()} />
      <Pills items={STREET_MOVES.map((x) => x.name)} on={mi} onChange={setMi} />
      <Pills items={vars} on={variant} onChange={setVariant} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Ton record" v={best ? fmtStreet(m.id, best.value) + (best.variant ? ` · ${best.variant}` : "") : "—"} strong />
        <KV k="Meilleure tentative" v={bestAttempt ? fmtStreet(m.id, bestAttempt) : "—"} strong align="flex-end" />
      </View>
      {m.kind === "reps" ? (
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <Label>reps</Label>
          <Text style={{ fontFamily: man(800), fontSize: 84, letterSpacing: -2, color: C.txt }}>{count}</Text>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}><Circ icon="x" size={48} onPress={() => setCount(Math.max(0, count - 1))} /><Pressable onPress={() => setCount(count + 1)} style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={44} color="#fff" w={2.5} /></Pressable><View style={{ width: 48 }} /></View>
          <Sub>Touche le grand bouton à chaque rep (ou compte à la fin et règle le chiffre).</Sub>
        </View>
      ) : m.kind === "sec" ? (
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <Label>tenue</Label>
          <Text style={{ fontFamily: man(800), fontSize: 72, letterSpacing: -2, color: running ? C.green : C.txt }}>{(elapsed / 1000).toFixed(1).replace(".", ",")} s</Text>
          <Pressable onPressIn={() => { startRef.current = Date.now() - elapsed; setRunning(true); }} onPressOut={() => setRunning(false)} style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: running ? C.green : C.accent, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: inter(700), fontSize: 15, color: "#fff" }}>{running ? "Tiens !" : "Maintenir"}</Text></Pressable>
          <Sub>Garde le doigt appuyé pendant la tenue, ou demande à quelqu'un de le faire pour toi. Relâche = fin.</Sub>
          {elapsed && !running ? <Text onPress={() => setElapsed(0)} style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>Remettre à zéro</Text> : null}
        </View>
      ) : (
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <Label>lest</Label>
          <Text style={{ fontFamily: man(800), fontSize: 72, letterSpacing: -2, color: C.txt }}>+{String(kg).replace(".", ",")} kg</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>{[-5, -2.5, -1.25, 1.25, 2.5, 5].map((d) => <Pressable key={d} onPress={() => setKg(Math.max(0, Math.round((kg + d) * 100) / 100))} style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)" }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.txt }}>{d > 0 ? "+" : "−"}{String(Math.abs(d)).replace(".", ",")}</Text></Pressable>)}</View>
          <Sub>Charge ajoutée pour 1 rep propre. Monte de 2,5 kg par tentative.</Sub>
        </View>
      )}
      <Btn label={`Valider la tentative${value ? " · " + fmtStreet(m.id, value) : ""}`} icon="check" onPress={addAttempt} />
      {restLeft > 0 ? <Surf pad={12}><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Repos avant la prochaine tentative</Text><Mono size={20}>{fmtTime(restLeft / 1000)}</Mono></View><View style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}><View style={{ width: `${(restLeft / 180e3) * 100}%`, height: 4, backgroundColor: C.accent }} /></View></Surf> : null}
      {attempts.length ? <Surf><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Tentatives</Text>{attempts.map((a, i) => <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.soft }}>Tentative {i + 1}</Text><Mono size={14} color={a === bestAttempt ? C.green : C.txt}>{fmtStreet(m.id, a)}</Mono></View>)}<Btn label="Enregistrer le test" kind="white" icon="trophy" onPress={save} /></Surf> : null}
    </Page>
  );
}
