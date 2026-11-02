import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { Page, Top, Label, Btn, Seg, KV, Mono, Surf, Sub, Icon, Toggle } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { act, fmtTime, fmtSigned, HYROX_STATIONS, bestStations } from "../../store/activities";

/** Les 16 segments officiels : course 1 km puis station, × 8 */
const SEGMENTS = HYROX_STATIONS.flatMap((s, i) => [{ kind: "run" as const, i, name: `Course ${i + 1} · 1 km` }, { kind: "station" as const, i, name: s.name }]);
/** Mode Hyrox : chrono global, un bouton « segment suivant » qui enregistre le temps de chaque course et station */
export default function ModeHyrox() {
  useKeepAwake();
  const [division, setDivision] = useState(0);
  const [running, setRunning] = useState(false); const [elapsed, setElapsed] = useState(0); const [times, setTimes] = useState<number[]>([]);
  const [roxzone, setRoxzone] = useState(true);
  const startRef = useRef(0); const accRef = useRef(0);
  useEffect(() => { if (!running) return; const t = setInterval(() => setElapsed(accRef.current + Date.now() - startRef.current), 200); return () => clearInterval(t); }, [running]);
  const best = bestStations();
  const toggle = () => { if (running) { accRef.current += Date.now() - startRef.current; setRunning(false); } else { startRef.current = Date.now(); setRunning(true); } };
  const totalS = elapsed / 1000; const segDone = times.reduce((a, b) => a + b, 0); const curSeg = totalS - segDone;
  const idx = times.length; const finished = idx >= SEGMENTS.length;
  const next = () => { if (finished) return; setTimes([...times, curSeg]); };
  const undo = () => setTimes(times.slice(0, -1));
  const save = (partial: boolean) => {
    const stations = HYROX_STATIONS.map((_, i) => Math.round(times[i * 2 + 1] ?? 0)); const runs = HYROX_STATIONS.map((_, i) => Math.round(times[i * 2] ?? 0));
    const rz = roxzone && !partial ? Math.round(Math.max(0, totalS - stations.reduce((a, b) => a + b, 0) - runs.reduce((a, b) => a + b, 0))) : 0;
    act.addHyrox({ at: Date.now() - elapsed, division: (["open", "pro", "doubles", "relais"] as const)[division], stations, runs, roxzone: rz || undefined, partial, name: partial ? "Simulation partielle" : "Simulation complète" });
    router.replace("/perf/endurance");
  };
  const seg = SEGMENTS[Math.min(idx, SEGMENTS.length - 1)];
  const refBest = seg.kind === "station" ? best[seg.i] : undefined;
  return (
    <Page>
      <Top title="Hyrox" sub="8 courses · 8 stations · au chrono" onBack={() => router.back()} />
      {!elapsed ? <Seg items={["Open", "Pro", "Doubles", "Relais"]} on={division} onChange={setDivision} /> : null}
      <View style={{ alignItems: "center", gap: 2, paddingVertical: 6 }}>
        <Label>temps total</Label>
        <Text style={{ fontFamily: man(800), fontSize: 60, letterSpacing: -1, color: C.txt }}>{fmtTime(totalS)}</Text>
      </View>
      <Surf style={{ backgroundColor: finished ? C.surf : seg.kind === "run" ? C.surf : "rgba(235,27,63,0.14)" }}>
        <Text style={{ fontFamily: inter(600), fontSize: 12, color: C.mut }}>{finished ? "Terminé" : `Segment ${idx + 1} / 16 · ${seg.kind === "run" ? "course" : "station"}`}</Text>
        <Text style={{ fontFamily: man(700), fontSize: 24, color: C.txt }}>{finished ? "Simulation complète" : seg.name}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Ce segment" v={fmtTime(finished ? 0 : curSeg)} strong />
          <KV k="Ton meilleur" v={refBest ? fmtTime(refBest) : "—"} />
          <KV k="Écart" v={refBest && !finished ? fmtSigned(curSeg - refBest) : "—"} />
        </View>
      </Surf>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Btn label={running ? "Pause" : elapsed ? "Reprendre" : "Démarrer"} kind={running ? "secondary" : "primary"} icon={running ? "pause" : "play"} onPress={toggle} /></View>
        <View style={{ flex: 1.3 }}><Btn label={finished ? "Terminé" : idx === SEGMENTS.length - 1 ? "Franchir la ligne" : "Segment suivant"} kind="white" icon="chev" onPress={next} /></View>
      </View>
      {times.length ? (
        <Surf>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Segments passés</Text><Pressable onPress={undo}><Text style={{ fontFamily: inter(600), fontSize: 12, color: C.accent }}>Annuler le dernier</Text></Pressable></View>
          {times.map((t, i) => { const s = SEGMENTS[i]; const b = s.kind === "station" ? best[s.i] : undefined; return (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: s.kind === "run" ? "rgba(255,255,255,0.1)" : C.accent, alignItems: "center", justifyContent: "center" }}><Icon name={s.kind === "run" ? "run" : "bolt"} size={12} color="#fff" w={2.5} /></View>
              <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 13, color: C.soft }}>{s.name}</Text>
              {b ? <Text style={{ fontFamily: inter(500), fontSize: 12, color: t <= b ? C.green : C.red }}>{fmtSigned(t - b)}</Text> : null}
              <Mono size={14}>{fmtTime(t)}</Mono>
            </View>); })}
        </Surf>
      ) : <Sub>Appuie sur « Segment suivant » à chaque fin de course et de station. Le Roxzone (transitions) se déduit automatiquement.</Sub>}
      {elapsed && !running ? (
        <Surf>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(500), fontSize: 13, color: C.txt }}>Compter le Roxzone (transitions)</Text><Toggle on={roxzone} onChange={setRoxzone} /></View>
          <Btn label={finished ? "Enregistrer la simulation" : "Enregistrer (partielle)"} icon="check" onPress={() => save(!finished)} />
          <Text onPress={() => router.back()} style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center", padding: 6 }}>Abandonner sans enregistrer</Text>
        </Surf>
      ) : null}
    </Page>
  );
}
