import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Big, Sub, Bars, H2, FRow, KV, Btn, Divider, B, Field, Logo, PerfB_Empty, PerfB_CmpRow, PerfB_TableHead, PerfB_Delta, PerfB_Thumb, PerfB_SettingRow, perfB_date, PERFB_MOIS, PERFB_STATION_PHOTO } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, act, HYROX_STATIONS, hyroxTotal, bestHyrox, fmtTime, fmtPace, fmtKm, pace, Run, Wod, riegel } from "../../store/activities";

const KIND_LABEL: Record<string, string> = { endurance: "Endurance", fractionne: "Fractionné", seuil: "Seuil", "sortie longue": "Sortie longue", course: "Course", recup: "Récup" };
const FORMAT_LABEL: Record<Wod["format"], string> = { fortime: "For time", amrap: "AMRAP", emom: "EMOM", tabata: "Tabata", chipper: "Chipper" };
const BENCH = ["Fran", "Grace", "Helen", "Cindy", "Murph", "Diane", "Karen"];
const wodResult = (w: Wod) => (w.format === "fortime" || w.format === "chipper" ? fmtTime(w.result) : w.format === "amrap" ? `${w.rounds ?? Math.floor(w.result)} tours${w.reps ? ` + ${w.reps}` : ""}` : `${w.result} reps`);
const FOUR_W = 28 * 86400e3;

/** Ligne de sortie (course / vélo / natation) */
function RunRow({ r, onPress }: { r: Run; onPress?: () => void }) {
  const p = pace(r); const sub = [perfB_date(r.at), r.sport === "natation" ? `${fmtTime(p / 10)} /100 m` : r.sport === "velo" ? `${(r.distance / 1000 / (r.duration / 3600)).toFixed(1).replace(".", ",")} km/h` : fmtPace(p), r.hr ? `FC ${r.hr}` : null].filter(Boolean).join(" · ");
  return <FRow left={<PerfB_Thumb photo={r.sport === "course" ? "photo-run" : r.sport === "velo" ? "photo-box" : "photo-class"} />} text={<B>{r.name || (r.kind ? KIND_LABEL[r.kind] : "Sortie")}</B>} sub={sub} right={<View style={{ alignItems: "flex-end" }}><Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{fmtKm(r.distance)}</Text><Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut }}>{fmtTime(r.duration)}</Text></View>} onPress={onPress} />;
}

