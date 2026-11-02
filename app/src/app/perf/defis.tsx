import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, H2, Sub, Btn, Field, Progress, PerfC_Thumb, PerfC_Advice, PerfC_Empty, PerfC_Demo, perfcDate, perfcKg, perfcNum, perfcPhoto } from "../../ui";
import { ImgName } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, bestOf, volume } from "../../store/workout";
import { useActivities, act, Challenge, bestRunTime, bestHyrox, hyroxTotal, bestStations, bestStreet, fmtTime, HYROX_STATIONS, streetMove } from "../../store/activities";
import { useProfile } from "../../store/profile";
import { MEMBERS } from "../../store/gym";
import { byId, e1rm } from "../../data/seed";

type Metric = "exo1rm" | "run" | "hyrox" | "station" | "street" | "sessions" | "volume" | "manual";
type ChallengeX = Challenge & { metric?: Metric; ref?: string };
const METRICS: { id: Metric; label: string; ref?: string; unit: string; lower?: boolean }[] = [
  { id: "exo1rm", label: "1RM couché", ref: "bench", unit: "kg" }, { id: "exo1rm", label: "1RM squat", ref: "squat", unit: "kg" }, { id: "exo1rm", label: "1RM soulevé", ref: "deadlift", unit: "kg" },
  { id: "run", label: "5 km", ref: "5000", unit: "s", lower: true }, { id: "run", label: "10 km", ref: "10000", unit: "s", lower: true }, { id: "hyrox", label: "Hyrox", unit: "s", lower: true },
  { id: "street", label: "Tractions", ref: "pullup", unit: "reps" }, { id: "sessions", label: "Séances", unit: "séances" }, { id: "volume", label: "Tonnage du mois", unit: "t" }, { id: "manual", label: "Manuel", unit: "" },
];
const TABS = ["En cours", "Contre moi", "Entre amis", "Salle", "Terminés"];
const WEEK = 7 * 86400e3;

