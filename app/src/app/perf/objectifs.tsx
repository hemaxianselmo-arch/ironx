import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Page, Top, Circ, Pills, Field, Search, Btn, H2, Sub, Progress, Seg, PerfA_Empty, PerfA_Advice, perfaDate, perfaKg } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, bestOf } from "../../store/workout";
import { useProfile } from "../../store/profile";
import { useActivities, act, Goal, bestRunTime, bestHyrox, hyroxTotal, bestStreet, fmtTime, STREET_MOVES, RUN_DISTS } from "../../store/activities";
import { byId, e1rm, EXERCISES, PREVIOUS_BEST } from "../../data/seed";

const KINDS: { kind: Goal["kind"]; label: string; unit: string; lower?: boolean }[] = [
  { kind: "exo1rm", label: "1RM", unit: "kg" }, { kind: "exoreps", label: "Reps", unit: "reps" }, { kind: "run", label: "Course", unit: "s", lower: true }, { kind: "hyrox", label: "Hyrox", unit: "s", lower: true },
  { kind: "street", label: "Street", unit: "" }, { kind: "bodyweight", label: "Poids", unit: "kg" }, { kind: "sessions", label: "Séances", unit: "séances" },
];
const DEADLINES: [string, () => number][] = [["1 mois", () => Date.now() + 30 * 86400e3], ["3 mois", () => Date.now() + 91 * 86400e3], ["6 mois", () => Date.now() + 182 * 86400e3], ["fin d'année", () => new Date(new Date().getFullYear(), 11, 31).getTime()]];
const bestReps = (exoId: string, history: ReturnType<typeof useWorkout>["history"]) => { let r = Math.max(0, ...(PREVIOUS_BEST[exoId] ?? []).map((s) => s.reps)); for (const s of history) for (const e of s.exos) if (e.exoId === exoId) for (const x of e.sets) if (x.done) r = Math.max(r, x.reps); return r; };
const sessionsThisMonth = (history: ReturnType<typeof useWorkout>["history"]) => { const n = new Date(); return history.filter((s) => { const d = new Date(s.startedAt); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length; };

/** Valeur actuelle d'un objectif, calculée en direct */
function current(g: Goal, history: ReturnType<typeof useWorkout>["history"], poids: number): number | undefined {
  switch (g.kind) {
    case "exo1rm": { const b = bestOf(g.ref ?? ""); return b ? e1rm(b.kg, b.reps) : undefined; }
    case "exoreps": return bestReps(g.ref ?? "", history) || undefined;
    case "run": return bestRunTime(Number(g.ref) || 5000);
    case "hyrox": { const h = bestHyrox(); return h ? hyroxTotal(h) : undefined; }
    case "street": return bestStreet(g.ref ?? "")?.value;
    case "bodyweight": return poids;
    case "sessions": return sessionsThisMonth(history);
  }
}
const fmtVal = (g: Goal, v: number) => (g.unit === "s" ? fmtTime(v) : g.unit === "séances" ? String(Math.round(v)) : `${perfaKg(v)} ${g.unit}`.trim());

/** R07 · Objectifs : progression, rythme, formulaire d'ajout, suggestions */
export default function PerfObjectifs() {
  const { history } = useWorkout(); const { goals } = useActivities(); const profile = useProfile(); const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false); const [sel, setSel] = useState<Goal | null>(null);
  // formulaire
  const [k, setK] = useState(0); const [q, setQ] = useState(""); const [ref, setRef] = useState<string>(""); const [target, setTarget] = useState(""); const [dl, setDl] = useState(1); const [tMin, setTMin] = useState(""); const [tSec, setTSec] = useState("");
  const kind = KINDS[k];
  const exos = useMemo(() => EXERCISES.filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6), [q]);
  const rows = goals.map((g) => {
    const cur = current(g, history, profile.poids) ?? g.from; const span = g.to - g.from || 1;
    const pct = Math.max(0, Math.min(100, Math.round(((g.lower ? g.from - cur : cur - g.from) / Math.abs(span)) * 100)));
    const done = g.done || (g.lower ? cur <= g.to : cur >= g.to);
    const expected = g.deadline ? Math.min(100, Math.max(0, ((Date.now() - g.createdAt) / Math.max(1, g.deadline - g.createdAt)) * 100)) : 0;
    const late = !done && g.deadline != null && pct < expected * 0.9 && expected > 10;
    return { g, cur, pct, done, late };
  });
  const reset = () => { setQ(""); setRef(""); setTarget(""); setTMin(""); setTSec(""); setK(0); setDl(1); };
  const fromValue = (): number => {
    const g = { kind: kind.kind, ref: ref || (kind.kind === "run" ? "5000" : "") } as Goal;
    return current(g, history, profile.poids) ?? (kind.kind === "sessions" ? sessionsThisMonth(history) : 0);
  };
  const toValue = () => (kind.unit === "s" ? (Number(tMin) || 0) * 60 + (Number(tSec) || 0) : Number(target.replace(",", ".")) || 0);
  const label = () => {
    if (kind.kind === "exo1rm" || kind.kind === "exoreps") return `${byId(ref)?.name ?? "Exercice"} · ${kind.kind === "exo1rm" ? "1RM" : "reps"}`;
    if (kind.kind === "run") return `${RUN_DISTS.find(([d]) => String(d) === ref)?.[1] ?? "5 km"} · temps`;
    if (kind.kind === "street") return STREET_MOVES.find((m) => m.id === ref)?.name ?? "Street";
    return { hyrox: "Hyrox · temps total", bodyweight: "Poids de corps", sessions: "Séances ce mois" }[kind.kind as "hyrox" | "bodyweight" | "sessions"];
  };
  const canAdd = toValue() > 0 && (!["exo1rm", "exoreps", "street"].includes(kind.kind) || !!ref);
  const add = () => {
    const unit = kind.kind === "street" ? (STREET_MOVES.find((m) => m.id === ref)?.kind === "sec" ? "s" : STREET_MOVES.find((m) => m.id === ref)?.kind === "kg" ? "kg" : "reps") : kind.unit;
    act.addGoal({ kind: kind.kind, label: label(), ref: ref || (kind.kind === "run" ? "5000" : undefined), from: fromValue(), to: toValue(), unit, deadline: DEADLINES[dl][1](), lower: kind.lower || (kind.kind === "bodyweight" && toValue() < fromValue()) });
    setOpen(false); reset();
  };

  // suggestions calculées
  const suggestions = useMemo(() => {
    const out: Omit<Goal, "id" | "createdAt">[] = []; const in3 = Date.now() + 91 * 86400e3;
    const lifts = ["bench", "squat", "deadlift", "ohp"].map((id) => ({ id, b: bestOf(id) })).filter((x) => x.b);
    if (lifts.length) { const top = lifts.reduce((a, b) => (e1rm(b.b!.kg, b.b!.reps) > e1rm(a.b!.kg, a.b!.reps) ? b : a)); const v = e1rm(top.b!.kg, top.b!.reps); out.push({ kind: "exo1rm", label: `${byId(top.id).name} · 1RM`, ref: top.id, from: v, to: v + 10, unit: "kg", deadline: in3 }); }
    const t5 = bestRunTime(5000); if (t5) out.push({ kind: "run", label: "5 km · temps", ref: "5000", from: t5, to: Math.max(60, t5 - 60), unit: "s", deadline: in3, lower: true });
    const pu = bestStreet("pullup")?.value ?? bestReps("pullup", history); if (pu) out.push({ kind: bestStreet("pullup") ? "street" : "exoreps", label: "Tractions · reps", ref: "pullup", from: pu, to: pu + 1, unit: "reps", deadline: Date.now() + 30 * 86400e3 });
    if (out.length < 3) out.push({ kind: "sessions", label: "Séances ce mois", from: sessionsThisMonth(history), to: Math.max(12, profile.seances * 4), unit: "séances", deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() });
    if (out.length < 3 && profile.poidsVise !== profile.poids) out.push({ kind: "bodyweight", label: "Poids de corps", from: profile.poids, to: profile.poidsVise, unit: "kg", deadline: in3, lower: profile.poidsVise < profile.poids });
    return out.filter((s) => !goals.some((g) => g.kind === s.kind && g.ref === s.ref && !g.done)).slice(0, 3);
  }, [history, goals, profile]);

  return (
    <Page>
      <Top title="Objectifs" sub={`${rows.filter((r) => !r.done).length} en cours · ${rows.filter((r) => r.done).length} atteint${rows.filter((r) => r.done).length > 1 ? "s" : ""}`} right={<Circ icon="plus" size={38} kind="primary" onPress={() => setOpen(true)} />} onBack={() => router.back()} />
      {!rows.length ? <PerfA_Empty icon="star" title="Fixe-toi un objectif" text="Un 1RM, un chrono sur 5 km, une traction de plus… IRONX suit ta progression en direct et te dit si tu es dans les temps." cta="Ajouter un objectif" onPress={() => setOpen(true)} /> : null}
      {rows.map(({ g, cur, pct, done, late }) => (
        <Pressable key={g.id} onPress={() => setSel(g)} style={{ borderRadius: 20, padding: 16, backgroundColor: C.surf, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{g.label}</Text>
              <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{fmtVal(g, g.from)} → <Text style={{ color: C.soft }}>{fmtVal(g, g.to)}</Text>{g.deadline ? ` · ${perfaDate(g.deadline)}` : ""}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <Text style={{ fontFamily: man(700), fontSize: 18, color: done ? C.green : C.txt }}>{done ? "Atteint" : fmtVal(g, cur)}</Text>
              <Text style={{ fontFamily: inter(500), fontSize: 11, color: done ? C.green : late ? C.orange : C.green }}>{done ? "bravo" : late ? "en retard" : "rythme OK"} · {pct} %</Text>
            </View>
          </View>
          <Progress pct={done ? 100 : pct} color={done ? C.green : late ? C.orange : C.accent} />
        </Pressable>
      ))}
      {suggestions.length ? <H2>Suggérés</H2> : null}
      {suggestions.map((s, i) => <PerfA_Advice key={i} icon="star" title={`${s.label} : ${fmtVal(s as Goal, s.to)}`} text={`actuellement ${fmtVal(s as Goal, s.from)} · d'ici le ${perfaDate(s.deadline)}`} action="Ajouter" onAction={() => act.addGoal(s)} />)}

      {/* détail d'un objectif */}
      <Modal visible={!!sel} transparent animationType="slide" onRequestClose={() => setSel(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={() => setSel(null)} />
        {sel ? (
          <View style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingBottom: Math.max(insets.bottom, 16) + 12, gap: 14, backgroundColor: C.surf }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center" }} />
            <Text style={{ fontFamily: man(700), fontSize: 18, color: C.txt }}>{sel.label}</Text>
            <Sub>Départ {fmtVal(sel, sel.from)} · cible {fmtVal(sel, sel.to)} · actuel {fmtVal(sel, current(sel, history, profile.poids) ?? sel.from)}{sel.deadline ? ` · échéance ${perfaDate(sel.deadline)}` : ""} · créé le {perfaDate(sel.createdAt)}</Sub>
            <Btn label={sel.done ? "Remettre en cours" : "Marquer comme atteint"} kind="secondary" icon="check" onPress={() => { act.updateGoal(sel.id, { done: !sel.done }); setSel(null); }} />
            <Btn label="Supprimer" kind="secondary" icon="x" onPress={() => { act.removeGoal(sel.id); setSel(null); }} />
          </View>
        ) : null}
      </Modal>

      {/* formulaire d'ajout */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={() => setOpen(false)} />
        <View style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16) + 12, backgroundColor: C.surf, maxHeight: "85%" }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 10 }} />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontFamily: man(700), fontSize: 18, color: C.txt }}>Nouvel objectif</Text>
            <Pills items={KINDS.map((x) => x.label)} on={k} onChange={(i) => { setK(i); setRef(""); setQ(""); }} />
            {kind.kind === "exo1rm" || kind.kind === "exoreps" ? (
              <View style={{ gap: 8 }}>
                <Search ph="Exercice" value={q} onChange={setQ} />
                {exos.map((e) => <Pressable key={e.id} onPress={() => { setRef(e.id); setQ(e.name); }} style={{ paddingVertical: 9, flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(ref === e.id ? 700 : 400), fontSize: 14, color: C.txt }}>{e.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{e.primary}</Text></Pressable>)}
              </View>
            ) : null}
            {kind.kind === "run" ? <Pills items={RUN_DISTS.map(([, l]) => l)} on={Math.max(0, RUN_DISTS.findIndex(([d]) => String(d) === ref))} onChange={(i) => setRef(String(RUN_DISTS[i][0]))} /> : null}
            {kind.kind === "street" ? <Pills items={STREET_MOVES.map((m) => m.name)} on={Math.max(0, STREET_MOVES.findIndex((m) => m.id === ref))} onChange={(i) => setRef(STREET_MOVES[i].id)} /> : null}
            <Sub>Actuellement : {fromValue() ? fmtVal({ unit: kind.kind === "street" ? "" : kind.unit } as Goal, fromValue()) : "—"}</Sub>
            {kind.unit === "s" ? (
              <View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><Field label="Minutes" value={tMin} onChange={setTMin} keyboard="number-pad" placeholder="22" /></View><View style={{ flex: 1 }}><Field label="Secondes" value={tSec} onChange={setTSec} keyboard="number-pad" placeholder="30" /></View></View>
            ) : <Field label={`Valeur cible${kind.unit ? ` (${kind.unit})` : ""}`} value={target} onChange={setTarget} keyboard="decimal-pad" placeholder="ex. 120" />}
            <View style={{ gap: 6 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Échéance</Text><Seg items={DEADLINES.map(([l]) => l)} on={dl} onChange={setDl} /></View>
            <Btn label="Ajouter l'objectif" onPress={canAdd ? add : undefined} style={{ opacity: canAdd ? 1 : 0.45 }} />
          </ScrollView>
        </View>
      </Modal>
    </Page>
  );
}
