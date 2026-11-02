import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, KV, H2, Sub, Btn, Field, MultiLine, FRow, B, PerfC_WeekPills, PerfC_Advice, PerfC_Empty, PERFC_MOIS, perfcMonday, perfcDayKey, perfcActivities, perfcKg } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, bestOf } from "../../store/workout";
import { useActivities, act, Block } from "../../store/activities";
import { useProfile, weekPlan } from "../../store/profile";
import { e1rm, byId } from "../../data/seed";

type Focus = Block["focus"]; type Wk = Block["weeks"][number];
const FOCUS: Focus[] = ["force", "hypertrophie", "endurance", "hyrox", "decharge", "mixte"];
const FOCUS_LABEL: Record<Focus, string> = { force: "Force", hypertrophie: "Hypertrophie", endurance: "Endurance", hyrox: "Hyrox", decharge: "Décharge", mixte: "Mixte" };
const DUREES = [4, 5, 6, 8];
const W = 7 * 86400e3;

/** Génère les semaines d'un bloc : phases (volume → intensité → pic → décharge) adaptées à la durée */
function genWeeks(focus: Focus, n: number): Wk[] {
  const base: Record<Focus, Wk[]> = {
    force: [{ label: "volume", intensity: [70, 75], volumeDelta: 0 }, { label: "volume", intensity: [75, 80], volumeDelta: 10 }, { label: "intensité", intensity: [80, 85], volumeDelta: 0 }, { label: "intensité", intensity: [82, 87], volumeDelta: -10 }, { label: "pic", intensity: [88, 95], volumeDelta: -25 }, { label: "décharge", intensity: [60, 65], volumeDelta: -40 }],
    hypertrophie: [{ label: "base", intensity: [65, 70], volumeDelta: 0 }, { label: "volume", intensity: [67, 72], volumeDelta: 10 }, { label: "volume", intensity: [70, 75], volumeDelta: 15 }, { label: "surcharge", intensity: [70, 75], volumeDelta: 20 }, { label: "intensité", intensity: [72, 77], volumeDelta: 10 }, { label: "décharge", intensity: [55, 60], volumeDelta: -40 }],
    endurance: [{ label: "base", intensity: [60, 70], volumeDelta: 0 }, { label: "base", intensity: [65, 75], volumeDelta: 10 }, { label: "build", intensity: [70, 80], volumeDelta: 15 }, { label: "build", intensity: [75, 85], volumeDelta: 10 }, { label: "pic", intensity: [85, 95], volumeDelta: -20 }, { label: "décharge", intensity: [55, 65], volumeDelta: -40 }],
    hyrox: [{ label: "base", intensity: [65, 75], volumeDelta: 0 }, { label: "stations", intensity: [70, 80], volumeDelta: 10 }, { label: "stations", intensity: [75, 85], volumeDelta: 10 }, { label: "simu", intensity: [80, 90], volumeDelta: 0 }, { label: "pic", intensity: [85, 95], volumeDelta: -20 }, { label: "décharge", intensity: [55, 65], volumeDelta: -40 }],
    decharge: [{ label: "décharge", intensity: [55, 65], volumeDelta: -40 }, { label: "décharge", intensity: [60, 65], volumeDelta: -35 }, { label: "reprise", intensity: [65, 70], volumeDelta: -20 }, { label: "reprise", intensity: [70, 75], volumeDelta: -10 }, { label: "reprise", intensity: [70, 75], volumeDelta: 0 }, { label: "reprise", intensity: [72, 77], volumeDelta: 0 }],
    mixte: [{ label: "volume", intensity: [68, 74], volumeDelta: 0 }, { label: "volume", intensity: [72, 78], volumeDelta: 10 }, { label: "intensité", intensity: [78, 84], volumeDelta: 0 }, { label: "intensité", intensity: [80, 86], volumeDelta: -10 }, { label: "pic", intensity: [85, 92], volumeDelta: -25 }, { label: "décharge", intensity: [60, 65], volumeDelta: -40 }],
  };
  const b = base[focus];
  const pick: Record<number, number[]> = { 4: [0, 2, 4, 5], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 8: [0, 0, 1, 2, 2, 3, 4, 5] };
  return (pick[n] ?? pick[6]).map((i) => ({ ...b[i], intensity: [...b[i].intensity] as [number, number] }));
}
const mainLift = (name: string): string | undefined => { const n = name.toLowerCase(); if (/hyrox|cardio|course/.test(n)) return undefined; if (/couch|push|haut a|haut$|full a|pouss/.test(n)) return "bench"; if (/squat|legs|bas|jambe|full b/.test(n)) return "squat"; if (/soulev|pull|tirage|full c|dos/.test(n)) return "deadlift"; if (/haut b/.test(n)) return "ohp"; return "squat"; };
const scheme = (f: Focus): [number, number] => (f === "force" || f === "mixte" ? [4, 4] : f === "hypertrophie" ? [4, 8] : f === "decharge" ? [3, 6] : [3, 10]);

