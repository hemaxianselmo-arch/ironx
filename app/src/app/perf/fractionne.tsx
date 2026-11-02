import React, { useState } from "react";
import { View, Text, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Big, Sub, Bars, Btn, KV, PerfB_Empty, PerfB_Delta, perfB_date } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, fmtTime, Run } from "../../store/activities";

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const fmtRep = (r: Run) => `${r.intervals!.n} × ${r.intervals!.dist >= 1000 ? `${r.intervals!.dist / 1000} km` : `${r.intervals!.dist} m`}`;

/** R13 · Fractionné : moyenne par rep, dérive, barres par rep, comparaison avec la séance précédente de même format */
export default function Fractionne() {
  const { runs } = useActivities();
  const sessions = runs.filter((r) => r.kind === "fractionne" && r.intervals && r.intervals.times.length);
  const [sel, setSel] = useState(0);
  const cur = sessions[sel];
  if (!cur) {
    return (
      <Page>
        <Top title="Fractionné" onBack={() => router.back()} />
        <PerfB_Empty title="Aucune séance de fractionné" text="Saisis une sortie de type fractionné avec le temps de chaque répétition pour voir ta régularité et ta dérive." action="Saisir une sortie" onPress={() => router.push("/perf/saisie-course")} icon="run" />
      </Page>
    );
  }
  const times = cur.intervals!.times; const n = times.length;
  const prev = sessions.find((s) => s.at < cur.at && s.intervals!.n === cur.intervals!.n && s.intervals!.dist === cur.intervals!.dist);
  const mean = avg(times); const prevMean = prev ? avg(prev.intervals!.times) : undefined;
  const half = Math.floor(n / 2); const drift = half ? ((avg(times.slice(n - half)) - avg(times.slice(0, half))) / avg(times.slice(0, half))) * 100 : 0;
  const slowest = times.indexOf(Math.max(...times));
  return (
    <Page>
      <Top title="Fractionné" sub={`${fmtRep(cur)} · ${perfB_date(cur.at)}${prev ? ` vs ${perfB_date(prev.at)}` : ""}`} onBack={() => router.back()} right={<Circ icon="share" size={38} onPress={() => Share.share({ message: `Fractionné ${fmtRep(cur)} : ${fmtTime(mean)} de moyenne par rep #IRONX` })} />} />
      {sessions.length > 1 ? <Pills items={sessions.map((s) => `${perfB_date(s.at)} · ${fmtRep(s)}`)} on={sel} onChange={setSel} /> : null}
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 4 }}>
          <Sub>moyenne par {cur.intervals!.dist >= 1000 ? `${cur.intervals!.dist / 1000} km` : `${cur.intervals!.dist} m`}</Sub>
          <Big v={fmtTime(mean)} size={52} />
          <Sub>{prevMean != null ? <><PerfB_Delta d={mean - prevMean} size={13} /> par rep · </> : null}récup {fmtTime(cur.intervals!.rest)} · dérive <Text style={{ fontFamily: inter(600), color: drift > 5 ? C.red : drift > 2 ? C.orange : C.green }}>{drift >= 0 ? "+" : "−"}{Math.abs(drift).toFixed(0)} %</Text></Sub>
        </View>
        <KV k="Dernière rep" v={fmtTime(times[n - 1])} align="flex-end" />
      </View>
      <Bars vals={times} labels={times.map((_, i) => String(i + 1))} h={120} hl={slowest} />
      <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        {[[C.accent, "rep la plus lente"], ["rgba(255,255,255,0.14)", perfB_date(cur.at)], ...(prev ? [[C.orange, `plus lent qu'avant (${perfB_date(prev.at)})`]] : [])].map(([c, l]) => <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c }} /><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{l}</Text></View>)}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 4 }}>
        <Text style={{ width: 54, textAlign: "right", fontFamily: inter(700), fontSize: 11, color: C.accent }}>{perfB_date(cur.at)}</Text>
        <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 11, color: C.mut }}>{prev ? perfB_date(prev.at) : ""}</Text>
        <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 11, color: C.mut }}>écart</Text>
      </View>
      {times.map((t, i) => { const pt = prev?.intervals!.times[i]; return (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: i === slowest ? C.accent : "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: inter(700), fontSize: 12, color: i === slowest ? "#fff" : C.txt }}>{i + 1}</Text></View>
          <Text style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>{cur.intervals!.dist} m{cur.hr ? ` · FC ${cur.hr}` : ""}</Text>
          <Text style={{ width: 54, textAlign: "right", fontFamily: man(700), fontSize: 15, color: pt != null && t > pt ? C.orange : C.txt }}>{fmtTime(t)}</Text>
          <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 13, color: C.mut }}>{pt != null ? fmtTime(pt) : "—"}</Text>
          <View style={{ width: 54, alignItems: "flex-end" }}>{pt != null ? <PerfB_Delta d={t - pt} /> : <Text style={{ color: C.mut }}>—</Text>}</View>
        </View>
      ); })}
      {cur.hr ? <Sub>FC = moyenne de la séance{cur.hrMax ? ` · max ${cur.hrMax}` : ""}.</Sub> : null}
      <Btn label="Saisir une sortie" icon="plus" kind="secondary" onPress={() => router.push("/perf/saisie-course")} />
    </Page>
  );
}
