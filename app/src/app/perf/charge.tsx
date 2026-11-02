import React, { useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, KV, Bars, H2, Sub, PerfA_Hero, PerfA_Body, PerfA_Gauge, PerfA_Advice, PerfA_Empty } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume, fmtVol } from "../../store/workout";
import { useActivities, acwr, isoWeek, act, dayKey } from "../../store/activities";

const ZONES = [{ to: 0.8, color: C.blue, label: "sous-entraîné" }, { to: 1.3, color: C.green, label: "optimal" }, { to: 1.5, color: C.orange, label: "élevé" }, { to: 1.9, color: C.red, label: "risque" }];
const weekStart = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };

/** R05 · Charge et récupération : ratio aiguë / chronique, jauge, 8 semaines, conseil */
export default function PerfCharge() {
  const { history } = useWorkout(); const { runs, wellness } = useActivities(); const [planned, setPlanned] = useState(false);
  const loads = useMemo<[number, number][]>(() => [...history.map((s) => [s.endedAt ?? s.startedAt, volume(s)] as [number, number]), ...runs.map((r) => [r.at, r.distance] as [number, number])], [history, runs]);
  const { acute, chronic, ratio } = acwr(loads);
  const zone = ratio < 0.8 ? 0 : ratio <= 1.3 ? 1 : ratio <= 1.5 ? 2 : 3;
  const ZTXT = ["Zone basse · < 0,8 · tu peux remonter le volume", "Zone optimale · 0,8 – 1,3 · tu progresses sans surcharger", "Zone élevée · 1,3 – 1,5 · attention à la fatigue", "Zone à risque · > 1,5 · le risque de blessure double"];

  // 8 dernières semaines ISO (la semaine en cours en dernier)
  const weeks = useMemo(() => { const w0 = weekStart(Date.now()); return Array.from({ length: 8 }, (_, i) => { const st = w0 - (7 - i) * 7 * 86400e3; const en = st + 7 * 86400e3; return { label: `S${isoWeek(st)}`, v: loads.filter(([t]) => t >= st && t < en).reduce((a, [, v]) => a + v, 0) }; }); }, [loads]);
  const rising = (() => { let n = 0; for (let i = weeks.length - 1; i > 0; i--) { if (weeks[i].v > weeks[i - 1].v && weeks[i].v > 0) n++; else break; } return n; })();
  // repos : jours sans séance ni sortie sur les 7 derniers jours
  const days = new Set<string>(); const lim = Date.now() - 7 * 86400e3;
  for (const [t] of loads) if (t >= lim) days.add(dayKey(new Date(t)));
  const rest = 7 - days.size;
  const sleep = (() => { const v: number[] = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); const s = wellness[dayKey(d)]?.sleep; if (s != null) v.push(s); } return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined; })();
  const fmtSleep = (h?: number) => (h == null ? "—" : `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, "0")}`);

  // conseil calculé
  const advice = zone === 1 ? { title: "Semaine prochaine : +5 % maximum", text: `tu es à ${ratio.toFixed(2).replace(".", ",")} ; au-delà de 1,3 le risque de blessure double` }
    : zone === 0 ? { title: "Tu peux charger davantage", text: chronic ? "ratio sous 0,8 : remonte le volume de 10 à 15 % cette semaine" : "pas encore d'historique : garde une progression régulière" }
    : zone === 2 ? { title: "Stabilise cette semaine", text: `ratio ${ratio.toFixed(2).replace(".", ",")} : garde le même volume, pas de nouvelle montée` }
    : { title: "Réduis la charge de 20 à 30 %", text: `ratio ${ratio.toFixed(2).replace(".", ",")} : trop de volume d'un coup, le corps n'a pas suivi` };
  const nextWeek = weekStart(Date.now()) + 7 * 86400e3;
  const plan = () => { act.addBlock({ name: "Décharge", focus: "decharge", weeks: [{ label: `S${isoWeek(nextWeek)}`, intensity: [0.6, 0.7], volumeDelta: -40 }], startAt: nextWeek, targetLabel: "Récupération", targetValue: "volume −40 %", active: true }); setPlanned(true); router.push("/perf/bloc" as any); };
  const share = () => Share.share({ message: `Charge et récupération : ratio ${ratio.toFixed(2).replace(".", ",")} · cette semaine ${fmtVol(acute)} · moyenne 4 sem. ${fmtVol(chronic)} — IRONX` }).catch(() => {});

  return (
    <Page pad={false}>
      <PerfA_Hero>
        <Top title="Charge et récupération" left={<Circ icon="back" size={38} kind="glass" onPress={() => router.back()} />} right={<Circ icon="share" size={38} kind="glass" onPress={share} />} />
        <View style={{ alignItems: "center", gap: 4, paddingTop: 4 }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: "rgba(255,255,255,0.75)" }}>ratio charge aiguë / chronique</Text>
          <Text style={{ fontFamily: man(800), fontSize: 64, letterSpacing: -3, lineHeight: 68, color: "#fff" }}>{chronic ? ratio.toFixed(2).replace(".", ",") : "—"}</Text>
          <Text style={{ fontFamily: inter(500), fontSize: 13, color: "#fff", textAlign: "center" }}>{chronic ? ZTXT[zone] : "Pas encore assez de données"}</Text>
        </View>
        <PerfA_Gauge value={chronic ? ratio : 1} zones={ZONES} />
      </PerfA_Hero>
      <PerfA_Body>
        {!loads.length ? <PerfA_Empty icon="bolt" title="Fais ta première séance ou sortie" text="Le ratio aiguë / chronique compare ta charge des 7 derniers jours à ta moyenne des 4 dernières semaines. Il a besoin d'un peu d'historique." cta="Démarrer une séance" onPress={() => router.push("/seance" as any)} /> : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Cette semaine" v={fmtVol(acute)} /><KV k="Moy. 4 sem." v={fmtVol(chronic)} /><KV k="Repos" v={`${rest} j / sem.`} /><KV k="Sommeil" v={fmtSleep(sleep)} align="flex-end" />
        </View>
        <Bars vals={weeks.map((w) => w.v)} labels={weeks.map((w) => w.label)} h={120} />
        <H2>Conseil</H2>
        <PerfA_Advice icon="bolt" title={advice.title} text={advice.text} />
        {rising >= 6 || zone >= 2 ? <PerfA_Advice icon="clock" color={C.green} title={`Décharge suggérée en S${isoWeek(nextWeek)}`} text={rising >= 6 ? `après ${rising} semaines de progression` : "pour laisser le corps absorber la charge"} action={planned ? "Planifié" : "Planifier"} onAction={planned ? undefined : plan} /> : null}
        {rising < 6 && zone < 2 && loads.length ? <Sub>{rising ? `${rising} semaine${rising > 1 ? "s" : ""} consécutive${rising > 1 ? "s" : ""} en hausse` : "Charge stable"} · une décharge est proposée après 6 semaines de progression ou si le ratio dépasse 1,3.</Sub> : null}
      </PerfA_Body>
    </Page>
  );
}
