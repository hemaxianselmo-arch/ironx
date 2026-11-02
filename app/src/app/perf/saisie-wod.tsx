import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Seg, Pill, Field, Btn, Toggle, Big, PerfB_TimeInput, PerfB_Num, PerfB_SettingRow, perfB_secs } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { act, Wod, fmtTime } from "../../store/activities";

const FORMATS: Wod["format"][] = ["fortime", "amrap", "emom", "tabata", "chipper"];
const BENCH: Record<string, { format: Wod["format"]; moves: string }> = {
  Fran: { format: "fortime", moves: "21-15-9 thrusters 43 kg · tractions" }, Grace: { format: "fortime", moves: "30 clean & jerk 61 kg" }, Helen: { format: "fortime", moves: "3 tours : 400 m course · 21 KB swings 24 kg · 12 tractions" },
  Cindy: { format: "amrap", moves: "20 min : 5 tractions · 10 pompes · 15 squats" }, Murph: { format: "fortime", moves: "1 mile · 100 tractions · 200 pompes · 300 squats · 1 mile" }, Diane: { format: "fortime", moves: "21-15-9 soulevé de terre 102 kg · HSPU" }, Karen: { format: "fortime", moves: "150 wall balls 9 kg" },
};

/** Saisie d'un WOD : nom + benchmarks, format, résultat, Rx, mouvements, note */
export default function SaisieWod() {
  const [name, setName] = useState(""); const [fi, setFi] = useState(0); const [t, setT] = useState({ m: "", s: "" }); const [rounds, setRounds] = useState(""); const [reps, setReps] = useState("");
  const [rx, setRx] = useState(true); const [moves, setMoves] = useState(""); const [note, setNote] = useState(""); const [cap, setCap] = useState(""); const [err, setErr] = useState("");
  const format = FORMATS[fi]; const timed = format === "fortime" || format === "chipper";
  const pickBench = (b: string) => { setName(b); setFi(FORMATS.indexOf(BENCH[b].format)); setMoves(BENCH[b].moves); };
  const secs = perfB_secs(undefined, t.m, t.s);
  const save = () => {
    if (!name.trim()) { setErr("Donne un nom au WOD."); return; }
    let result = 0;
    if (timed) { if (!secs) { setErr("Indique le temps."); return; } result = secs; }
    else { const r = parseInt(rounds) || 0, rp = parseInt(reps) || 0; if (!r && !rp) { setErr("Indique les tours ou les reps."); return; } result = format === "amrap" ? r + rp / 1000 : r || rp; }
    act.addWod({ at: Date.now(), name: name.trim(), format, result, rounds: !timed ? parseInt(rounds) || undefined : undefined, reps: !timed ? parseInt(reps) || undefined : undefined, rx, cap: timed ? parseInt(cap) * 60 || undefined : undefined, movements: moves.trim(), note: note.trim() || undefined, benchmark: !!BENCH[name.trim()] });
    router.back();
  };
  return (
    <Page>
      <Top title="Nouveau WOD" sub={timed ? (secs ? fmtTime(secs) : "for time") : format === "amrap" ? `${rounds || 0} tours${reps ? ` + ${reps}` : ""}` : format.toUpperCase()} onBack={() => router.back()} />
      <Field label="Nom" value={name} onChange={setName} placeholder="Fran, WOD du jour…" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{Object.keys(BENCH).map((b) => <Pill key={b} label={b} on={name === b} onPress={() => pickBench(b)} />)}</View>
      <Seg items={["For time", "AMRAP", "EMOM", "Tabata", "Chipper"]} on={fi} onChange={setFi} />
      {timed ? (
        <>
          <View style={{ alignItems: "center", paddingVertical: 6 }}><Big v={fmtTime(secs)} size={56} /></View>
          <PerfB_TimeInput label="Temps" m={t.m} s={t.s} onChange={(v) => setT({ m: v.m, s: v.s })} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Text style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>Time cap (min, optionnel)</Text><PerfB_Num value={cap} onChange={setCap} ph="—" w={80} suffix="min" max={2} /></View>
        </>
      ) : (
        <>
          <View style={{ alignItems: "center", paddingVertical: 6 }}><Big v={`${rounds || 0}${reps ? ` + ${reps}` : ""}`} unit={format === "amrap" ? "tours" : "reps"} size={56} /></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>{format === "amrap" ? "Tours complets" : "Tours / minutes"}</Text>
            <PerfB_Num value={rounds} onChange={setRounds} ph="0" w={80} suffix="tours" max={3} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>{format === "amrap" ? "Reps en plus" : "Reps totales"}</Text>
            <PerfB_Num value={reps} onChange={setReps} ph="0" w={80} suffix="reps" max={4} />
          </View>
        </>
      )}
      <PerfB_SettingRow label="Rx" sub="charges et mouvements prescrits, sans adaptation" right={<Toggle on={rx} onChange={setRx} />} />
      <Field label="Mouvements" value={moves} onChange={setMoves} placeholder="21-15-9 thrusters 43 kg · tractions" />
      <Field label="Note (optionnel)" value={note} onChange={setNote} placeholder="Sensations, stratégie…" />
      {err ? <Text style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center" }}>{err}</Text> : null}
      <Btn label="Enregistrer le WOD" icon="check" onPress={save} />
      <View style={{ height: 100 }} />
    </Page>
  );
}
