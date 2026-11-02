import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Btn, Media, Shade, Ov, OvText, OvTitle, Play, KV, Label, Big, Pill, H2, FRow, ExoThumb, Icon, Mono, B, Seg } from "../../ui";
import { C, inter, man, PAD } from "../../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkout, actions, fmtT, fmtKg, bestOf } from "../../store/workout";
import { byId, e1rm, KIND_LABEL } from "../../data/seed";

/** Curseur discret (RPE) */
function Slider({ value, max, onChange, labels }: { value: number; max: number; onChange: (v: number) => void; labels: string[] }) {
  const [w, setW] = useState(1);
  const pick = (x: number) => onChange(Math.max(0, Math.min(max, Math.round((x / w) * max))));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderGrant={(e) => pick(e.nativeEvent.locationX)} onResponderMove={(e) => pick(e.nativeEvent.locationX)} style={{ paddingVertical: 8 }}>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" }}><View style={{ width: `${(value / max) * 100}%`, height: 4, borderRadius: 2, backgroundColor: C.accent }} /></View>
      <View style={{ position: "absolute", top: 1, left: `${(value / max) * 100}%`, marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: C.txt }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 6 }}>{labels.map((l) => <Text key={l} style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{l}</Text>)}</View>
    </View>
  );
}
const useNow = (ms = 1000) => { const [n, setN] = useState(Date.now()); useEffect(() => { const t = setInterval(() => setN(Date.now()), ms); return () => clearInterval(t); }, [ms]); return n; };

/** Ligne de série (set_line) */
function SetLine({ n, kg, reps, state, note, onPress }: { n: number; kg: string; reps: string; state: "done" | "cur" | "todo"; note?: string; onPress?: () => void }) {
  const col = state === "todo" ? C.mut : C.txt;
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }}>
      {state === "done" ? (
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }}><Icon name="check" size={13} color={C.bg} w={3} /></View>
      ) : (
        <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: state === "cur" ? C.txt : "rgba(255,255,255,0.08)" }}>
          <Text style={{ fontFamily: inter(700), fontSize: 12, color: state === "cur" ? C.bg : C.mut }}>{n}</Text>
        </View>
      )}
      <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, color: col }}>{note ?? `Série ${n}`}</Text>
      <Text style={{ fontFamily: man(700), fontSize: 15, color: col }}>{kg} × {reps}</Text>
    </Pressable>
  );
}

