import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Btn, Media, Shade, Ov, OvText, OvTitle, Play, KV, Label, Big, Pill, H2, FRow, ExoThumb, Icon, Mono, B, Seg } from "../../ui";
import { C, inter, man, PAD } from "../../theme/tokens";
import { useWorkout, actions, fmtT, fmtKg, bestOf } from "../../store/workout";
import { byId, e1rm } from "../../data/seed";

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
function SetSheet({ visible, title, prev, kg, reps, onClose, onValidate }: { visible: boolean; title: string; prev: string; kg: number; reps: number; onClose: () => void; onValidate: (kg: number, reps: number, rpe: number, flags: string[]) => void }) {
  const [field, setField] = useState<"kg" | "reps">("kg");
  const [vals, setVals] = useState({ kg: fmtKg(kg), reps: String(reps) });
  const [rpe, setRpe] = useState(2);
  const [flags, setFlags] = useState<string[]>([]);
  const [fresh, setFresh] = useState(true);
  useEffect(() => { if (visible) { setVals({ kg: fmtKg(kg), reps: String(reps) }); setField("kg"); setFresh(true); setFlags([]); } }, [visible, kg, reps]);
  const press = (k: string) => {
    if (k === "OK") { onValidate(parseFloat(vals.kg.replace(",", ".")) || 0, parseInt(vals.reps) || 0, [6, 7, 8, 9, 10][rpe], flags); return; }
    setVals((v) => { const cur = fresh ? "" : v[field]; if (k === "," && (field === "reps" || cur.includes(","))) return v; return { ...v, [field]: (cur + k).slice(0, 6) }; });
    setFresh(false);
  };
  const plates = useMemo(() => { let per = Math.max(0, ((parseFloat(vals.kg.replace(",", ".")) || 0) - 20) / 2); const out: number[] = []; for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) while (per >= p - 0.001) { out.push(p); per -= p; } return out; }, [vals.kg]);
  const PC: Record<number, [string, number]> = { 25: ["#E85A5A", 36], 20: ["#5A8BE8", 34], 15: ["#EDB63A", 30], 10: ["#4CAF7A", 26], 5: ["#E8E8E8", 20], 2.5: ["#E85A5A", 16], 1.25: ["#C9CDD4", 12] };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose} />
      <View style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 30, gap: 14, backgroundColor: C.surf }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center" }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{title}</Text>
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
          <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>RPE</Text>
          <View style={{ width: 230 }}><Seg items={["6", "7", "8", "9", "10"]} on={rpe} onChange={setRpe} /></View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 13, color: C.mut }}>Plaques par côté</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>{plates.map((p, i) => <View key={i} style={{ width: p >= 10 ? 10 : 7, height: PC[p][1], borderRadius: 3, backgroundColor: PC[p][0] }} />)}</View>
          <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.txt }}>{plates.length ? plates.map(fmtKg).join(" + ") : "barre seule"}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["Échec", "Drop set", "Rest-pause", "Note", "Vidéo"].map((f) => <Pill key={f} label={f} on={flags.includes(f)} onPress={() => setFlags((v) => (v.includes(f) ? v.filter((x) => x !== f) : [...v, f]))} />)}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "OK"].map((k) => (
            <Pressable key={k} onPress={() => press(k)} style={({ pressed }) => ({ width: "31.5%", height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: k === "OK" ? C.accent : pressed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)" })}>
              <Text style={{ fontFamily: man(700), fontSize: 20, color: k === "OK" ? "#fff" : C.txt }}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

/** S08 · Séance en cours */
export default function EnCours() {
  const { active, restUntil, restTotal, lastPR } = useWorkout();
  const now = useNow();
  const [ei, setEi] = useState(0);
  const [sheet, setSheet] = useState<{ si: number } | null>(null);
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
      <ScrollView contentContainerStyle={{ padding: PAD, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
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
          <Ov x={12} y={12} anchor="rt"><Play size={40} /></Ov>
        </Media>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Série" v={`${Math.min(si + 1, exo.sets.length)} / ${exo.sets.length}`} />
          <KV k="Précédent" v={best ? `${fmtKg(best.kg)} × ${best.reps}` : "—"} />
          <KV k="1RM est." v={best ? `${fmtKg(e1rm(best.kg, best.reps))} kg` : "—"} />
          <KV k="Objectif" v={`${fmtKg(cur.kg)} × ${cur.reps}`} />
        </View>

        <Pressable onPress={() => !allDone && setSheet({ si })} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, paddingVertical: 6 }}>
          <View style={{ alignItems: "center", gap: 4 }}><Label>kg</Label><Big v={fmtKg(cur.kg)} size={64} /></View>
          <Text style={{ fontFamily: man(700), fontSize: 30, color: C.mut }}>×</Text>
          <View style={{ alignItems: "center", gap: 4 }}><Label>reps</Label><Big v={String(cur.reps)} size={64} /></View>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
          <Pill label="−2,5" onPress={() => !allDone && actions.logSet(ei, si, Math.max(0, cur.kg - 2.5), cur.reps)} />
          <Pill label="+2,5" onPress={() => !allDone && actions.logSet(ei, si, cur.kg + 2.5, cur.reps)} />
          <Pill label="RPE 8" on /><Pill label="Échec" /><Pill label="Vidéo" />
        </View>
        {allDone ? (
          <Btn label={ei < active.exos.length - 1 ? "Exercice suivant" : "Terminer la séance"} kind="white" icon="chev" onPress={() => (ei < active.exos.length - 1 ? setEi(ei + 1) : (actions.finish(), router.replace("/seance/resume")))} />
        ) : (
          <Btn label="Valider la série" icon="check" onPress={() => actions.logSet(ei, si, cur.kg, cur.reps)} />
        )}

        {exo.sets.map((s, i) => <SetLine key={i} n={i + 1} kg={fmtKg(s.kg)} reps={String(s.reps)} state={s.done ? "done" : i === si ? "cur" : "todo"} note={s.pr ? `Série ${i + 1} · PR` : undefined} onPress={() => !s.done && setSheet({ si: i })} />)}
        <Pressable onPress={() => actions.addSet(ei)} style={{ paddingVertical: 10, alignItems: "center" }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>+ Ajouter une série</Text></Pressable>

        <H2>Ensuite</H2>
        {active.exos.map((e, i) => i === ei ? null : (
          <FRow key={e.exoId} left={<ExoThumb hl={byId(e.exoId).hl} view={byId(e.exoId).view} size={44} />} text={<><B>{byId(e.exoId).name}</B> · {e.sets.length} × {e.sets[0].reps}</>} sub={`${fmtKg(e.sets[0].kg)} kg · repos ${fmtT(e.rest * 1000)}`}
            right={e.sets.every((s) => s.done) ? <Icon name="check" size={18} color={C.green} w={2.5} /> : <Circ icon="chev" size={32} />} onPress={() => setEi(i)} />
        ))}
      </ScrollView>

      {restLeft > 0 ? (
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 24, borderRadius: 22, padding: 14, backgroundColor: C.surf2, flexDirection: "row", alignItems: "center", gap: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" } as any}>
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
        onClose={() => setSheet(null)} onValidate={(kg, reps, rpe, flags) => { const s = sheet!.si; setSheet(null); actions.logSet(ei, s, kg, reps, rpe, flags); }} />
    </Page>
  );
}
