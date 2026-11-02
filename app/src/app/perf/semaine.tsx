import React, { useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Big, Label, Ring, H2, Sub, Btn, PerfC_TableHead, PerfC_TableRow, PerfC_Logo, PerfC_Advice, PerfC_Empty, perfcActivities, perfcMonday, perfcDayKey, perfcTonnes, perfcKg, PERFC_MOIS } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume, setsDone, fmtVol, Session } from "../../store/workout";
import { useActivities, isoWeek, fmtTime, fmtTimeLong, fmtPace, HYROX_STATIONS, streetMove } from "../../store/activities";
import { useProfile } from "../../store/profile";
import { byId } from "../../data/seed";

const W = 7 * 86400e3;
type Stats = { sess: Session[]; vol: number; setsPerMuscle: number; km: number; pace: number; hyrox: number; street: number; time: number; rpe: number; acts: number; prs: { exo: string; kg: number; reps: number }[]; dayLoads: number[]; longest: { label: string; sec: number } | null };

/** R21 · Ma semaine — score /100 et comparaison avec la semaine précédente, toutes disciplines */
export default function Semaine() {
  const { history } = useWorkout(); const a = useActivities(); const p = useProfile(); const [k, setK] = useState(() => { const m = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); })(); const n = history.filter((s) => s.startedAt >= m).length + a.runs.filter((r) => r.at >= m).length + a.hyrox.filter((h) => h.at >= m).length; return n ? 0 : 1; });
  const acts = useMemo(() => perfcActivities(history), [history, a.runs, a.hyrox, a.street, a.wods]);
  const thisMonday = perfcMonday(Date.now()).getTime();
  const stats = (wi: number): Stats => {
    const s0 = thisMonday - wi * W, s1 = s0 + W; const inW = (t: number) => t >= s0 && t < s1;
    const sess = history.filter((s) => inW(s.startedAt)); const runs = a.runs.filter((r) => r.sport === "course" && inW(r.at)); const sims = a.hyrox.filter((h) => inW(h.at)); const tests = a.street.filter((t) => inW(t.at));
    const vol = sess.reduce((x, s) => x + volume(s), 0);
    const groups: Record<string, number> = {}; for (const s of sess) for (const e of s.exos) { const g = byId(e.exoId)?.group ?? "autre"; groups[g] = (groups[g] ?? 0) + e.sets.filter((x) => x.done).length; }
    const gv = Object.values(groups); const setsPerMuscle = gv.length ? gv.reduce((x, y) => x + y, 0) / gv.length : 0;
    const km = runs.reduce((x, r) => x + r.distance, 0) / 1000; const pace = km ? runs.reduce((x, r) => x + r.duration, 0) / km : 0;
    const hyrox = sims.length ? HYROX_STATIONS.reduce((x, _, i) => { const v = sims.map((h) => h.stations[i]).filter((z) => z > 0); return x + (v.length ? Math.min(...v) : 0); }, 0) : 0;
    const street = tests.filter((t) => streetMove(t.move)?.kind === "reps").reduce((x, t) => x + t.value, 0);
    const time = sess.reduce((x, s) => x + ((s.endedAt ?? s.startedAt) - s.startedAt) / 1000, 0) + runs.reduce((x, r) => x + r.duration, 0) + sims.reduce((x, h) => x + h.stations.reduce((y, z) => y + z, 0) + h.runs.reduce((y, z) => y + z, 0), 0);
    const rp = sess.flatMap((s) => s.exos.flatMap((e) => e.sets.filter((x) => x.done && x.rpe).map((x) => x.rpe!))); const rpe = rp.length ? rp.reduce((x, y) => x + y, 0) / rp.length : 0;
    const prs = sess.flatMap((s) => s.exos.flatMap((e) => e.sets.filter((x) => x.done && x.pr).map((x) => ({ exo: byId(e.exoId)?.name ?? e.exoId, kg: x.kg, reps: x.reps }))));
    const wa = acts.filter((x) => inW(x.at)); const dayLoads = Array(7).fill(0) as number[]; for (const x of wa) dayLoads[(new Date(x.at).getDay() + 6) % 7] += x.load;
    // journée la plus longue
    const byDay: Record<string, { sec: number; label: string }> = {}; for (const x of wa) { const dk = perfcDayKey(x.at); const sec = x.end ? (x.end - x.at) / 1000 : 0; byDay[dk] = { sec: (byDay[dk]?.sec ?? 0) + sec, label: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][(new Date(x.at).getDay() + 6) % 7] }; }
    const ld = Object.values(byDay).sort((x, y) => y.sec - x.sec)[0]; const longest = ld && ld.sec ? ld : null;
    return { sess, vol, setsPerMuscle, km, pace, hyrox, street, time, rpe, acts: wa.length, prs, dayLoads, longest };
  };
  const cur = useMemo(() => stats(k), [k, history, acts]); const prev = useMemo(() => stats(k + 1), [k, history, acts]);
  // score /100
  const planned = Math.max(1, p.seances || 3); const assid = Math.round(Math.min(1, cur.acts / planned) * 40);
  const loads = (wi: number) => acts.filter((x) => x.at >= thisMonday - wi * W && x.at < thisMonday - wi * W + W).reduce((x, y) => x + y.load, 0);
  const acute = loads(k); const chronic = (loads(k) + loads(k + 1) + loads(k + 2) + loads(k + 3)) / 4; const ratio = chronic > 0 ? acute / chronic : 0;
  const charge = !acute ? 0 : ratio >= 0.8 && ratio <= 1.3 ? 30 : (ratio >= 0.6 && ratio < 0.8) || (ratio > 1.3 && ratio <= 1.5) ? 15 : 5;
  const prog = cur.prs.length || (cur.vol > 0 && cur.vol >= prev.vol) ? 20 : cur.vol > 0 ? 8 : 0;
  const regul = (() => { const d = cur.dayLoads.map((v, i) => (v ? i : -1)).filter((i) => i >= 0); if (!d.length) return 0; const lim = k === 0 ? (Date.now() - thisMonday) / 86400e3 : 7; let last = -1; for (const i of d) { if (i - last > 3) return 4; last = i; } return lim - last > 3 ? 4 : 10; })();
  const score = Math.min(100, assid + charge + prog + regul);
  const prevScore = (() => { const pa = Math.round(Math.min(1, prev.acts / planned) * 40); const ac = loads(k + 1), ch = (loads(k + 1) + loads(k + 2) + loads(k + 3) + loads(k + 4)) / 4, r = ch ? ac / ch : 0; const pc = !ac ? 0 : r >= 0.8 && r <= 1.3 ? 30 : 15; const pp = prev.prs.length || prev.vol > 0 ? 20 : 0; return Math.min(100, pa + pc + pp + (prev.acts ? 10 : 0)); })();
  const wkNo = isoWeek(thisMonday - k * W); const d0 = new Date(thisMonday - k * W), d1 = new Date(thisMonday - k * W + 6 * 86400e3);
  const chargeTxt = !acute ? "pas de charge" : ratio < 0.8 ? "charge en baisse" : ratio <= 1.3 ? "charge optimale" : "charge élevée";
  const pctDelta = (x: number, y: number) => (y ? `${x >= y ? "+" : "−"}${Math.abs(Math.round(((x - y) / y) * 100))} %` : x ? "nouveau" : "—");
  const good = (x: number, y: number, lower = false) => (!x && !y ? null : x === y ? null : lower ? (x && y ? x < y : !!x) : x > y);
  const rows: { logo: Parameters<typeof PerfC_Logo>[0]["name"]; label: string; a: string; b: string; d: string; g: boolean | null; show: boolean }[] = [
    { logo: "logo-bodybuilding", label: "Musculation · tonnage", a: fmtVol(cur.vol), b: fmtVol(prev.vol), d: pctDelta(cur.vol, prev.vol), g: good(cur.vol, prev.vol), show: true },
    { logo: "logo-bodybuilding", label: "Séries par muscle (moy.)", a: String(Math.round(cur.setsPerMuscle)), b: String(Math.round(prev.setsPerMuscle)), d: `${cur.setsPerMuscle >= prev.setsPerMuscle ? "+" : "−"}${Math.abs(Math.round(cur.setsPerMuscle - prev.setsPerMuscle))}`, g: good(cur.setsPerMuscle, prev.setsPerMuscle), show: true },
    { logo: "logo-course", label: "Course · km", a: cur.km.toFixed(1).replace(".", ","), b: prev.km.toFixed(1).replace(".", ","), d: `${cur.km >= prev.km ? "+" : "−"}${Math.abs(cur.km - prev.km).toFixed(1).replace(".", ",")}`, g: good(cur.km, prev.km), show: cur.km > 0 || prev.km > 0 },
    { logo: "logo-course", label: "Allure moyenne", a: cur.pace ? fmtPace(cur.pace).replace(" /km", "") : "—", b: prev.pace ? fmtPace(prev.pace).replace(" /km", "") : "—", d: cur.pace && prev.pace ? `${cur.pace <= prev.pace ? "−" : "+"}${fmtTime(Math.abs(cur.pace - prev.pace))}` : "—", g: good(cur.pace, prev.pace, true), show: cur.km > 0 || prev.km > 0 },
    { logo: "logo-hyrox", label: "Hyrox · stations", a: cur.hyrox ? fmtTime(cur.hyrox) : "—", b: prev.hyrox ? fmtTime(prev.hyrox) : "—", d: cur.hyrox && prev.hyrox ? `${cur.hyrox <= prev.hyrox ? "−" : "+"}${fmtTime(Math.abs(cur.hyrox - prev.hyrox))}` : "—", g: good(cur.hyrox, prev.hyrox, true), show: cur.hyrox > 0 || prev.hyrox > 0 },
    { logo: "logo-street", label: "Street · reps totales", a: String(cur.street), b: String(prev.street), d: `${cur.street >= prev.street ? "+" : "−"}${Math.abs(cur.street - prev.street)}`, g: good(cur.street, prev.street), show: cur.street > 0 || prev.street > 0 },
    { logo: "logo-cardio", label: "Temps total", a: fmtTimeLong(cur.time), b: fmtTimeLong(prev.time), d: `${cur.time >= prev.time ? "+" : "−"}${Math.round(Math.abs(cur.time - prev.time) / 60)} min`, g: good(cur.time, prev.time), show: true },
    { logo: "logo-autres", label: "RPE moyen", a: cur.rpe ? cur.rpe.toFixed(1).replace(".", ",") : "—", b: prev.rpe ? prev.rpe.toFixed(1).replace(".", ",") : "—", d: cur.rpe && prev.rpe ? `${cur.rpe >= prev.rpe ? "+" : "−"}${Math.abs(cur.rpe - prev.rpe).toFixed(1).replace(".", ",")}` : "—", g: null, show: cur.rpe > 0 || prev.rpe > 0 },
  ];
  const heaviest = cur.sess.length ? cur.sess.reduce((x, s) => (volume(s) > volume(x) ? s : x)) : undefined;
  const diff: { icon: "trophy" | "bolt" | "clock"; t: string; s: string; color: string }[] = [];
  if (cur.prs.length) diff.push({ icon: "trophy", color: C.orange, t: `${cur.prs.length} record${cur.prs.length > 1 ? "s" : ""} : ${[...new Set(cur.prs.map((r) => r.exo))].slice(0, 3).join(", ")}`, s: cur.prs.slice(0, 2).map((r) => `${r.exo} ${perfcKg(r.kg)} × ${r.reps}`).join(" · ") });
  if (heaviest) diff.push({ icon: "bolt", color: C.accent, t: `Séance la plus lourde : ${heaviest.name} · ${perfcTonnes(volume(heaviest))} t`, s: `${setsDone(heaviest)} séries · ${["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][(new Date(heaviest.startedAt).getDay() + 6) % 7]}` });
  if (cur.longest) diff.push({ icon: "clock", color: C.blue, t: `Journée la plus longue : ${cur.longest.label} · ${fmtTimeLong(cur.longest.sec)}`, s: cur.time ? `${Math.round((cur.longest.sec / cur.time) * 100)} % de ton temps d'entraînement de la semaine` : "" });
  const share = () => Share.share({ message: `IRONX · Semaine ${wkNo} : ${score} / 100\n${cur.acts} séance${cur.acts > 1 ? "s" : ""} · ${fmtVol(cur.vol)} · ${cur.prs.length} record${cur.prs.length > 1 ? "s" : ""}${cur.km ? ` · ${cur.km.toFixed(1).replace(".", ",")} km` : ""} · ${fmtTimeLong(cur.time)}` });
  const labels = Array.from({ length: 8 }, (_, i) => `S${isoWeek(thisMonday - i * W)}`);

  return (
    <Page>
      <Top title="Ma semaine" sub={`S${wkNo} · ${d0.getDate()} ${PERFC_MOIS[d0.getMonth()]} → ${d1.getDate()} ${PERFC_MOIS[d1.getMonth()]} · vs S${isoWeek(thisMonday - (k + 1) * W)}`} onBack={() => router.back()} right={<Circ icon="share" size={38} onPress={share} />} />
      <Pills items={labels} on={k} onChange={setK} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}>
          <Label>score de la semaine</Label>
          <Big v={String(score)} unit="/ 100" size={52} />
          <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}><Text style={{ fontFamily: inter(600), color: score >= prevScore ? C.green : C.red }}>{score >= prevScore ? "+" : "−"}{Math.abs(score - prevScore)}</Text> · {cur.acts} séance{cur.acts > 1 ? "s" : ""} · {cur.prs.length} record{cur.prs.length > 1 ? "s" : ""} · {chargeTxt}</Text>
        </View>
        <Ring pct={score} size={84} thick={8}><Text style={{ fontFamily: man(700), fontSize: 20, color: C.txt }}>{score}</Text></Ring>
      </View>
      <Sub>Assiduité {assid} / 40 · charge {charge} / 30 · progression {prog} / 20 · régularité {regul} / 10</Sub>
      {!cur.acts && !prev.acts ? <PerfC_Empty icon="cal" title="Semaine vide" text="Fais ta première séance de la semaine pour lancer le score et la comparaison." cta="Lancer une séance" onPress={() => router.push("/(tabs)/seance")} /> : null}
      <PerfC_TableHead a={`S${wkNo}`} b={`S${isoWeek(thisMonday - (k + 1) * W)}`} />
      {rows.filter((r) => r.show).map((r) => <PerfC_TableRow key={r.label} left={<PerfC_Logo name={r.logo} size={32} />} label={r.label} a={r.a} b={r.b} delta={r.d} good={r.g} />)}

      <H2>Ce qui a fait la différence</H2>
      {diff.length ? diff.map((x, i) => <PerfC_Advice key={i} icon={x.icon} color={x.color} title={x.t} text={x.s} />) : <Sub>Rien à signaler cette semaine : une séance avec un top set ou une sortie plus longue fera la différence.</Sub>}
      <Btn label="Partager ma semaine" kind="white" icon="share" onPress={share} style={{ marginTop: 6 }} />
    </Page>
  );
}
