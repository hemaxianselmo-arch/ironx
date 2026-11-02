import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Seg, Pills, Field, Btn, Sub, H2, Divider, Big, KV, Toggle, PerfB_TimeInput, PerfB_SettingRow, PerfB_Thumb, perfB_secs, PERFB_STATION_PHOTO } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { act, HYROX_STATIONS, HyroxSim, fmtTime } from "../../store/activities";

type MS = { m: string; s: string };
const DIVS: HyroxSim["division"][] = ["open", "pro", "doubles", "relais"];
const empty = (): MS[] => Array.from({ length: 8 }, () => ({ m: "", s: "" }));

/** Saisie d'une simulation Hyrox : 8 courses + 8 stations dans l'ordre officiel, total en direct */
export default function SaisieHyrox() {
  const [dayI, setDayI] = useState(0); const [dateTxt, setDateTxt] = useState(""); const [div, setDiv] = useState(0);
  const [runs, setRuns] = useState<MS[]>(empty); const [st, setSt] = useState<MS[]>(empty);
  const [rox, setRox] = useState<MS>({ m: "", s: "" }); const [hr, setHr] = useState(""); const [name, setName] = useState(""); const [note, setNote] = useState("");
  const [partial, setPartial] = useState(false); const [err, setErr] = useState("");
  const runS = runs.map((x) => perfB_secs(undefined, x.m, x.s)); const stS = st.map((x) => perfB_secs(undefined, x.m, x.s)); const roxS = perfB_secs(undefined, rox.m, rox.s);
  const total = runS.reduce((a, b) => a + b, 0) + stS.reduce((a, b) => a + b, 0) + roxS;
  const filled = runS.filter(Boolean).length + stS.filter(Boolean).length;
  const dateAt = () => { if (dayI < 2) return Date.now() - dayI * 86400e3; const m = dateTxt.match(/^(\d{1,2})\/(\d{1,2})$/); if (!m) return undefined; const d = new Date(); d.setMonth(parseInt(m[2]) - 1, parseInt(m[1])); d.setHours(12, 0, 0, 0); if (d.getTime() > Date.now()) d.setFullYear(d.getFullYear() - 1); return d.getTime(); };
  const save = () => {
    const at = dateAt(); if (!at) { setErr("Date au format JJ/MM."); return; }
    if (!partial && filled < 16) { setErr(`Il manque ${16 - filled} temps. Active « simulation partielle » si tu n'as pas tout fait.`); return; }
    if (!filled) { setErr("Renseigne au moins un temps."); return; }
    act.addHyrox({ at, division: DIVS[div], stations: stS, runs: runS, roxzone: roxS || undefined, hr: parseInt(hr) || undefined, name: name.trim() || undefined, note: note.trim() || undefined, partial: partial || filled < 16 });
    router.back();
  };
  const setRun = (i: number, v: MS) => setRuns((a) => a.map((x, j) => (j === i ? v : x))); const setSta = (i: number, v: MS) => setSt((a) => a.map((x, j) => (j === i ? v : x)));
  return (
    <Page>
      <Top title="Simulation Hyrox" sub="ordre officiel : course puis station, 8 fois" onBack={() => router.back()} />
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}><Sub>temps total</Sub><Big v={fmtTime(total)} size={48} /></View>
        <KV k="Temps saisis" v={`${filled} / 16`} align="flex-end" />
      </View>
      <Pills items={["Aujourd'hui", "Hier", "Autre date"]} on={dayI} onChange={setDayI} />
      {dayI === 2 ? <Field label="Date (JJ/MM)" value={dateTxt} onChange={(v) => setDateTxt(v.replace(/[^0-9/]/g, "").slice(0, 5))} keyboard="numbers-and-punctuation" placeholder="26/10" /> : null}
      <Seg items={["Open", "Pro", "Doubles", "Relais"]} on={div} onChange={setDiv} />
      <Divider />
      {HYROX_STATIONS.map((s, i) => (
        <View key={s.id} style={{ gap: 8 }}>
          <PerfB_TimeInput label={`Course ${i + 1} · 1 km`} m={runs[i].m} s={runs[i].s} onChange={(v) => setRun(i, { m: v.m, s: v.s })} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <PerfB_Thumb photo={PERFB_STATION_PHOTO[s.id]} size={34} />
            <View style={{ flex: 1 }}><PerfB_TimeInput label={s.name} m={st[i].m} s={st[i].s} onChange={(v) => setSta(i, { m: v.m, s: v.s })} /></View>
          </View>
          {i < 7 ? <Divider /> : null}
        </View>
      ))}
      <Divider />
      <H2>Compléments</H2>
      <PerfB_TimeInput label="Roxzone (transitions)" m={rox.m} s={rox.s} onChange={(v) => setRox({ m: v.m, s: v.s })} />
      <Field label="FC moyenne (optionnel)" value={hr} onChange={(v) => setHr(v.replace(/[^0-9]/g, ""))} keyboard="number-pad" placeholder="—" />
      <Field label="Nom (optionnel)" value={name} onChange={setName} placeholder="Simulation salle, Hyrox Paris…" />
      <Field label="Note (optionnel)" value={note} onChange={setNote} placeholder="Charges, sensations…" />
      <PerfB_SettingRow label="Simulation partielle" sub="les stations ou courses manquantes comptent 0 et n'entrent pas dans ta meilleure simulation" right={<Toggle on={partial} onChange={setPartial} />} />
      {err ? <Text style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center" }}>{err}</Text> : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Stations" v={fmtTime(stS.reduce((a, b) => a + b, 0))} /><KV k="Courses" v={fmtTime(runS.reduce((a, b) => a + b, 0))} align="center" /><KV k="Total" v={fmtTime(total)} strong align="flex-end" />
      </View>
      <Btn label="Enregistrer la simulation" icon="check" onPress={save} />
      <View style={{ height: 120 }} />
    </Page>
  );
}