/** R20 · Bloc en cours — création d'un bloc ou suivi semaine par semaine avec charges calculées depuis tes 1RM estimés */
export default function Bloc() {
  const { history } = useWorkout(); const a = useActivities(); const p = useProfile();
  const active = a.blocks.find((b) => b.active);
  const [create, setCreate] = useState<Partial<{ focus: Focus; name: string; dur: number; tLabel: string; tValue: string }> | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const acts = perfcActivities(history);
  const doneDays = new Set(acts.map((x) => perfcDayKey(x.at)));

  if (!active || create) {
    const c = create ?? {}; const focus = c.focus ?? "force"; const dur = c.dur ?? 6; const weeks = genWeeks(focus, dur);
    const name = c.name ?? `${FOCUS_LABEL[focus]} · ${dur} semaines`;
    const go = () => { act.addBlock({ name, focus, weeks, startAt: perfcMonday(Date.now()).getTime(), targetLabel: c.tLabel || undefined, targetValue: c.tValue || undefined, active: true }); setCreate(null); setSel(null); };
    return (
      <Page>
        <Top title={active ? "Nouveau bloc" : "Bloc en cours"} sub={active ? `remplace « ${active.name} »` : "aucun bloc actif · crée ton premier bloc"} onBack={() => (active ? setCreate(null) : router.back())} />
        {!active ? <PerfC_Empty icon="cal" title="Planifie ton prochain cycle" text="Un bloc organise tes semaines : volume, intensité, pic, décharge. Les charges sont calculées depuis tes 1RM estimés." /> : null}
        <H2>Nom</H2>
        <Field label="Nom du bloc" value={c.name ?? ""} onChange={(v) => setCreate({ ...c, name: v })} placeholder={name} />
        <H2>Focus</H2>
        <Pills items={FOCUS.map((f) => FOCUS_LABEL[f])} on={FOCUS.indexOf(focus)} onChange={(i) => setCreate({ ...c, focus: FOCUS[i] })} />
        <H2>Durée</H2>
        <Pills items={DUREES.map((d) => `${d} semaines`)} on={DUREES.indexOf(dur)} onChange={(i) => setCreate({ ...c, dur: DUREES[i] })} />
        <H2>Objectif du bloc</H2>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1.4 }}><Field label="Quoi" value={c.tLabel ?? ""} onChange={(v) => setCreate({ ...c, tLabel: v })} placeholder="Squat" /></View>
          <View style={{ flex: 1 }}><Field label="Valeur" value={c.tValue ?? ""} onChange={(v) => setCreate({ ...c, tValue: v })} placeholder="150 kg" /></View>
        </View>
        <H2>Semaines générées</H2>
        {weeks.map((w, i) => <FRow key={i} left={<View style={{ width: 44, height: 36, borderRadius: 12, backgroundColor: C.surf, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: man(700), fontSize: 14, color: C.txt }}>S{i + 1}</Text></View>} text={<B>{w.label}</B>} sub={`intensité ${w.intensity[0]} – ${w.intensity[1]} % · volume ${w.volumeDelta > 0 ? "+" : w.volumeDelta < 0 ? "−" : ""}${Math.abs(w.volumeDelta)} %`} />)}
        <Btn label="Lancer le bloc" kind="white" onPress={go} />
        {active ? <Btn label="Annuler" kind="secondary" size="md" onPress={() => setCreate(null)} /> : null}
      </Page>
    );
  }

  const n = active.weeks.length; const cur = Math.max(0, Math.min(n - 1, Math.floor((Date.now() - active.startAt) / W)));
  const view = sel ?? cur; const wk = active.weeks[view]; const finished = Date.now() - active.startAt >= n * W;
  const end = new Date(active.startAt + n * W - 86400e3);
  const monday = active.startAt + view * W; const plan = weekPlan(p);
  const [setsN, repsN] = scheme(active.focus); const pct = Math.round((wk.intensity[0] + wk.intensity[1]) / 2);
  const next = active.focus === "force" ? { f: "hypertrophie" as Focus, d: 5, why: "après la force, un cycle de volume pour construire du muscle · 16 à 20 séries / muscle" } : active.focus === "hypertrophie" ? { f: "force" as Focus, d: 6, why: "après le volume, convertis le muscle en force · 3 à 5 reps à 80-90 %" } : n >= 6 && active.focus !== "decharge" ? { f: "decharge" as Focus, d: 4, why: "6 semaines ou plus : une décharge avant de repartir" } : { f: "mixte" as Focus, d: 6, why: "un cycle équilibré force + volume" };
  const stop = () => act.updateBlock(active.id, { active: false });

  return (
    <Page>
      <Top title="Bloc en cours" sub={`${active.name} · semaine ${cur + 1} / ${n}`} onBack={() => router.back()} right={<Circ icon="edit" size={38} onPress={() => setCreate({})} />} />
      <PerfC_WeekPills n={n} cur={cur} labels={active.weeks.map((w) => w.label)} onPress={setSel} />
      {finished ? <Sub color={C.green}>Bloc terminé : enregistre le résultat et planifie le suivant.</Sub> : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Objectif du bloc" v={active.targetLabel ? `${active.targetLabel} ${active.targetValue ?? ""}`.trim() : "—"} />
        <KV k="Intensité" v={`${wk.intensity[0]} – ${wk.intensity[1]} %`} align="center" />
        <KV k="Volume / sem." v={`${wk.volumeDelta > 0 ? "+" : wk.volumeDelta < 0 ? "−" : ""}${Math.abs(wk.volumeDelta)} %`} align="center" />
        <KV k="Fin" v={`${end.getDate()} ${PERFC_MOIS[end.getMonth()]}`} align="flex-end" />
      </View>
      <MultiLine series={[{ color: C.accent, points: active.weeks.map((w) => (w.intensity[0] + w.intensity[1]) / 2) }, { color: C.blue, points: active.weeks.map((w) => 100 + w.volumeDelta) }]} labels={active.weeks.map((_, i) => `S${i + 1}`)} h={120} />
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}><Text style={{ color: C.accent }}>—</Text> Intensité % 1RM</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}><Text style={{ color: C.blue }}>—</Text> Volume (séries)</Text>
      </View>

      <H2>{view === cur ? "Cette semaine" : "Semaine"} · S{view + 1}</H2>
      {plan.filter(([, nm]) => nm).length ? plan.map(([, nm], i) => {
        if (!nm) return null; const t = monday + i * 86400e3; const d = new Date(t); const done = doneDays.has(perfcDayKey(t));
        const lift = mainLift(nm); const b = lift ? bestOf(lift) : undefined; const rm = b ? e1rm(b.kg, b.reps) : 0; const kg = rm ? Math.round((rm * pct) / 100 / 2.5) * 2.5 : 0;
        const prescription = lift ? `${nm} · ${setsN} × ${repsN} à ${pct} %${kg ? ` (${perfcKg(kg)} kg)` : ""}` : `${nm} · ${wk.label}`;
        return <FRow key={i} left={<View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.surf, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt, lineHeight: 18 }}>{d.getDate()}</Text><Text style={{ fontFamily: inter(400), fontSize: 9, color: C.mut }}>{PERFC_MOIS[d.getMonth()].replace(".", "").toUpperCase()}</Text></View>} text={<B>{prescription}</B>} sub={`${["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][i]}${lift ? ` · ${byId(lift)?.name ?? lift}${rm ? "" : " · 1RM inconnu : fais une série pour calibrer"}` : ""}`} right={done ? <Text style={{ fontFamily: inter(600), fontSize: 12, color: C.green }}>fait</Text> : t < Date.now() - 86400e3 ? <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>manqué</Text> : null} />;
      }) : <Sub>Choisis tes jours d'entraînement dans ton profil pour voir les séances de la semaine.</Sub>}

      <H2>Prochain bloc suggéré</H2>
      <PerfC_Advice icon="bolt" title={`${FOCUS_LABEL[next.f]} · ${next.d} semaines`} text={`après la fin du ${end.getDate()} ${PERFC_MOIS[end.getMonth()]} · ${next.why}`} action="Planifier" actionKind="secondary" onAction={() => setCreate({ focus: next.f, dur: next.d })} />
      <Btn label="Terminer le bloc" kind="secondary" size="md" onPress={stop} style={{ marginTop: 6 }} />
    </Page>
  );
}