/** S09 · Saisie d'une série — feuille avec pavé numérique */
function SetSheet({ visible, title, prev, kg, reps, rpe0, flags0, editing, onClose, onValidate, onDelete }: { visible: boolean; title: string; prev: string; kg: number; reps: number; rpe0?: number; flags0?: string[]; editing?: boolean; onClose: () => void; onValidate: (kg: number, reps: number, rpe: number, flags: string[]) => void; onDelete?: () => void }) {
  const insets = useSafeAreaInsets();
  const [field, setField] = useState<"kg" | "reps">("kg");
  const [vals, setVals] = useState({ kg: fmtKg(kg), reps: String(reps) });
  const [rpe, setRpe] = useState(2);
  const [flags, setFlags] = useState<string[]>([]);
  const [fresh, setFresh] = useState(true);
  useEffect(() => { if (visible) { setVals({ kg: fmtKg(kg), reps: String(reps) }); setField("kg"); setFresh(true); setFlags(flags0 ?? []); setRpe(rpe0 ? Math.max(0, Math.min(8, Math.round((rpe0 - 6) * 2))) : 4); } }, [visible, kg, reps, rpe0, flags0]);
  const press = (k: string) => {
    if (k === "OK") { onValidate(parseFloat(vals.kg.replace(",", ".")) || 0, parseInt(vals.reps) || 0, 6 + rpe / 2, flags); return; }
    setVals((v) => { const cur = fresh ? "" : v[field]; if (k === "," && (field === "reps" || cur.includes(","))) return v; return { ...v, [field]: (cur + k).slice(0, 6) }; });
    setFresh(false);
  };
  const plates = useMemo(() => { let per = Math.max(0, ((parseFloat(vals.kg.replace(",", ".")) || 0) - 20) / 2); const out: number[] = []; for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) while (per >= p - 0.001) { out.push(p); per -= p; } return out; }, [vals.kg]);
  const PC: Record<number, [string, number]> = { 25: ["#E85A5A", 36], 20: ["#5A8BE8", 34], 15: ["#EDB63A", 30], 10: ["#4CAF7A", 26], 5: ["#E8E8E8", 20], 2.5: ["#E85A5A", 16], 1.25: ["#C9CDD4", 12] };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose} />
      <View style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16) + 12, gap: 14, backgroundColor: C.surf }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center" }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{title}{editing ? " · modifier" : ""}</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>préc. {prev}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 }}>
          {(["kg", "reps"] as const).map((f) => (
            <Pressable key={f} onPress={() => { setField(f); setFresh(true); }} style={{ alignItems: "center", gap: 4, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1.5, borderColor: field === f ? C.txt : "transparent" }}>
              <Label>{f}</Label><Big v={vals[f] || "0"} size={48} />
            </Pressable>
          )).reduce((acc: any[], el, i) => (i === 0 ? [el] : [...acc, <Text key="x" style={{ fontFamily: man(700), fontSize: 24, color: C.mut }}>×</Text>, el]), [])}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>RPE {6 + rpe / 2}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}><Slider value={rpe} max={8} onChange={setRpe} labels={["6", "7", "8", "9", "10"]} /></View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 13, color: C.mut }}>Plaques par côté</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>{plates.map((p, i) => <View key={i} style={{ width: p >= 10 ? 10 : 7, height: PC[p][1], borderRadius: 3, backgroundColor: PC[p][0] }} />)}</View>
          <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.txt }}>{plates.length ? plates.map(fmtKg).join(" + ") : "barre seule"}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 8, paddingRight: 16 }} style={{ flexGrow: 0, marginRight: -16 }}>
          {["Échec", "Drop set", "Rest-pause", "Échauffement", "AMRAP"].map((f) => <Pill key={f} label={f} on={flags.includes(f)} onPress={() => setFlags((v) => (v.includes(f) ? v.filter((x) => x !== f) : [...v, f]))} />)}
        </ScrollView>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "OK"].map((k) => (
            <Pressable key={k} onPress={() => press(k)} style={({ pressed }) => ({ width: "31.5%", height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: k === "OK" ? C.accent : pressed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)" })}>
              <Text style={{ fontFamily: man(700), fontSize: 20, color: k === "OK" ? "#fff" : C.txt }}>{k}</Text>
            </Pressable>
          ))}
        </View>
        {editing && onDelete ? <Text onPress={onDelete} style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center", padding: 4 }}>Supprimer cette série</Text> : null}
      </View>
    </Modal>
  );
}

