import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Vibration } from "react-native";
import { router } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { Page, Top, Label, Btn, Seg, Pills, KV, Surf, Sub, Field, Toggle, Circ, Ring } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { act, fmtTime, Wod } from "../../store/activities";

const FORMATS: Wod["format"][] = ["fortime", "amrap", "emom", "tabata", "chipper"];
const F_LABEL = ["For time", "AMRAP", "EMOM", "Tabata", "Chipper"];
const BENCH: Record<string, { format: Wod["format"]; mv: string; cap?: number }> = {
  Fran: { format: "fortime", mv: "21-15-9 thrusters 43 kg · tractions" }, Grace: { format: "fortime", mv: "30 clean & jerk 61 kg" }, Helen: { format: "fortime", mv: "3 tours : 400 m, 21 KB swings 24 kg, 12 tractions" },
  Cindy: { format: "amrap", mv: "20 min : 5 tractions, 10 pompes, 15 squats", cap: 20 }, Murph: { format: "fortime", mv: "1,6 km, 100 tractions, 200 pompes, 300 squats, 1,6 km" }, Diane: { format: "fortime", mv: "21-15-9 soulevé 102 kg · HSPU" }, Karen: { format: "fortime", mv: "150 wall balls 9 kg" },
};
/** Mode CrossFit : chronos For time (avec cap), AMRAP (compte à rebours + tours), EMOM (minutes), Tabata (20/10 × 8) */
export default function ModeWod() {
  useKeepAwake();
  const [fmt, setFmt] = useState(0); const [name, setName] = useState(""); const [mv, setMv] = useState(""); const [rx, setRx] = useState(true);
  const [minutes, setMinutes] = useState("20"); const [rounds, setRounds] = useState(0); const [reps, setReps] = useState("");
  const [running, setRunning] = useState(false); const [elapsed, setElapsed] = useState(0); const [finished, setFinished] = useState(false);
  const startRef = useRef(0); const accRef = useRef(0); const lastBeep = useRef(-1);
  useEffect(() => { if (!running) return; const t = setInterval(() => setElapsed(accRef.current + Date.now() - startRef.current), 200); return () => clearInterval(t); }, [running]);
  const format = FORMATS[fmt]; const capS = (parseInt(minutes) || 0) * 60; const totalS = elapsed / 1000;
  // fin automatique des formats à durée fixe
  useEffect(() => { if (running && capS > 0 && format !== "fortime" && format !== "chipper" && totalS >= capS) { setRunning(false); setFinished(true); Vibration.vibrate(600); } }, [totalS, running, capS, format]);
  // bips de minute (EMOM) et de phase (Tabata)
  useEffect(() => { if (!running) return; const sec = Math.floor(totalS); const mark = format === "emom" ? sec % 60 === 0 : format === "tabata" ? sec % 30 === 0 || sec % 30 === 20 : false; if (mark && sec !== lastBeep.current) { lastBeep.current = sec; if (sec > 0) Vibration.vibrate(200); } }, [totalS, running, format]);
  const toggle = () => { if (finished) return; if (running) { accRef.current += Date.now() - startRef.current; setRunning(false); } else { startRef.current = Date.now(); setRunning(true); } };
  const stop = () => { if (running) { accRef.current += Date.now() - startRef.current; setRunning(false); } setFinished(true); };
  const left = Math.max(0, capS - totalS);
  const tabataPhase = format === "tabata" ? (Math.floor(totalS) % 30 < 20 ? "Travail" : "Repos") : null; const tabataRound = Math.min(8, Math.floor(totalS / 30) + 1);
  const emomMin = Math.floor(totalS / 60) + 1; const emomLeft = 60 - (totalS % 60);
  const pickBench = (b: string) => { setName(b); setMv(BENCH[b].mv); setFmt(FORMATS.indexOf(BENCH[b].format)); if (BENCH[b].cap) setMinutes(String(BENCH[b].cap)); };
  const save = () => {
    const isTime = format === "fortime" || format === "chipper";
    act.addWod({ at: Date.now() - elapsed, name: name.trim() || F_LABEL[fmt], format, result: isTime ? Math.round(totalS) : rounds * 1000 + (parseInt(reps) || 0), rounds: isTime ? undefined : rounds, reps: isTime ? undefined : parseInt(reps) || 0, rx, cap: capS || undefined, movements: mv.trim(), benchmark: !!BENCH[name.trim()] });
    router.replace("/perf/endurance");
  };
  const big = format === "amrap" ? fmtTime(left) : format === "tabata" ? fmtTime(Math.floor(totalS) % 30 < 20 ? 20 - (Math.floor(totalS) % 30) : 30 - (Math.floor(totalS) % 30)) : format === "emom" ? fmtTime(emomLeft) : fmtTime(totalS);
  return (
    <Page>
      <Top title="WOD" sub="For time · AMRAP · EMOM · Tabata" onBack={() => router.back()} />
      {!elapsed ? (
        <>
          <Pills items={Object.keys(BENCH)} on={Object.keys(BENCH).indexOf(name)} onChange={(i) => pickBench(Object.keys(BENCH)[i])} />
          <Seg items={F_LABEL} on={fmt} onChange={(i) => { setFmt(i); if (FORMATS[i] === "tabata") setMinutes("4"); }} />
          <Field label="Nom du WOD" value={name} onChange={setName} placeholder="Fran, WOD du jour…" />
          <Field label="Mouvements" value={mv} onChange={setMv} placeholder="21-15-9 thrusters · tractions" />
          {format !== "tabata" ? <Field label={format === "fortime" || format === "chipper" ? "Time cap (min, 0 = aucun)" : "Durée (min)"} value={minutes} onChange={setMinutes} keyboard="number-pad" /> : <Sub>Tabata : 8 tours de 20 s travail / 10 s repos (4 min).</Sub>}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(500), fontSize: 13, color: C.txt }}>Rx (charges prescrites)</Text><Toggle on={rx} onChange={setRx} /></View>
        </>
      ) : null}
      <View style={{ alignItems: "center", gap: 2, paddingVertical: 8 }}>
        <Label>{format === "amrap" ? "temps restant" : format === "tabata" ? `${tabataPhase} · tour ${tabataRound} / 8` : format === "emom" ? `minute ${emomMin} · reste` : "temps"}</Label>
        <Text style={{ fontFamily: man(800), fontSize: 64, letterSpacing: -1, color: tabataPhase === "Repos" ? C.blue : C.txt }}>{big}</Text>
        {format !== "fortime" && format !== "chipper" ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>écoulé {fmtTime(totalS)}{capS ? ` / ${fmtTime(capS)}` : ""}</Text> : capS ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: totalS > capS ? C.red : C.mut }}>cap {fmtTime(capS)}</Text> : null}
      </View>
      {format === "amrap" || format === "emom" ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <Circ icon="x" size={44} onPress={() => setRounds(Math.max(0, rounds - 1))} />
          <View style={{ alignItems: "center" }}><Text style={{ fontFamily: man(800), fontSize: 40, color: C.txt }}>{rounds}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{format === "emom" ? "minutes réussies" : "tours"}</Text></View>
          <Circ icon="plus" size={56} kind="primary" onPress={() => setRounds(rounds + 1)} />
        </View>
      ) : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Btn label={finished ? "Terminé" : running ? "Pause" : elapsed ? "Reprendre" : "3, 2, 1… Go"} kind={running ? "secondary" : "primary"} icon={running ? "pause" : "play"} onPress={toggle} /></View>
        {elapsed && !finished ? <View style={{ flex: 1 }}><Btn label="Terminer" kind="white" icon="check" onPress={stop} /></View> : null}
      </View>
      {finished ? (
        <Surf>
          <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Résultat</Text>
          {format === "amrap" || format === "emom" ? <Field label="Reps supplémentaires dans le tour en cours" value={reps} onChange={setReps} keyboard="number-pad" placeholder="0" /> : null}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <KV k={format === "amrap" ? "Tours + reps" : "Temps"} v={format === "amrap" || format === "emom" ? `${rounds} + ${reps || 0}` : fmtTime(totalS)} strong /><KV k="Format" v={F_LABEL[fmt]} /><KV k="Rx" v={rx ? "oui" : "scaled"} />
          </View>
          <Btn label="Enregistrer le WOD" icon="check" onPress={save} />
          <Text onPress={() => router.back()} style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center", padding: 6 }}>Abandonner sans enregistrer</Text>
        </Surf>
      ) : null}
    </Page>
  );
}
