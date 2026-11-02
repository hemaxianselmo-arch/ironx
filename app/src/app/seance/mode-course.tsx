import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { Page, Top, Big, Label, Btn, Seg, Pills, KV, Mono, Surf, Sub, Field, Bars } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { act, fmtTime, fmtPace, Run } from "../../store/activities";
import { useProfile } from "../../store/profile";

const KINDS: Run["kind"][] = ["endurance", "fractionne", "seuil", "sortie longue", "course", "recup"];
const KIND_LABEL = ["Endurance", "Fractionné", "Seuil", "Sortie longue", "Course", "Récup"];
/** Mode course / vélo / natation : chrono, tours (km ou 100 m), allure en direct, enregistrement */
export default function ModeCourse() {
  useKeepAwake();
  const p = useProfile();
  const [sport, setSport] = useState(0); const [kind, setKind] = useState(0);
  const [running, setRunning] = useState(false); const [elapsed, setElapsed] = useState(0); const [laps, setLaps] = useState<number[]>([]);
  const [lapDist, setLapDist] = useState(1000); const [hr, setHr] = useState(""); const [done, setDone] = useState(false); const [extra, setExtra] = useState("");
  const startRef = useRef(0); const accRef = useRef(0);
  useEffect(() => { if (!running) return; const t = setInterval(() => setElapsed(accRef.current + Date.now() - startRef.current), 200); return () => clearInterval(t); }, [running]);
  const sportKey = (["course", "velo", "natation"] as const)[sport];
  useEffect(() => { setLapDist(sport === 2 ? 100 : 1000); }, [sport]);
  const toggle = () => { if (running) { accRef.current += Date.now() - startRef.current; setRunning(false); } else { startRef.current = Date.now(); setRunning(true); } };
  const lap = () => { const t = elapsed / 1000; const prev = laps.reduce((a, b) => a + b, 0); setLaps([...laps, t - prev]); };
  const totalS = elapsed / 1000; const dist = laps.length * lapDist + (parseFloat(extra.replace(",", ".")) || 0) * (sport === 2 ? 100 : 1000);
  const curLap = totalS - laps.reduce((a, b) => a + b, 0);
  const paceNow = laps.length ? laps[laps.length - 1] / (lapDist / 1000) : 0;
  const save = () => {
    if (dist <= 0 || totalS <= 0) return;
    act.addRun({ sport: sportKey, at: Date.now() - elapsed, distance: Math.round(dist), duration: Math.round(totalS), splits: laps.length ? laps.map((x) => Math.round(x)) : undefined, hr: parseInt(hr) || undefined, kind: KINDS[kind], name: `${KIND_LABEL[kind]} · ${(dist / 1000).toFixed(1).replace(".", ",")} km` });
    router.replace("/perf/course");
  };
  return (
    <Page>
      <Top title={["Course", "Vélo", "Natation"][sport]} sub="chrono et tours · tout est enregistré dans Performances" onBack={() => router.back()} />
      {!running && !laps.length && !elapsed ? <><Seg items={["Course", "Vélo", "Natation"]} on={sport} onChange={setSport} /><Pills items={KIND_LABEL} on={kind} onChange={setKind} /></> : null}
      <View style={{ alignItems: "center", gap: 2, paddingVertical: 10 }}>
        <Label>temps</Label>
        <Text style={{ fontFamily: man(800), fontSize: 64, letterSpacing: -1, color: C.txt }}>{fmtTime(totalS)}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{sport === 2 ? "100 m" : "km"} en cours · {fmtTime(curLap)}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Distance" v={`${(dist / 1000).toFixed(sport === 2 ? 2 : 1).replace(".", ",")} km`} strong />
        <KV k={sport === 2 ? "Allure /100 m" : "Allure"} v={sport === 2 ? (laps.length ? fmtTime(laps[laps.length - 1]) : "—") : fmtPace(paceNow)} strong />
        <KV k="Moy." v={dist > 0 ? (sport === 2 ? fmtTime(totalS / (dist / 100)) : fmtPace(totalS / (dist / 1000))) : "—"} strong />
        <KV k="Tours" v={String(laps.length)} strong />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Btn label={running ? "Pause" : elapsed ? "Reprendre" : "Démarrer"} kind={running ? "secondary" : "primary"} icon={running ? "pause" : "play"} onPress={toggle} /></View>
        <View style={{ flex: 1 }}><Btn label={`Tour ${sport === 2 ? "100 m" : "1 km"}`} kind="white" icon="timer" onPress={lap} /></View>
      </View>
      {laps.length ? <Surf><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Tours</Text><Bars vals={laps} labels={laps.map((_, i) => String(i + 1))} w={326} h={80} hl={laps.indexOf(Math.max(...laps))} />{laps.map((l, i) => <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.soft }}>{sport === 2 ? `${(i + 1) * 100} m` : `km ${i + 1}`}</Text><Mono size={14}>{fmtTime(l)}</Mono></View>)}</Surf> : null}
      {elapsed && !running ? (
        <Surf>
          <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Terminer la sortie</Text>
          <Field label={`Distance supplémentaire après le dernier tour (${sport === 2 ? "× 100 m" : "km"}, ex. 0,4)`} value={extra} onChange={setExtra} keyboard="decimal-pad" placeholder="0" />
          <Field label="FC moyenne (optionnel)" value={hr} onChange={setHr} keyboard="number-pad" placeholder="—" />
          <Btn label="Enregistrer la sortie" icon="check" onPress={save} />
          <Text onPress={() => router.back()} style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center", padding: 6 }}>Abandonner sans enregistrer</Text>
        </Surf>
      ) : <Sub>Appuie sur « Tour » à chaque {sport === 2 ? "100 m" : "kilomètre"} : l'allure se calcule toute seule. Mets en pause pour terminer et enregistrer.</Sub>}
      <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut, textAlign: "center" }}>Le suivi GPS automatique arrivera dans une prochaine version ; tu peux aussi saisir une sortie après coup dans Performances → Course.</Text>
    </Page>
  );
}
