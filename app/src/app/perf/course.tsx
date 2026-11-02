import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Big, Sub, H2, Bars, AreaChart, Btn, KV, Divider, Logo, PerfB_Empty, perfB_date } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, RUN_DISTS, bestRun, bestRunTime, riegel, vo2max, hrZones, fmtTime, fmtPace, fmtKm, pace } from "../../store/activities";
import { useProfile, age } from "../../store/profile";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const ZONES = [["Récup", 1.25, C.blue], ["Endurance", 1.12, C.green], ["Seuil", 1.0, C.orange], ["VO₂max", 0.95, C.accent]] as const;

/** R12 · Course à pied : VO2max, records par distance (réel + prédit Riegel), dernière sortie, semaine, allure, FC */
export default function Course() {
  const { runs } = useActivities(); const p = useProfile();
  const [tab, setTab] = useState(0);
  const courses = runs.filter((r) => r.sport === "course"); const last = courses[0];
  const goRun = () => router.push("/perf/saisie-course");
  const year = new Date().getFullYear(); const yearKm = courses.filter((r) => new Date(r.at).getFullYear() === year).reduce((a, r) => a + r.distance, 0);
  // VO2max : meilleure perf 5 km ou 10 km, sinon la plus longue sortie
  const ref = bestRun(5000) ? { t: bestRunTime(5000)!, d: 5000 } : bestRun(10000) ? { t: bestRunTime(10000)!, d: 10000 } : courses.length ? (() => { const r = courses.reduce((a, b) => (b.distance > a.distance ? b : a)); return { t: r.duration, d: r.distance }; })() : undefined;
  const vo2 = ref ? vo2max(ref.t, ref.d) : undefined;
  const vo2Prev = (() => { const old = courses.filter((r) => Date.now() - r.at > 90 * 86400e3 && r.distance >= 3000); if (!old.length) return undefined; const r = old.reduce((a, b) => (pace(b) < pace(a) ? b : a)); return vo2max(r.duration, r.distance); })();
  const km4 = courses.filter((r) => Date.now() - r.at < 28 * 86400e3).reduce((a, r) => a + r.distance, 0) / 4;
  const vo2Note = vo2 ? (vo2 >= 55 ? "excellent" : vo2 >= 48 ? "très bon" : vo2 >= 42 ? "bon pour ton âge" : "à développer") : "";
  // Semaine : km par jour (lundi → dimanche)
  const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => courses.filter((r) => { const d = (r.at - monday.getTime()) / 86400e3; return d >= i && d < i + 1; }).reduce((a, r) => a + r.distance, 0) / 1000);
  // Allure : 20 dernières sorties (chronologique)
  const paces = courses.slice(0, 20).reverse().map(pace);
  const t5 = bestRunTime(5000); const p5 = t5 ? t5 / 5 : undefined;
  // FC
  const hrObs = Math.max(0, ...courses.map((r) => r.hrMax ?? 0)); const hrMax = Math.max(hrObs, 220 - age(p));
  return (
    <Page>
      <Top left={<Pressable onPress={() => router.back()}><Logo name="course" size={40} /></Pressable>} title="Course à pied" sub={`${courses.length} sortie${courses.length > 1 ? "s" : ""} · ${fmtKm(yearKm)} en ${year}`} right={<Circ icon="share" size={38} onPress={() => Share.share({ message: `${fmtKm(yearKm)} courus en ${year}${vo2 ? ` · VO₂max estimée ${vo2}` : ""} #IRONX` })} />} />
      <Pills items={["Records", "Semaine", "Allure", "FC", "Chaussures"]} on={tab} onChange={setTab} />
      {!courses.length && tab !== 4 ? (
        <PerfB_Empty title="Aucune sortie enregistrée" text="Fais ta première sortie pour voir ta VO₂max estimée, tes records et tes prédictions." action="Saisir une sortie" onPress={goRun} icon="run" />
      ) : null}

      {tab === 0 && courses.length ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}>
              <Sub>VO₂max estimée</Sub>
              <Big v={vo2 ? String(vo2) : "—"} size={52} />
              <Sub>{vo2Prev && vo2 ? <Text style={{ fontFamily: inter(600), color: vo2 - vo2Prev >= 0 ? C.green : C.red }}>{vo2 - vo2Prev >= 0 ? "+" : "−"}{Math.abs(vo2 - vo2Prev)} sur 3 mois</Text> : "première estimation"}{vo2Note ? ` · ${vo2Note}` : ""}</Sub>
            </View>
            <KV k="Km / semaine" v={(km4 / 1000).toFixed(1).replace(".", ",")} align="flex-end" />
          </View>
          <H2>Records par distance</H2>
          {RUN_DISTS.map(([d, label]) => {
            const r = bestRun(d); const t = bestRunTime(d);
            // prédit depuis la meilleure perf la plus proche (autre distance)
            const src = RUN_DISTS.filter(([dd]) => dd !== d && dd >= 1000).map(([dd]) => ({ dd, tt: bestRunTime(dd) })).filter((x) => x.tt).sort((a, b) => Math.abs(Math.log(a.dd / d)) - Math.abs(Math.log(b.dd / d)))[0];
            const predT = src ? riegel(src.tt!, src.dd, d) : undefined;
            return (
              <View key={label} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <Text style={{ width: 76, fontFamily: man(700), fontSize: 15, color: C.txt }}>{label}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: man(700), fontSize: 15, color: t ? C.txt : C.mut }}>{t ? fmtTime(t) : "—"}</Text>
                  <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut }}>{t && r ? `${fmtPace(t / (d / 1000))} moy. · ${perfB_date(r.at)}` : "jamais couru"}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>prédit</Text>
                  <Text style={{ fontFamily: man(700), fontSize: 15, color: predT ? C.accent : C.mut }}>{predT ? fmtTime(predT) : "—"}</Text>
                </View>
              </View>
            );
          })}
          <Sub>Prédictions : formule de Riegel sur ta meilleure perf la plus proche en distance.</Sub>
          {last ? (
            <>
              <H2 action={`${perfB_date(last.at)} · ${fmtKm(last.distance)}`}>Dernière sortie</H2>
              {last.splits?.length ? <Bars vals={last.splits} labels={last.splits.map((_, i) => `km ${i + 1}`)} h={96} hl={last.splits.indexOf(Math.min(...last.splits))} /> : <Sub>Pas de splits sur cette sortie · {fmtTime(last.duration)} · {fmtPace(pace(last))}{last.hr ? ` · FC ${last.hr}` : ""}</Sub>}
              {last.splits?.length ? <Sub>Km le plus rapide en rouge : {fmtTime(Math.min(...last.splits))} · moyenne {fmtPace(pace(last))}{last.hr ? ` · FC ${last.hr}` : ""}</Sub> : null}
            </>
          ) : null}
        </>
      ) : null}

      {tab === 1 && courses.length ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}><Sub>cette semaine</Sub><Big v={week.reduce((a, b) => a + b, 0).toFixed(1).replace(".", ",")} unit="km" size={52} /></View>
            <KV k="Moy. 4 sem." v={fmtKm(km4)} align="flex-end" />
          </View>
          <Bars vals={week} labels={DAYS} h={110} hl={(new Date().getDay() + 6) % 7} />
          <Divider />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <KV k="Sorties" v={String(courses.filter((r) => r.at >= monday.getTime()).length)} /><KV k="Temps" v={fmtTime(courses.filter((r) => r.at >= monday.getTime()).reduce((a, r) => a + r.duration, 0))} align="center" /><KV k="Plus longue" v={fmtKm(Math.max(0, ...courses.filter((r) => r.at >= monday.getTime()).map((r) => r.distance)))} align="flex-end" />
          </View>
        </>
      ) : null}

      {tab === 2 && courses.length ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}><Sub>allure moyenne · dernière sortie</Sub><Big v={fmtPace(pace(last)).replace(" /km", "")} unit="/km" size={52} /></View>
            <KV k="Meilleure 5 km" v={p5 ? fmtPace(p5) : "—"} align="flex-end" />
          </View>
          {paces.length >= 2 ? <AreaChart points={paces.map((x) => -x)} h={120} /> : <Sub>Il faut au moins deux sorties pour tracer la courbe.</Sub>}
          <Sub>{paces.length} dernières sorties · plus la courbe monte, plus tu vas vite.</Sub>
          <H2>Zones d'allure</H2>
          {p5 ? ZONES.map(([n, k, col]) => (
            <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col }} />
              <Text style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>{n}</Text>
              <Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{fmtPace(p5 * k)}</Text>
            </View>
          )) : <Sub>Cours un 5 km pour calculer tes zones d'allure (récup +25 %, endurance +12 %, seuil = allure 5 km, VO₂max −5 %).</Sub>}
        </>
      ) : null}

      {tab === 3 && courses.length ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}><Sub>FC max {hrObs >= hrMax ? "observée" : "estimée (220 − âge)"}</Sub><Big v={String(hrMax)} unit="bpm" size={52} /></View>
            <KV k="FC moy. dernière" v={last.hr ? `${last.hr}` : "—"} align="flex-end" />
          </View>
          <H2>Zones cardiaques</H2>
          {hrZones(hrMax).map((z, i) => (
            <View key={z.label} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: [C.blue, C.green, C.orange, C.accent, C.red][i] }} />
              <Text style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>{z.label}</Text>
              <Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{z.lo} – {z.hi}</Text>
            </View>
          ))}
          <H2>FC moyenne par sortie</H2>
          {courses.filter((r) => r.hr).length >= 2 ? <AreaChart points={courses.filter((r) => r.hr).slice(0, 20).reverse().map((r) => r.hr!)} h={100} color={C.red} /> : <Sub>Renseigne la FC sur tes sorties pour suivre sa tendance.</Sub>}
        </>
      ) : null}

      {tab === 4 ? <PerfB_Empty title="Bientôt : usure de tes paires" text="Tu pourras associer chaque sortie à une paire et suivre ses kilomètres." icon="clock" /> : null}

      <Btn label="Saisir une sortie" icon="plus" onPress={goRun} />
    </Page>
  );
}
