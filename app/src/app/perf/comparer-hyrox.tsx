import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pill, Big, Sub, Seg, Logo, PerfB_Empty, PerfB_CmpRow, PerfB_TableHead, PerfB_Delta, perfB_date, PERFB_STATION_PHOTO } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, HYROX_STATIONS, hyroxTotal, fmtTime, HyroxSim } from "../../store/activities";

const DIV: Record<HyroxSim["division"], string> = { open: "Open", pro: "Pro", doubles: "Doubles", relais: "Relais" };
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

/** R10 · Comparer deux simulations Hyrox */
export default function ComparerHyrox() {
  const { hyrox } = useActivities();
  const [ia, setIa] = useState(0); const [ib, setIb] = useState(1); const [seg, setSeg] = useState(0);
  const A = hyrox[ia], B = hyrox[ib];
  if (hyrox.length < 2 || !A || !B) {
    return (
      <Page>
        <Top title="Comparer" sub="deux simulations Hyrox" onBack={() => router.back()} />
        <PerfB_Empty title="Il faut deux simulations" text={hyrox.length === 1 ? "Tu en as une. Saisis-en une deuxième pour les comparer station par station." : "Saisis au moins deux simulations Hyrox pour voir où tu as gagné ou perdu du temps."} action="Saisir une simulation" onPress={() => router.push("/perf/saisie-hyrox")} />
      </Page>
    );
  }
  const tA = hyroxTotal(A), tB = hyroxTotal(B);
  const rows: { name: string; photo: keyof typeof PERFB_STATION_PHOTO; a: number; b: number }[] = [];
  HYROX_STATIONS.forEach((s, i) => { if (seg === 2) rows.push({ name: `Course ${i + 1} km`, photo: "run", a: A.runs[i], b: B.runs[i] }); if (seg !== 1) rows.push({ name: s.name, photo: s.id, a: A.stations[i], b: B.stations[i] }); });
  if (seg === 1) HYROX_STATIONS.forEach((_, i) => rows.push({ name: `Course ${i + 1} km`, photo: "run", a: A.runs[i], b: B.runs[i] }));
  const pick = (which: "a" | "b") => (
    <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
      {hyrox.map((h, i) => <Pill key={h.id} label={perfB_date(h.at)} on={(which === "a" ? ia : ib) === i} onPress={() => (which === "a" ? (setIa(i), i === ib && setIb(ia)) : (setIb(i), i === ia && setIa(ib)))} />)}
    </View>
  );
  return (
    <Page>
      <Top left={<Pressable onPress={() => router.back()}><Logo name="hyrox" size={40} /></Pressable>} title="Comparer" sub={`Hyrox · ${perfB_date(A.at)} vs ${perfB_date(B.at)}`} right={<Circ icon="share" size={38} onPress={() => Share.share({ message: `Hyrox ${perfB_date(A.at)} : ${fmtTime(tA)} vs ${perfB_date(B.at)} : ${fmtTime(tB)} (${tA - tB < 0 ? "−" : "+"}${fmtTime(Math.abs(tA - tB))}) #IRONX` })} />} />
      <View style={{ gap: 6 }}><Sub>Simulation A</Sub>{pick("a")}</View>
      <View style={{ gap: 6 }}><Sub>Simulation B</Sub>{pick("b")}</View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 4 }}>
          <Sub>temps total · {perfB_date(A.at)}</Sub>
          <Big v={fmtTime(tA)} size={48} />
          <Sub><PerfB_Delta d={tA - tB} size={13} /> · simulation {A.partial ? "partielle" : "complète"} · {DIV[A.division]}</Sub>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <Sub>{perfB_date(B.at)}</Sub>
          <Text style={{ fontFamily: man(700), fontSize: 24, letterSpacing: -0.5, color: C.soft }}>{fmtTime(tB)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {[["Stations", sum(A.stations), sum(B.stations)], ["Courses", sum(A.runs), sum(B.runs)], ["Roxzone", A.roxzone ?? 0, B.roxzone ?? 0]].map(([k, a, b], i) => (
          <View key={String(k)} style={{ gap: 2, alignItems: i === 0 ? "flex-start" : "center" }}>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{k}</Text>
            <Text style={{ fontFamily: man(700), fontSize: 17, letterSpacing: -0.3, color: C.txt }}>{fmtTime(a as number)}</Text>
            <PerfB_Delta d={(a as number) - (b as number)} size={11} />
          </View>
        ))}
        <View style={{ gap: 2, alignItems: "flex-end" }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>FC moy.</Text>
          <Text style={{ fontFamily: man(700), fontSize: 17, letterSpacing: -0.3, color: C.txt }}>{A.hr ?? "—"}</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{B.hr ? `vs ${B.hr}` : ""}</Text>
        </View>
      </View>
      <Seg items={["Stations", "Courses", "Tout"]} on={seg} onChange={setSeg} />
      <PerfB_TableHead a={perfB_date(B.at)} b={perfB_date(A.at)} />
      {rows.map((r, i) => <PerfB_CmpRow key={i} photo={PERFB_STATION_PHOTO[r.photo]} name={r.name} a={r.b > 0 ? fmtTime(r.b) : "—"} b={r.a > 0 ? fmtTime(r.a) : "—"} d={r.a > 0 && r.b > 0 ? r.a - r.b : undefined} />)}
      <Sub>Écart = A − B : en vert quand A est plus rapide.</Sub>
    </Page>
  );
}