/** R08 · Hyrox et course */
export default function Endurance() {
  const { hyrox, runs, wods, goals, ftp } = useActivities();
  const [tab, setTab] = useState(0);
  const [ftpIn, setFtpIn] = useState("");
  const goHyrox = () => router.push("/perf/saisie-hyrox"); const goRun = () => router.push("/perf/saisie-course"); const goWod = () => router.push("/perf/saisie-wod");

  // ---- Hyrox ----
  const sims = hyrox.filter((h) => !h.partial).slice().sort((a, b) => a.at - b.at); // chronologique
  const best = bestHyrox(); const last = sims[sims.length - 1]; const prevOfBest = best ? sims.filter((s) => s.at < best.at).slice(-1)[0] : undefined;
  const goal = goals.find((g) => g.kind === "hyrox" && !g.done);
  const prevBestStation = (i: number) => { const v = hyrox.filter((h) => last && h.id !== last.id).map((h) => h.stations[i]).filter((x) => x > 0); return v.length ? Math.min(...v) : undefined; };
  const prevBestRun = () => { const v = hyrox.filter((h) => last && h.id !== last.id).map((h) => h.runs.filter((x) => x > 0)).filter((a) => a.length).map((a) => a.reduce((x, y) => x + y, 0) / a.length); return v.length ? Math.min(...v) : undefined; };
  const avgRun = (h: typeof sims[0]) => { const v = h.runs.filter((x) => x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };

  // ---- Course ----
  const courses = runs.filter((r) => r.sport === "course"); const recent = courses.filter((r) => Date.now() - r.at < FOUR_W);
  const km4 = recent.reduce((a, r) => a + r.distance, 0); const t4 = recent.reduce((a, r) => a + r.duration, 0);

  // ---- Rameur / SkiErg ----
  const ergo = (idx: number) => { const v = hyrox.map((h) => h.stations[idx]).filter((x) => x > 0); if (!v.length) return undefined; const t1000 = Math.min(...v); return { t1000, t500: riegel(t1000, 1000, 500), t2000: riegel(t1000, 1000, 2000), at: hyrox.find((h) => h.stations[idx] === t1000)?.at }; };

  // ---- Vélo / natation ----
  const velos = runs.filter((r) => r.sport === "velo"); const nats = runs.filter((r) => r.sport === "natation");
  const ftpTest = velos.find((r) => r.ftpTest && r.power); const ftpShown = ftp ?? (ftpTest ? Math.round(ftpTest.power! * 0.95) : undefined);

  // ---- CrossFit ----
  const bestBench = (name: string) => { const c = wods.filter((w) => w.name.toLowerCase() === name.toLowerCase()); if (!c.length) return undefined; return c.reduce((a, b) => ((a.format === "amrap" ? b.result > a.result : b.result < a.result) ? b : a)); };

  return (
    <Page>
      <Top left={<Pressable onPress={() => router.back()}><Logo name="hyrox" size={40} /></Pressable>} title="Hyrox et course" sub={`${sims.length} simulation${sims.length > 1 ? "s" : ""} · ${courses.length} sortie${courses.length > 1 ? "s" : ""}`} right={<Circ icon="share" size={38} onPress={() => Share.share({ message: best ? `Ma meilleure simulation Hyrox : ${fmtTime(hyroxTotal(best))} 💪 #IRONX` : "Mes performances Hyrox et course sur IRONX" })} />} />
      <Pills items={["Hyrox", "Course", "Rameur", "SkiErg", "Vélo", "Natation", "CrossFit"]} on={tab} onChange={setTab} />

      {tab === 0 ? (!best || !last ? (
        <PerfB_Empty title="Aucune simulation Hyrox" text="Saisis ta première simulation complète pour voir ton temps, tes stations et ta progression." action="Saisir une simulation" onPress={goHyrox} />
      ) : (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}>
              <Sub>meilleure simulation</Sub>
              <Big v={fmtTime(hyroxTotal(best))} size={48} />
              <Sub>{prevOfBest ? <><PerfB_Delta d={hyroxTotal(best) - hyroxTotal(prevOfBest)} size={13} /> vs {PERFB_MOIS[new Date(prevOfBest.at).getMonth()].replace(".", "")}</> : perfB_date(best.at)}{goal ? ` · objectif ${fmtTime(goal.to)}` : ""}</Sub>
            </View>
            <KV k="Course moy." v={fmtPace(avgRun(best))} align="flex-end" />
          </View>
          <Bars vals={sims.slice(-8).map(hyroxTotal)} labels={sims.slice(-8).map((s, i, a) => (i === a.length - 1 ? perfB_date(s.at) : PERFB_MOIS[new Date(s.at).getMonth()]))} h={96} />
          <H2 action={perfB_date(last.at)}>Par station</H2>
          <PerfB_TableHead a="meilleur" b={perfB_date(last.at)} />
          <PerfB_CmpRow photo="photo-run" name="Course 1 km" sub="moyenne des 8 courses" a={prevBestRun() ? fmtTime(prevBestRun()!) : "—"} b={fmtTime(avgRun(last))} d={prevBestRun() != null ? avgRun(last) - prevBestRun()! : undefined} />
          {HYROX_STATIONS.map((s, i) => { const pb = prevBestStation(i); const cur = last.stations[i]; return <PerfB_CmpRow key={s.id} photo={PERFB_STATION_PHOTO[s.id]} name={s.name} a={pb ? fmtTime(pb) : "—"} b={cur > 0 ? fmtTime(cur) : "—"} d={pb && cur > 0 ? cur - pb : undefined} />; })}
          {last.roxzone ? <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8 }}><KV k="Roxzone" v={fmtTime(last.roxzone)} /><KV k="FC moy." v={last.hr ? `${last.hr}` : "—"} /><KV k="Division" v={last.division[0].toUpperCase() + last.division.slice(1)} /><KV k="Simulations" v={String(sims.length)} align="flex-end" /></View> : null}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn label="Comparer" kind="secondary" size="md" full={false} icon="stats" onPress={() => router.push("/perf/comparer-hyrox")} style={{ flex: 1 }} />
            <Btn label="Points faibles" kind="secondary" size="md" full={false} icon="bolt" onPress={() => router.push("/perf/radar-hyrox")} style={{ flex: 1 }} />
          </View>
          <Btn label="Saisir une simulation" icon="plus" onPress={goHyrox} />
        </>
      )) : null}

      {tab === 1 ? (!courses.length ? (
        <PerfB_Empty title="Aucune sortie course" text="Enregistre ta première sortie pour voir tes kilomètres, ton allure et tes records." action="Saisir une sortie" onPress={goRun} icon="run" />
      ) : (
        <>
          <Sub>4 dernières semaines</Sub>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <KV k="Kilomètres" v={fmtKm(km4)} strong /><KV k="Sorties" v={String(recent.length)} strong /><KV k="Allure moy." v={km4 ? fmtPace(t4 / (km4 / 1000)) : "—"} strong align="flex-end" />
          </View>
          <Divider />
          <H2 action="Analyse" onAction={() => router.push("/perf/course")}>Sorties</H2>
          {courses.slice(0, 12).map((r) => <RunRow key={r.id} r={r} onPress={() => router.push(r.kind === "fractionne" ? "/perf/fractionne" : "/perf/course")} />)}
          <Btn label="Saisir une sortie" icon="plus" onPress={goRun} />
        </>
      )) : null}

      {tab === 2 || tab === 3 ? (() => { const e = ergo(tab === 2 ? 4 : 0); const nom = tab === 2 ? "rameur" : "SkiErg"; return !e ? (
        <PerfB_Empty title={`Pas encore de temps ${nom}`} text={`Tes temps ${nom} viennent des stations de tes simulations Hyrox. Saisis-en une pour les voir ici.`} action="Saisir une simulation" onPress={goHyrox} />
      ) : (
        <>
          <Sub>meilleur 1 000 m · {e.at ? perfB_date(e.at) : ""}</Sub>
          <Big v={fmtTime(e.t1000)} size={48} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <KV k="500 m (estimé)" v={fmtTime(e.t500)} /><KV k="1 000 m" v={fmtTime(e.t1000)} strong align="center" /><KV k="2 000 m (estimé)" v={fmtTime(e.t2000)} align="flex-end" />
          </View>
          <Sub>Allure moyenne {fmtTime(e.t1000 / 2)} /500 m. Les 500 m et 2 000 m sont extrapolés (Riegel) depuis ton meilleur 1 000 m en simulation.</Sub>
          <Divider />
          <H2>Historique</H2>
          {hyrox.filter((h) => h.stations[tab === 2 ? 4 : 0] > 0).slice(0, 8).map((h) => <FRow key={h.id} left={<PerfB_Thumb photo={tab === 2 ? "photo-w-rower" : "photo-gym"} />} text={<B>{h.name || "Simulation"}{h.partial ? " · partielle" : ""}</B>} sub={perfB_date(h.at)} right={<Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{fmtTime(h.stations[tab === 2 ? 4 : 0])}</Text>} />)}
          <Btn label="Saisir une simulation" icon="plus" onPress={goHyrox} />
        </>
      ); })() : null}

      {tab === 4 ? (
        <>
          {!velos.length ? <PerfB_Empty title="Aucune sortie vélo" text="Enregistre ta première sortie vélo pour suivre tes kilomètres et ta vitesse." action="Saisir une sortie" onPress={goRun} /> : (
            <>
              {(() => { const r4 = velos.filter((r) => Date.now() - r.at < FOUR_W); const km = r4.reduce((a, r) => a + r.distance, 0); const t = r4.reduce((a, r) => a + r.duration, 0); return (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <KV k="Km (4 sem.)" v={fmtKm(km)} strong /><KV k="Vitesse moy." v={t ? `${(km / 1000 / (t / 3600)).toFixed(1).replace(".", ",")} km/h` : "—"} strong align="center" /><KV k="FTP" v={ftpShown ? `${ftpShown} W` : "—"} strong align="flex-end" />
                </View>
              ); })()}
              <Divider />
              <H2>Sorties</H2>
              {velos.slice(0, 10).map((r) => <RunRow key={r.id} r={r} />)}
            </>
          )}
          <H2>Test FTP 20 min</H2>
          <Sub>Puissance moyenne tenue sur 20 min × 0,95 = ta FTP.</Sub>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
            <View style={{ flex: 1 }}><Field label="Puissance moyenne 20 min (W)" value={ftpIn} onChange={setFtpIn} keyboard="number-pad" placeholder="ex. 260" /></View>
            <Btn label="Enregistrer" size="md" full={false} kind="white" onPress={() => { const w = parseInt(ftpIn); if (w > 0) { act.setFtp(Math.round(w * 0.95)); setFtpIn(""); } }} />
          </View>
          <Btn label="Saisir une sortie" icon="plus" onPress={goRun} />
        </>
      ) : null}

      {tab === 5 ? (!nats.length ? (
        <PerfB_Empty title="Aucune séance natation" text="Enregistre ta première séance pour suivre ta distance et ton allure aux 100 m." action="Saisir une séance" onPress={goRun} />
      ) : (
        <>
          {(() => { const r4 = nats.filter((r) => Date.now() - r.at < FOUR_W); const m = r4.reduce((a, r) => a + r.distance, 0); const t = r4.reduce((a, r) => a + r.duration, 0); const bestP = Math.min(...nats.map((r) => pace(r) / 10)); return (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <KV k="Mètres (4 sem.)" v={`${Math.round(m)} m`} strong /><KV k="Allure moy." v={m ? `${fmtTime(t / (m / 100))} /100 m` : "—"} strong align="center" /><KV k="Meilleure" v={`${fmtTime(bestP)} /100 m`} strong align="flex-end" />
            </View>
          ); })()}
          <Divider />
          <H2>Séances</H2>
          {nats.slice(0, 10).map((r) => <RunRow key={r.id} r={r} />)}
          <Btn label="Saisir une séance" icon="plus" onPress={goRun} />
        </>
      )) : null}

      {tab === 6 ? (
        <>
          {!wods.length ? <PerfB_Empty title="Aucun WOD enregistré" text="Saisis ton premier WOD pour suivre tes temps et tes benchmarks." action="Saisir un WOD" onPress={goWod} icon="timer" /> : (
            <>
              <H2>Derniers WOD</H2>
              {wods.slice(0, 10).map((w) => <FRow key={w.id} left={<PerfB_Thumb photo="photo-chalk" />} text={<><B>{w.name}</B>{w.rx ? <Text style={{ color: C.green, fontFamily: inter(700) }}> · Rx</Text> : null}</>} sub={`${FORMAT_LABEL[w.format]} · ${perfB_date(w.at)}${w.movements ? ` · ${w.movements}` : ""}`} right={<Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{wodResult(w)}</Text>} />)}
            </>
          )}
          <H2>Benchmarks</H2>
          {BENCH.map((n) => { const b = bestBench(n); return <PerfB_SettingRow key={n} label={n} sub={b ? `${FORMAT_LABEL[b.format]} · ${perfB_date(b.at)}${b.rx ? " · Rx" : ""}` : "pas encore fait"} right={<Text style={{ fontFamily: man(700), fontSize: 16, color: b ? C.txt : C.mut }}>{b ? wodResult(b) : "—"}</Text>} />; })}
          <Btn label="Saisir un WOD" icon="plus" onPress={goWod} />
        </>
      ) : null}
    </Page>
  );
}
