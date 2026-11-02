import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Seg, Pills, Field, Btn, Sub, H2, Divider, KV, PerfB_TimeInput, perfB_secs, perfB_split } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { act, fmtPace, fmtTime, Run } from "../../store/activities";

const SPORTS: Run["sport"][] = ["course", "velo", "natation"];
const KINDS: NonNullable<Run["kind"]>[] = ["endurance", "fractionne", "seuil", "sortie longue", "course", "recup"];
const KIND_LABEL: Record<string, string> = { endurance: "Endurance", fractionne: "Fractionné", seuil: "Seuil", "sortie longue": "Sortie longue", course: "Course", recup: "Récup" };
type MS = { m: string; s: string };
const num = (v: string) => parseFloat(v.replace(",", ".")) || 0;

/** Saisie d'une sortie (course / vélo / natation) avec splits et fractionné */
export default function SaisieCourse() {
  const [sport, setSport] = useState(0); const [kind, setKind] = useState(0); const [day, setDay] = useState(0);
  const [dist, setDist] = useState(""); const [t, setT] = useState({ h: "", m: "", s: "" });
  const [hr, setHr] = useState(""); const [hrMax, setHrMax] = useState(""); const [elev, setElev] = useState(""); const [name, setName] = useState(""); const [note, setNote] = useState("");
  const [splits, setSplits] = useState<MS[] | null>(null);
  const [nRep, setNRep] = useState("8"); const [dRep, setDRep] = useState("400"); const [reps, setReps] = useState<MS[]>([]); const [rest, setRest] = useState({ m: "1", s: "30" });
  const [err, setErr] = useState("");
  const isNat = SPORTS[sport] === "natation"; const isFrac = KINDS[kind] === "fractionne";
  const distM = num(dist) * (isNat ? 1 : 1000); const dur = perfB_secs(t.h, t.m, t.s);
  const paceS = distM > 0 && dur > 0 ? dur / (distM / 1000) : 0;
  const splitUnit = isNat ? 100 : 1000; const nSplits = Math.max(0, Math.min(60, Math.round(distM / splitUnit)));
  const genSplits = () => { if (!nSplits || !dur) { setErr("Renseigne d'abord la distance et le temps."); return; } const per = dur / (distM / splitUnit); setSplits(Array.from({ length: nSplits }, () => { const x = perfB_split(per); return { m: x.m, s: x.s }; })); setErr(""); };
  const genReps = () => { const n = Math.max(1, Math.min(30, parseInt(nRep) || 0)); const per = dur && n ? dur / n : 0; setReps(Array.from({ length: n }, (_, i) => reps[i] ?? (per ? { m: String(Math.floor(per / 60)), s: String(Math.round(per % 60)) } : { m: "", s: "" }))); };
  const repsTotal = reps.reduce((a, r) => a + perfB_secs(undefined, r.m, r.s), 0);
  const save = () => {
    const d = isFrac && reps.length ? Math.max(distM, (parseInt(nRep) || 0) * num(dRep)) : distM;
    const duration = isFrac && reps.length && !dur ? repsTotal : dur;
    if (d <= 0) { setErr("Indique la distance."); return; } if (duration <= 0) { setErr("Indique le temps total."); return; }
    const at = Date.now() - day * 86400e3;
    act.addRun({ sport: SPORTS[sport], kind: KINDS[kind], at, distance: d, duration, hr: parseInt(hr) || undefined, hrMax: parseInt(hrMax) || undefined, elev: parseInt(elev) || undefined, name: name.trim() || undefined, note: note.trim() || undefined,
      splits: splits?.length ? splits.map((x) => perfB_secs(undefined, x.m, x.s)) : undefined,
      intervals: isFrac && reps.length ? { n: reps.length, dist: num(dRep), times: reps.map((x) => perfB_secs(undefined, x.m, x.s)), rest: perfB_secs(undefined, rest.m, rest.s) } : undefined });
    router.back();
  };
  return (
    <Page>
      <Top title="Nouvelle sortie" sub={paceS ? `${isNat ? `${fmtTime(paceS / 10)} /100 m` : SPORTS[sport] === "velo" ? `${(distM / 1000 / (dur / 3600)).toFixed(1).replace(".", ",")} km/h` : fmtPace(paceS)} · ${fmtTime(dur)}` : "renseigne au moins la distance et le temps"} onBack={() => router.back()} />
      <Seg items={["Course", "Vélo", "Natation"]} on={sport} onChange={setSport} />
      <Pills items={KINDS.map((k) => KIND_LABEL[k])} on={kind} onChange={setKind} />
      <Seg items={["Aujourd'hui", "Hier", "Avant-hier"]} on={day} onChange={setDay} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label={isNat ? "Distance (m)" : "Distance (km)"} value={dist} onChange={(v) => setDist(v.replace(/[^0-9.,]/g, ""))} keyboard="decimal-pad" placeholder={isNat ? "1500" : "10,0"} /></View>
        <View style={{ flex: 1 }}><Field label="Dénivelé (m, optionnel)" value={elev} onChange={(v) => setElev(v.replace(/[^0-9]/g, ""))} keyboard="number-pad" placeholder="0" /></View>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Temps total</Text>
        <PerfB_TimeInput h={t.h} m={t.m} s={t.s} hours onChange={(v) => setT({ h: v.h ?? "", m: v.m, s: v.s })} />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="FC moyenne (optionnel)" value={hr} onChange={(v) => setHr(v.replace(/[^0-9]/g, ""))} keyboard="number-pad" placeholder="—" /></View>
        <View style={{ flex: 1 }}><Field label="FC max (optionnel)" value={hrMax} onChange={(v) => setHrMax(v.replace(/[^0-9]/g, ""))} keyboard="number-pad" placeholder="—" /></View>
      </View>
      <Field label="Nom (optionnel)" value={name} onChange={setName} placeholder={isFrac ? "8 × 400 m piste" : "Sortie du matin"} />
      <Field label="Note (optionnel)" value={note} onChange={setNote} placeholder="Sensations, météo, chaussures…" />

      {isFrac ? (
        <>
          <Divider />
          <H2>Fractionné</H2>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Nombre de reps" value={nRep} onChange={(v) => setNRep(v.replace(/[^0-9]/g, ""))} keyboard="number-pad" /></View>
            <View style={{ flex: 1 }}><Field label="Distance par rep (m)" value={dRep} onChange={(v) => setDRep(v.replace(/[^0-9]/g, ""))} keyboard="number-pad" /></View>
          </View>
          <View style={{ gap: 6 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Récupération entre les reps</Text><PerfB_TimeInput m={rest.m} s={rest.s} onChange={(v) => setRest({ m: v.m, s: v.s })} /></View>
          {!reps.length ? <Btn label="Saisir le temps de chaque rep" kind="secondary" size="md" icon="plus" onPress={genReps} /> : (
            <>
              {reps.map((r, i) => <PerfB_TimeInput key={i} label={`Rep ${i + 1} · ${dRep} m`} m={r.m} s={r.s} onChange={(v) => setReps((a) => a.map((x, j) => (j === i ? { m: v.m, s: v.s } : x)))} />)}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <KV k="Total des reps" v={fmtTime(repsTotal)} /><KV k="Moyenne" v={reps.length ? fmtTime(repsTotal / reps.length) : "—"} align="center" />
                <Pressable onPress={genReps}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>Régénérer</Text></Pressable>
              </View>
            </>
          )}
        </>
      ) : null}

      {(
        <>
          <Divider />
          <H2 action={splits ? "Retirer" : undefined} onAction={() => setSplits(null)}>{isNat ? "Splits par 100 m" : "Splits par km"} <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>(optionnel)</Text></H2>
          {!splits ? <Btn label={isNat ? "Ajouter les 100 m" : "Ajouter les km"} kind="secondary" size="md" icon="plus" onPress={genSplits} /> : (
            <>
              <Sub>Pré-remplis à l'allure moyenne : corrige ceux qui diffèrent.</Sub>
              {splits.map((x, i) => <PerfB_TimeInput key={i} label={isNat ? `${(i + 1) * 100} m` : `km ${i + 1}`} m={x.m} s={x.s} onChange={(v) => setSplits((a) => a!.map((y, j) => (j === i ? { m: v.m, s: v.s } : y)))} />)}
            </>
          )}
        </>
      )}

      {err ? <Text style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center" }}>{err}</Text> : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Distance" v={distM ? (isNat ? `${Math.round(distM)} m` : `${(distM / 1000).toFixed(1).replace(".", ",")} km`) : "—"} /><KV k="Temps" v={dur ? fmtTime(dur) : "—"} align="center" /><KV k="Allure" v={paceS ? (isNat ? `${fmtTime(paceS / 10)} /100 m` : fmtPace(paceS)) : "—"} align="flex-end" />
      </View>
      <Btn label="Enregistrer la sortie" icon="check" onPress={save} />
      <View style={{ height: 120 }} />
    </Page>
  );
}