/** S08 · Séance en cours */
export default function EnCours() {
  const { active, restUntil, restTotal, lastPR } = useWorkout();
  const now = useNow();
  const insets = useSafeAreaInsets();
  const [ei, setEi] = useState(0);
  const [sheet, setSheet] = useState<{ si: number } | null>(null);
  const [panel, setPanel] = useState<"rpe" | "repos" | null>(null);
  useEffect(() => { if (lastPR) router.push("/seance/record"); }, [lastPR]);
  if (!active) return <Page><Text style={{ color: C.mut }}>Aucune séance en cours.</Text><Btn label="Retour" kind="secondary" onPress={() => router.back()} /></Page>;

  const exo = active.exos[ei]; const def = byId(exo.exoId);
  const si = Math.max(0, exo.sets.findIndex((s) => !s.done)); const allDone = exo.sets.every((s) => s.done);
  const cur = exo.sets[allDone ? exo.sets.length - 1 : si];
  const best = bestOf(exo.exoId);
  const doneCount = active.exos.filter((e) => e.sets.every((s) => s.done)).length;
  const restLeft = restUntil ? restUntil - now : 0;

  return (
    <Page scroll={false} pad={false}>
      <ScrollView contentContainerStyle={{ padding: PAD, paddingTop: PAD + insets.top, gap: 14, paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Circ icon="x" size={38} onPress={() => { actions.discard(); router.back(); }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: man(700), fontSize: 18, letterSpacing: 1, color: C.txt }}>{fmtT(now - active.startedAt)}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{active.name} · {doneCount} / {active.exos.length} exos</Text>
          </View>
          <Btn label="Terminer" size="sm" full={false} onPress={() => { actions.finish(); router.replace("/seance/resume"); }} />
        </View>

        <Media photo={def.photo as any} h={140}>
          <Shade />
          <Ov x={14} y={12} anchor="lb"><OvText>Exercice {ei + 1}{exo.note ? ` · ${exo.note}` : ""}</OvText><OvTitle size={24}>{def.name}</OvTitle></Ov>
          <Ov x={12} y={12} anchor="rt"><Circ icon="chev" size={40} kind="glass" onPress={() => router.push({ pathname: "/seance/exo", params: { id: def.id } })} /></Ov>
        </Media>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Série" v={`${Math.min(si + 1, exo.sets.length)} / ${exo.sets.length}`} />
          <KV k="Précédent" v={best ? `${fmtKg(best.kg)} × ${best.reps}` : "—"} />
          <KV k="1RM est." v={best ? `${fmtKg(e1rm(best.kg, best.reps))} kg` : "—"} />
          <KV k="Objectif" v={`${fmtKg(cur.kg)} × ${cur.targetReps ?? cur.reps}${cur.targetRpe ? ` @${cur.targetRpe}` : ""}`} />
        </View>

        <Pressable onPress={() => !allDone && setSheet({ si })} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, paddingVertical: 6 }}>
          <View style={{ alignItems: "center", gap: 4 }}><Label>kg</Label><Big v={fmtKg(cur.kg)} size={64} /></View>
          <Text style={{ fontFamily: man(700), fontSize: 30, color: C.mut }}>×</Text>
          <View style={{ alignItems: "center", gap: 4 }}><Label>reps</Label><Big v={String(cur.reps)} size={64} /></View>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, minWidth: "100%", justifyContent: "center" }} style={{ flexGrow: 0, marginHorizontal: -16 }}>
          <Pill label="−2,5" onPress={() => !allDone && actions.editSet(ei, si, { kg: Math.max(0, cur.kg - 2.5) })} />
          <Pill label="+2,5" onPress={() => !allDone && actions.editSet(ei, si, { kg: cur.kg + 2.5 })} />
          <Pill label={`RPE ${cur.rpe ?? cur.targetRpe ?? "—"}`} on={panel === "rpe"} onPress={() => setPanel(panel === "rpe" ? null : "rpe")} />
          <Pill label="Échec" on={!!cur.flags?.includes("Échec")} onPress={() => !allDone && actions.editSet(ei, si, { flags: cur.flags?.includes("Échec") ? cur.flags.filter((f) => f !== "Échec") : [...(cur.flags ?? []), "Échec"] })} />
          <Pill label={`Repos ${fmtT(exo.rest * 1000)}`} on={panel === "repos"} onPress={() => setPanel(panel === "repos" ? null : "repos")} />
          <Pill label={exo.superset ? "Enchaîné ✓" : "Enchaîner"} on={!!exo.superset} onPress={() => actions.setSuperset(ei, !exo.superset)} />
        </ScrollView>
        {panel === "rpe" ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((r) => <Pill key={r} label={String(r).replace(".", ",")} on={(cur.rpe ?? cur.targetRpe) === r} onPress={() => { actions.editSet(ei, si, { rpe: r }); setPanel(null); }} />)}
          </View>
        ) : null}
        {panel === "repos" ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <Circ icon="x" size={36} onPress={() => actions.setRest(ei, exo.rest - 15)} /><Mono size={22}>{fmtT(exo.rest * 1000)}</Mono><Circ icon="plus" size={36} onPress={() => actions.setRest(ei, exo.rest + 15)} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>{[30, 45, 60, 90, 120, 150, 180, 240, 300].map((r) => <Pill key={r} label={fmtT(r * 1000)} on={exo.rest === r} onPress={() => { actions.setRest(ei, r); setPanel(null); }} />)}</View>
            <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut, textAlign: "center" }}>S'applique à toutes les séries de cet exercice</Text>
          </View>
        ) : null}
        {allDone ? (
          <Btn label={ei < active.exos.length - 1 ? "Exercice suivant" : "Terminer la séance"} kind="white" icon="chev" onPress={() => (ei < active.exos.length - 1 ? setEi(ei + 1) : (actions.finish(), router.replace("/seance/resume")))} />
        ) : (
          <Btn label="Valider la série" icon="check" onPress={() => { actions.logSet(ei, si, cur.kg, cur.reps, cur.rpe, cur.flags); if (exo.superset && ei < active.exos.length - 1 && !active.exos[ei + 1].sets.every((x) => x.done)) setEi(ei + 1); }} />
        )}

        {exo.sets.map((s, i) => { const bits = [s.kind && s.kind !== "normal" ? KIND_LABEL[s.kind] : null, s.pr ? "PR" : null, s.done && s.rpe ? `RPE ${String(s.rpe).replace(".", ",")}` : null, s.flags?.includes("Échec") ? "échec" : null].filter(Boolean); return <SetLine key={i} n={i + 1} kg={fmtKg(s.kg)} reps={String(s.reps)} state={s.done ? "done" : i === si ? "cur" : "todo"} note={bits.length ? `Série ${i + 1} · ${bits.join(" · ")}` : undefined} onPress={() => setSheet({ si: i })} />; })}
        <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut, textAlign: "center" }}>Touche une série pour la modifier, même validée</Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 24 }}><Pressable onPress={() => actions.addSet(ei)} style={{ paddingVertical: 10 }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>+ Ajouter une série</Text></Pressable><Pressable onPress={() => router.push({ pathname: "/seance/bibliotheque", params: { pick: "active" } })} style={{ paddingVertical: 10 }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>+ Ajouter un exercice</Text></Pressable></View>

        <H2>Ensuite</H2>
        {active.exos.map((e, i) => i === ei ? null : (
          <FRow key={e.exoId} left={<ExoThumb hl={byId(e.exoId).hl} view={byId(e.exoId).view} size={44} />} text={<><B>{byId(e.exoId).name}</B> · {e.sets.length} × {e.sets[0].reps}</>} sub={`${fmtKg(e.sets[0].kg)} kg · ${e.superset ? "enchaîné" : "repos " + fmtT(e.rest * 1000)}`}
            right={e.sets.every((s) => s.done) ? <Icon name="check" size={18} color={C.green} w={2.5} /> : <Circ icon="chev" size={32} />} onPress={() => setEi(i)} />
        ))}
      </ScrollView>

      {restLeft > 0 ? (
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 + Math.max(insets.bottom, 8), borderRadius: 22, padding: 14, backgroundColor: C.surf2, flexDirection: "row", alignItems: "center", gap: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" } as any}>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Repos</Text>
              <Mono size={22}>{fmtT(restLeft)}</Mono>
            </View>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}><View style={{ width: `${(restLeft / (restTotal * 1000)) * 100}%`, height: 5, backgroundColor: C.accent }} /></View>
          </View>
          <Btn label="Passer" kind="white" size="sm" full={false} onPress={actions.skipRest} />
        </View>
      ) : null}

      <SetSheet visible={!!sheet} title={`${def.name} · série ${(sheet?.si ?? 0) + 1}`} prev={best ? `${fmtKg(best.kg)} × ${best.reps}` : "—"} kg={exo.sets[sheet?.si ?? 0]?.kg ?? 0} reps={exo.sets[sheet?.si ?? 0]?.reps ?? 0}
        rpe0={exo.sets[sheet?.si ?? 0]?.rpe ?? exo.sets[sheet?.si ?? 0]?.targetRpe} flags0={exo.sets[sheet?.si ?? 0]?.flags} editing={!!exo.sets[sheet?.si ?? 0]?.done}
        onClose={() => setSheet(null)} onDelete={() => { const s = sheet!.si; setSheet(null); actions.removeSet(ei, s); }}
        onValidate={(kg, reps, rpe, flags) => { const s = sheet!.si; const wasDone = exo.sets[s]?.done; setSheet(null); if (wasDone) actions.editSet(ei, s, { kg, reps, rpe, flags }); else actions.logSet(ei, s, kg, reps, rpe, flags); }} />
    </Page>
  );
}
