import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Sub, H2, Radar, Ring, Btn, Logo, PerfB_Empty, PerfB_Advice, PerfB_Delta, PERFB_STATION_PHOTO, perfB_date } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, HYROX_STATIONS, bestStations, predictHyrox, fmtTime, bestHyrox, hyroxTotal } from "../../store/activities";

const REF = [240, 180, 240, 300, 250, 120, 270, 400]; // temps de référence par station (s)
const REF_TOTAL = REF.reduce((a, b) => a + b, 0);
const OBJ = [["1:10", 4200], ["1:20", 4800], ["1:30", 5400], ["1:45", 6300], ["2:00", 7200]] as const;
const ADVICE: Record<string, string> = {
  skierg: "intervalles 8 × 250 m à allure cible, récup 1 min · travaille la poussée des jambes",
  "sled-push": "sled lourd 4 × 25 m, puis 2 × 50 m à charge de course · pas courts et rapides",
  "sled-pull": "tirage lourd (rowing barre, sled pull 4 × 25 m) · 2 séances / sem. de tirage",
  burpee: "technique : saut long + enchaînement sans pause · séries de 20 à rythme régulier",
  rowing: "intervalles 5 × 400 m à allure cible · cadence 28-30, jambes puis bras",
  farmers: "grip : farmers lourd 4 × 100 m sans poser · suspension à la barre 3 × 45 s",
  lunges: "fentes sandbag 4 × 50 m · gainage et quadris, pas longs",
  wallballs: "séries de 25 sans pause, 4 fois · casse ton rythme après 60 reps",
};

/** R11 · Points faibles Hyrox : radar toi vs allure objectif, à travailler, prédiction */
export default function RadarHyrox() {
  const { goals } = useActivities();
  const goal = goals.find((g) => g.kind === "hyrox" && !g.done);
  const [objI, setObjI] = useState(() => { const t = goal?.to ?? 5400; let k = 2; OBJ.forEach(([, v], i) => { if (Math.abs(v - t) < Math.abs(OBJ[k][1] - t)) k = i; }); return k; });
  const objective = OBJ[objI][1];
  const bs = bestStations(); const has = bs.some((x) => x != null);
  // budget stations ≈ 47 % du temps hors roxzone (4 min), réparti proportionnellement aux temps de référence
  const targets = REF.map((r) => (r / REF_TOTAL) * (objective - 240) * 0.47);
  const you = bs.map((t, i) => (t ? Math.max(0, Math.min(1, REF[i] / t)) : 0));
  const target = targets.map((t, i) => Math.max(0, Math.min(1, REF[i] / Math.max(1, t))));
  const gaps = HYROX_STATIONS.map((s, i) => ({ s, i, gap: bs[i] ? bs[i]! - targets[i] : -Infinity })).filter((g) => isFinite(g.gap)).sort((a, b) => b.gap - a.gap).slice(0, 2);
  const pred = predictHyrox(); const best = bestHyrox();
  return (
    <Page>
      <Top left={<Pressable onPress={() => router.back()}><Logo name="hyrox" size={40} /></Pressable>} title="Points faibles" sub={`Hyrox · ton niveau par station vs ton objectif ${OBJ[objI][0]}`} right={<Circ icon="share" size={38} onPress={() => Share.share({ message: pred ? `Prédiction Hyrox IRONX : ${fmtTime(pred.total)} (fiabilité ${pred.reliability} %)` : "Mes points faibles Hyrox sur IRONX" })} />} />
      <Pills items={OBJ.map(([l]) => `Objectif ${l}`)} on={objI} onChange={setObjI} />
      {!has ? (
        <PerfB_Empty title="Pas encore de temps par station" text="Saisis une simulation (même partielle) pour voir ton radar et tes stations à travailler." action="Saisir une simulation" onPress={() => router.push("/perf/saisie-hyrox")} />
      ) : (
        <>
          <View style={{ alignItems: "center" }}>
            <Radar axes={HYROX_STATIONS.map((s) => s.short)} series={[{ color: C.mut, values: target, fill: false }, { color: C.accent, values: you }]} size={300} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 18 }}>
            {[[C.accent, `toi · ${best ? perfB_date(best.at) : "meilleures stations"}`], [C.mut, `allure pour ${OBJ[objI][0]}`]].map(([c, l]) => <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: c }} /><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{l}</Text></View>)}
          </View>
          <H2>À travailler en priorité</H2>
          {gaps.length ? gaps.map(({ s, i, gap }) => (
            <PerfB_Advice key={s.id} photo={PERFB_STATION_PHOTO[s.id]} title={`${s.short} · ${fmtTime(bs[i]!)}`} text={`${gap > 0 ? `il te coûte ${fmtTime(gap)} par rapport à l'objectif` : `déjà ${fmtTime(-gap)} sous l'objectif`} · ${ADVICE[s.id]}`} action="Plan" onAction={() => router.push("/seance/editeur")} />
          )) : <Sub>Toutes tes stations sont dans l'objectif.</Sub>}
          <H2>Par station</H2>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {HYROX_STATIONS.map((s, i) => (
              <View key={s.id} style={{ width: "48%", flexGrow: 1, padding: 12, borderRadius: 16, backgroundColor: C.surf, gap: 2 }}>
                <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{s.short}</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: man(700), fontSize: 18, color: bs[i] ? C.txt : C.mut }}>{bs[i] ? fmtTime(bs[i]!) : "—"}</Text>
                  {bs[i] ? <PerfB_Delta d={bs[i]! - targets[i]} /> : <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>cible {fmtTime(targets[i])}</Text>}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      <H2>Prédiction depuis tes tests en salle</H2>
      {pred ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Ring pct={pred.reliability} size={84} thick={8}><Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{pred.reliability} %</Text></Ring>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}><Text style={{ fontFamily: man(700), fontSize: 26, letterSpacing: -0.5, color: C.txt }}>{fmtTime(pred.total)}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>estimé</Text></View>
            <Text style={{ fontFamily: inter(400), fontSize: 12, lineHeight: 16.5, color: C.mut }}>à partir de {pred.parts.join(", ")}. Fiabilité {pred.reliability} % ({pred.parts.length} test{pred.parts.length > 1 ? "s" : ""} sur 9). {best ? `Ta meilleure simulation réelle : ${fmtTime(hyroxTotal(best))}.` : ""}</Text>
          </View>
        </View>
      ) : (
        <Sub>Enregistre un test (SkiErg ou rameur 1 000 m via une simulation, 5 km en course) pour obtenir une prédiction.</Sub>
      )}
      <Btn label="Saisir une simulation" icon="plus" kind="secondary" onPress={() => router.push("/perf/saisie-hyrox")} />
    </Page>
  );
}
