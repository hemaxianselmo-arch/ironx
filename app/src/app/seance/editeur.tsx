import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Page, Top, Btn, Icon, Circ, ExoThumb, Field, Pill } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useLibrary, getTemplate, lib, pendingAdd, setPendingAdd } from "../../store/library";
import { Template, TemplateExo, SET_KINDS, SetKind } from "../../data/templates";
import { byId } from "../../data/seed";
import { fmtKg, bestOf } from "../../store/workout";

// Brouillon partagé entre l'éditeur et la bibliothèque (retour avec un exercice à ajouter)
let draft: Template | null = null;
const fresh = (): Template => ({ id: "mine-" + Date.now(), name: "Ma séance", program: "Séance personnalisée", photo: "photo-gym", level: "Moyen", minutes: 45, discipline: "bodybuilding", exos: [], custom: true });
const fmtRest = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** S06 · Éditeur de séance : exercices, séries (charge, reps), repos, ordre */
export default function Editeur() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  useLibrary();
  const [t, setT] = useState<Template>(() => draft ?? (id ? { ...getTemplate(id)!, exos: getTemplate(id)!.exos.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) })) } : fresh()));
  useEffect(() => { draft = t; }, [t]);
  useFocusEffect(React.useCallback(() => {
    const a = pendingAdd; if (a) { setPendingAdd(null); const b = bestOf(a); setT((x) => ({ ...x, exos: [...x.exos, { exoId: a, rest: 90, sets: Array.from({ length: 3 }, () => ({ kg: b?.kg ?? 20, reps: b?.reps ?? 10 })) }] })); }
  }, []));
  const upd = (i: number, f: (e: TemplateExo) => TemplateExo) => setT((x) => ({ ...x, exos: x.exos.map((e, j) => (j === i ? f(e) : e)) }));
  const move = (i: number, d: number) => setT((x) => { const a = [...x.exos]; const j = i + d; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, exos: a }; });
  const sets = t.exos.reduce((a, e) => a + e.sets.length, 0);
  const save = () => { lib.saveTemplate({ ...t, minutes: Math.max(15, Math.round(sets * 2.8)) }); draft = null; router.replace({ pathname: "/seance/apercu", params: { id: t.id } }); };
  const Num = ({ v, onChange, w = 56, suffix, ph }: { v: number; onChange: (n: number) => void; w?: number; suffix?: string; ph?: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      <TextInput defaultValue={v ? String(v).replace(".", ",") : ""} placeholder={ph ?? "0"} placeholderTextColor={C.mut} keyboardType="decimal-pad" onEndEditing={(e) => onChange(parseFloat(e.nativeEvent.text.replace(",", ".")) || 0)} style={{ width: w, height: 34, borderRadius: 10, backgroundColor: C.surf, color: C.txt, fontFamily: inter(600), fontSize: 14, textAlign: "center", outlineStyle: "none" } as any} />
      {suffix ? <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{suffix}</Text> : null}
    </View>
  );
  return (
    <Page>
      <Top title={t.name} sub={`${t.exos.length} exos · ${sets} séries · ~${Math.max(15, Math.round(sets * 2.8))} min`} onBack={() => { draft = null; router.back(); }} right={<Btn label="Enregistrer" size="sm" full={false} onPress={save} />} />
      <Field label="Nom de la séance" value={t.name} onChange={(v) => setT((x) => ({ ...x, name: v }))} placeholder="Push, Haut du corps…" />
      {t.exos.map((e, i) => { const d = byId(e.exoId); return (
        <View key={i} style={{ gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ExoThumb hl={d.hl} view={d.view} size={40} />
            <Text style={{ flex: 1, fontFamily: man(700), fontSize: 16, color: C.txt }}>{i + 1} · {d.name}</Text>
            <Pressable onPress={() => move(i, -1)} style={{ padding: 4 }}><Icon name="chev" size={16} color={C.mut} /></Pressable>
            <Pressable onPress={() => setT((x) => ({ ...x, exos: x.exos.filter((_, j) => j !== i) }))} style={{ padding: 4 }}><Icon name="x" size={16} color={C.red} /></Pressable>
          </View>
          <View style={{ flexDirection: "row", paddingLeft: 50, gap: 8 }}>
            <Text style={{ width: 30, fontFamily: inter(400), fontSize: 11, color: C.mut }}>N°</Text><Text style={{ width: 64, fontFamily: inter(400), fontSize: 11, color: C.mut }}>Charge</Text><Text style={{ width: 54, fontFamily: inter(400), fontSize: 11, color: C.mut }}>Rép.</Text><Text style={{ width: 50, fontFamily: inter(400), fontSize: 11, color: C.mut }}>RPE</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>Type</Text>
          </View>
          {e.sets.map((s, k) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, gap: 8 }}>
              <Text style={{ width: 30, fontFamily: inter(400), fontSize: 12, color: C.mut }}>{k + 1}</Text>
              <View style={{ width: 64 }}><Num v={s.kg} w={56} onChange={(n) => upd(i, (x) => ({ ...x, sets: x.sets.map((y, m) => (m === k ? { ...y, kg: n } : y)) }))} /></View>
              <View style={{ width: 54 }}><Num v={s.reps} w={46} onChange={(n) => upd(i, (x) => ({ ...x, sets: x.sets.map((y, m) => (m === k ? { ...y, reps: Math.round(n) } : y)) }))} /></View>
              <View style={{ width: 50 }}><Num v={s.rpe ?? 0} w={42} ph="—" onChange={(n) => upd(i, (x) => ({ ...x, sets: x.sets.map((y, m) => (m === k ? { ...y, rpe: n ? Math.min(10, Math.max(5, n)) : undefined } : y)) }))} /></View>
              <Pressable onPress={() => upd(i, (x) => ({ ...x, sets: x.sets.map((y, m) => { if (m !== k) return y; const idx = SET_KINDS.findIndex(([kk]) => kk === (y.kind ?? "normal")); return { ...y, kind: SET_KINDS[(idx + 1) % SET_KINDS.length][0] as SetKind }; }) }))} style={{ height: 34, minWidth: 44, paddingHorizontal: 8, borderRadius: 10, backgroundColor: s.kind && s.kind !== "normal" ? C.txt : C.surf, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: inter(600), fontSize: 11, color: s.kind && s.kind !== "normal" ? C.bg : C.mut }}>{SET_KINDS.find(([kk]) => kk === (s.kind ?? "normal"))?.[1]}</Text>
              </Pressable>
              <Pressable onPress={() => upd(i, (x) => ({ ...x, sets: x.sets.filter((_, m) => m !== k) }))} style={{ marginLeft: "auto" }}><Icon name="x" size={14} color={C.mut} /></Pressable>
            </View>
          ))}
          <View style={{ flexDirection: "row", paddingLeft: 50, gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Pressable onPress={() => upd(i, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets[x.sets.length - 1] ?? { kg: 20, reps: 10 }) }] }))}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.accent }}>+ série</Text></Pressable>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>·  repos</Text>
            <Pressable onPress={() => upd(i, (x) => ({ ...x, rest: Math.max(0, x.rest - 15) }))} style={{ padding: 4 }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.txt }}>−15</Text></Pressable>
            <Num v={e.rest} w={52} suffix="s" onChange={(n) => upd(i, (x) => ({ ...x, rest: Math.max(0, Math.round(n)) }))} />
            <Pressable onPress={() => upd(i, (x) => ({ ...x, rest: x.rest + 15 }))} style={{ padding: 4 }}><Text style={{ fontFamily: inter(600), fontSize: 13, color: C.txt }}>+15</Text></Pressable>
            <Pill label={e.superset ? "Enchaîné avec le suivant ✓" : "Enchaîner avec le suivant"} on={!!e.superset} onPress={() => upd(i, (x) => ({ ...x, superset: !x.superset }))} />
          </View>
        </View>); })}
      <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut, lineHeight: 16 }}>Type de série : touche pour changer (Normale → Échauffement → Top set → Back-off → Drop set → Rest-pause → AMRAP). RPE : intensité visée de 5 à 10, vide = libre. « Enchaîner » = superset, sans repos avant l'exercice suivant.</Text>
      {!t.exos.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Aucun exercice. Ajoute-en depuis la bibliothèque.</Text> : null}
      <View style={{ flexDirection: "row", gap: 8, paddingTop: 6 }}>
        <View style={{ flex: 1 }}><Btn label="Ajouter un exercice" kind="secondary" icon="plus" size="md" onPress={() => router.push({ pathname: "/seance/bibliotheque", params: { pick: "editor" } })} /></View>
      </View>
    </Page>
  );
}