/** R22 · Se challenger — défis contre toi-même avec valeurs réelles, amis / salle en démo, propositions calculées */
export default function Defis() {
  const { history } = useWorkout(); const a = useActivities(); const p = useProfile(); const [tab, setTab] = useState(0); const [open, setOpen] = useState<string | null>(null); const [form, setForm] = useState<{ title: string; kind: Challenge["kind"]; mi: number; from: string; to: string; weeks: number } | null>(null);
  const now = Date.now(); const m0 = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const monthVol = history.filter((s) => s.startedAt >= m0).reduce((x, s) => x + volume(s), 0);
  const my1 = (id: string) => { const b = bestOf(id); return b ? e1rm(b.kg, b.reps) : 0; };
  /** valeur courante calculée depuis tes données (undefined = pas de donnée → valeur saisie) */
  const current = (c: ChallengeX): number | undefined => {
    switch (c.metric) {
      case "exo1rm": return my1(c.ref ?? "bench") || undefined;
      case "run": return bestRunTime(Number(c.ref) || 5000);
      case "hyrox": { const b = bestHyrox(); return b ? hyroxTotal(b) : undefined; }
      case "station": { const i = HYROX_STATIONS.findIndex((s) => s.id === c.ref); return i >= 0 ? bestStations()[i] : undefined; }
      case "street": return bestStreet(c.ref ?? "pullup")?.value;
      case "sessions": return history.filter((s) => s.startedAt >= c.createdAt).length + a.runs.filter((r) => r.at >= c.createdAt).length + a.hyrox.filter((h) => h.at >= c.createdAt).length;
      case "volume": return monthVol / 1000;
      default: return undefined;
    }
  };
  const fmt = (c: ChallengeX, v: number) => (c.unit === "s" ? fmtTime(v) : c.unit === "t" ? `${perfcNum(v, 1)} t` : c.unit === "kg" ? `${perfcKg(v)} kg` : `${Math.round(v)}${c.unit ? ` ${c.unit}` : ""}`);
  const pct = (c: ChallengeX, v: number) => { const span = c.lower ? c.from - c.to : c.to - c.from; if (!span) return v === c.to ? 100 : 0; return Math.max(0, Math.min(100, Math.round(((c.lower ? c.from - v : v - c.from) / span) * 100))); };
  const photo = (c: ChallengeX): ImgName => (c.metric === "exo1rm" ? perfcPhoto(byId(c.ref ?? "")?.photo) : c.metric === "run" ? "photo-run" : c.metric === "hyrox" || c.metric === "station" ? "photo-sled" : c.metric === "street" ? "photo-pullup" : c.metric === "volume" ? "photo-deadlift" : "photo-gym");
  const list = (a.challenges as ChallengeX[]).filter((c) => (tab === 0 ? !c.done : tab === 4 ? !!c.done : !c.done && c.kind === (["self", "friend", "gym"] as const)[tab - 1]));
  const weeksLeft = (c: Challenge) => Math.max(0, Math.ceil((c.deadline - now) / WEEK));

  // défis proposés (calculés)
  const props: { title: string; sub: string; c: Omit<ChallengeX, "id" | "createdAt"> }[] = [];
  const bs = bestStations(); const ref = [240, 180, 240, 300, 250, 120, 270, 400];
  const worst = HYROX_STATIONS.map((s, i) => ({ s, i, r: bs[i] ? bs[i]! / ref[i] : 0 })).filter((x) => x.r > 0).sort((x, y) => y.r - x.r)[0];
  if (worst) props.push({ title: `${worst.s.short} : −10 s en 3 semaines`, sub: `ta station la plus faible · ${fmtTime(bs[worst.i]!)} → ${fmtTime(bs[worst.i]! - 10)}`, c: { title: `${worst.s.short} −10 s`, sub: `ta station la plus faible · ${fmtTime(bs[worst.i]!)} → ${fmtTime(bs[worst.i]! - 10)}`, kind: "self", from: bs[worst.i]!, to: bs[worst.i]! - 10, cur: bs[worst.i]!, unit: "s", lower: true, deadline: now + 3 * WEEK, metric: "station", ref: worst.s.id } });
  const pu = bestStreet("pullup");
  props.push({ title: "+1 traction par semaine", sub: pu ? `contre toi · ${pu.value} → ${pu.value + 4} d'ici 4 semaines` : "contre toi · fais ton premier test max pour partir d'un vrai chiffre", c: { title: "+1 traction par semaine", sub: `contre toi · ${pu?.value ?? 0} → ${(pu?.value ?? 0) + 4}`, kind: "self", from: pu?.value ?? 0, to: (pu?.value ?? 0) + 4, cur: pu?.value ?? 0, unit: "reps", deadline: now + 4 * WEEK, metric: "street", ref: "pullup" } });
  const baseVol = monthVol || history.filter((s) => s.startedAt >= m0 - 31 * 86400e3 && s.startedAt < m0).reduce((x, s) => x + volume(s), 0);
  if (baseVol) props.push({ title: "Tonnage du mois +5 %", sub: `${perfcNum(baseVol / 1000, 1)} t → ${perfcNum((baseVol * 1.05) / 1000, 1)} t d'ici la fin du mois prochain`, c: { title: "Tonnage du mois +5 %", sub: `contre toi · ${perfcNum(baseVol / 1000, 1)} t → ${perfcNum((baseVol * 1.05) / 1000, 1)} t`, kind: "self", from: 0, to: (baseVol * 1.05) / 1000, cur: monthVol / 1000, unit: "t", deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).getTime(), metric: "volume" } });
  else props.push({ title: `${p.seances} séances cette semaine`, sub: "contre toi · tiens ton planning 1 semaine", c: { title: `${p.seances} séances en 1 semaine`, sub: "contre toi · tiens ton planning", kind: "self", from: 0, to: p.seances, cur: 0, unit: "séances", deadline: now + WEEK, metric: "sessions" } });
  const launch = (c: Omit<ChallengeX, "id" | "createdAt">) => { act.addChallenge(c as Omit<Challenge, "id" | "createdAt">); setTab(0); };

  // démo amis / salle avec tes vrais chiffres
  const demo = tab === 2 ? [{ t: `Couché vs ${MEMBERS[1].name}`, s: `entre amis · démo · toi ${perfcKg(my1("bench"))} kg · ${MEMBERS[1].name} ${perfcKg(MEMBERS[1].bench)} kg`, v: `${perfcKg(my1("bench"))} kg`, pct: Math.min(100, (my1("bench") / MEMBERS[1].bench) * 100), ph: "photo-bench" as ImgName },
    { t: `Squat vs ${MEMBERS[3].name}`, s: `entre amis · démo · toi ${perfcKg(my1("squat"))} kg · ${MEMBERS[3].name} ${perfcKg(MEMBERS[3].squat)} kg`, v: `${perfcKg(my1("squat"))} kg`, pct: Math.min(100, (my1("squat") / MEMBERS[3].squat) * 100), ph: "photo-squat" as ImgName }]
    : tab === 3 ? [{ t: "Tonnage du mois", s: `salle · démo · ${MEMBERS.length + 1} participants · meneur ${MEMBERS[0].name} ${perfcNum(MEMBERS[0].monthVol / 1000, 1)} t`, v: `${perfcNum(monthVol / 1000, 1)} t`, pct: Math.min(100, (monthVol / MEMBERS[0].monthVol) * 100), ph: "photo-deadlift" as ImgName },
      { t: "Séances de la semaine", s: `salle · démo · meneur ${MEMBERS[0].name} ${MEMBERS[0].weekSessions} séances`, v: `${history.filter((s) => now - s.startedAt < WEEK).length}`, pct: Math.min(100, (history.filter((s) => now - s.startedAt < WEEK).length / MEMBERS[0].weekSessions) * 100), ph: "photo-gym" as ImgName }] : [];

  if (form) {
    const m = METRICS[form.mi]; const cur = current({ metric: m.id, ref: m.ref, createdAt: now } as ChallengeX);
    const parse = (s: string) => { if (m.unit === "s" && s.includes(":")) { const [a1, b1, c1] = s.split(":").map(Number); return c1 != null ? a1 * 3600 + b1 * 60 + c1 : a1 * 60 + b1; } const v = parseFloat(s.replace(",", ".")); return isFinite(v) ? v : 0; };
    const create = () => { const from = form.from ? parse(form.from) : cur ?? 0; const to = parse(form.to); if (!to) return; act.addChallenge({ title: form.title || `${m.label} ${form.to}`, sub: `${form.kind === "self" ? "contre toi" : form.kind === "friend" ? "entre amis" : "salle"} · ${fmt({ unit: m.unit } as ChallengeX, from)} → ${fmt({ unit: m.unit } as ChallengeX, to)}`, kind: form.kind, from, to, cur: cur ?? from, unit: m.unit, lower: m.lower, deadline: now + form.weeks * WEEK, metric: m.id, ref: m.ref } as Omit<Challenge, "id" | "createdAt">); setForm(null); setTab(0); };
    return (
      <Page>
        <Top title="Nouveau défi" sub="fixe une cible et une échéance" onBack={() => setForm(null)} />
        <Field label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder={`${m.label} ${form.to || "…"}`} />
        <H2>Type</H2>
        <Pills items={["Contre moi", "Entre amis", "Salle"]} on={["self", "friend", "gym"].indexOf(form.kind)} onChange={(i) => setForm({ ...form, kind: (["self", "friend", "gym"] as const)[i] })} />
        {form.kind !== "self" ? <Sub>Entre amis et salle : la comparaison en direct arrivera avec le serveur ; en attendant, ta progression est suivie.</Sub> : null}
        <H2>Mesure</H2>
        <Pills items={METRICS.map((x) => x.label)} on={form.mi} onChange={(i) => setForm({ ...form, mi: i })} />
        {cur != null ? <Sub>Ta valeur actuelle : {fmt({ unit: m.unit } as ChallengeX, cur)} (suivie automatiquement).</Sub> : <Sub>Pas encore de donnée : indique ta valeur de départ.</Sub>}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}><Field label={`Départ${m.unit ? ` (${m.unit === "s" ? "mm:ss" : m.unit})` : ""}`} value={form.from} onChange={(v) => setForm({ ...form, from: v })} placeholder={cur != null ? (m.unit === "s" ? fmtTime(cur) : String(Math.round(cur * 10) / 10)) : "0"} keyboard={m.unit === "s" ? "numbers-and-punctuation" : "decimal-pad"} /></View>
          <View style={{ flex: 1 }}><Field label={`Cible${m.unit ? ` (${m.unit === "s" ? "mm:ss" : m.unit})` : ""}`} value={form.to} onChange={(v) => setForm({ ...form, to: v })} placeholder={m.unit === "s" ? "22:00" : "…"} keyboard={m.unit === "s" ? "numbers-and-punctuation" : "decimal-pad"} /></View>
        </View>
        <H2>Échéance</H2>
        <Pills items={[2, 3, 4, 6, 8, 12].map((w) => `${w} semaines`)} on={[2, 3, 4, 6, 8, 12].indexOf(form.weeks)} onChange={(i) => setForm({ ...form, weeks: [2, 3, 4, 6, 8, 12][i] })} />
        <Btn label="Lancer le défi" kind="white" onPress={create} style={{ marginTop: 6 }} />
      </Page>
    );
  }

  return (
    <Page>
      <Top title="Se challenger" sub="bats-toi toi-même, puis les autres" onBack={() => router.back()} right={<Circ icon="plus" size={38} kind="primary" onPress={() => setForm({ title: "", kind: "self", mi: 0, from: "", to: "", weeks: 4 })} />} />
      <Pills items={TABS} on={tab} onChange={(i) => { setTab(i); setOpen(null); }} />
      {demo.length ? <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><PerfC_Demo text="démo · serveur à venir" /><Sub>tes chiffres sont réels, ceux des autres sont une démonstration</Sub></View> : null}
      {demo.map((d) => (
        <View key={d.t} style={{ gap: 8, paddingVertical: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <PerfC_Thumb photo={d.ph} size={48} r={12} />
            <View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{d.t}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }} numberOfLines={2}>{d.s}</Text></View>
            <View style={{ alignItems: "flex-end" }}><Text style={{ fontFamily: man(700), fontSize: 16, color: C.txt }}>{d.v}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>toi</Text></View>
          </View>
          <Progress pct={d.pct} color={d.pct >= 100 ? C.green : C.orange} h={5} />
        </View>
      ))}
      {!list.length && !demo.length ? <PerfC_Empty icon="trophy" title={tab === 4 ? "Aucun défi terminé" : "Aucun défi en cours"} text={tab === 4 ? "Tes défis réussis ou abandonnés apparaîtront ici." : "Lance un des défis proposés ci-dessous ou crée le tien avec le bouton +."} /> : null}
      {list.map((c) => { const v = current(c) ?? c.cur; const pc = pct(c, v); const left = weeksLeft(c); const isOpen = open === c.id; return (
        <Pressable key={c.id} onPress={() => setOpen(isOpen ? null : c.id)} style={{ gap: 8, paddingVertical: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <PerfC_Thumb photo={photo(c)} size={48} r={12} />
            <View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{c.title}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }} numberOfLines={2}>{c.sub}{c.done ? "" : ` · ${left ? `${left} sem. restante${left > 1 ? "s" : ""}` : "échéance dépassée"}`}</Text></View>
            <View style={{ alignItems: "flex-end" }}><Text style={{ fontFamily: man(700), fontSize: 16, color: pc >= 100 ? C.green : C.txt }}>{fmt(c, v)}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>cible {fmt(c, c.to)}</Text></View>
          </View>
          <Progress pct={pc} color={pc >= 100 ? C.green : c.kind === "gym" ? C.orange : C.accent} h={5} />
          {isOpen ? (
            <View style={{ gap: 8, paddingTop: 4 }}>
              <Sub>{pc} % · départ {fmt(c, c.from)} · échéance {perfcDate(c.deadline)}{c.metric && c.metric !== "manual" ? " · valeur suivie automatiquement" : ""}</Sub>
              {!c.done ? <View style={{ flexDirection: "row", gap: 8 }}>
                <Btn label="Terminé" kind="white" size="sm" full={false} icon="check" onPress={() => act.updateChallenge(c.id, { done: true, cur: v })} />
                <Btn label="Abandonner" kind="secondary" size="sm" full={false} onPress={() => act.removeChallenge(c.id)} />
                {c.metric === "manual" ? <Btn label="+1" kind="secondary" size="sm" full={false} onPress={() => act.updateChallenge(c.id, { cur: c.cur + 1 })} /> : null}
              </View> : <Btn label="Supprimer" kind="secondary" size="sm" full={false} onPress={() => act.removeChallenge(c.id)} />}
            </View>
          ) : null}
        </Pressable>
      ); })}

      {tab !== 4 ? <>
        <H2>Défis proposés pour toi</H2>
        {props.slice(0, 3).map((x, i) => <PerfC_Advice key={i} icon={i === 0 ? "bolt" : i === 1 ? "star" : "trophy"} color={i === 0 ? C.accent : C.orange} title={x.title} text={x.sub} action="Lancer" onAction={() => launch(x.c)} />)}
      </> : null}
    </Page>
  );
}
