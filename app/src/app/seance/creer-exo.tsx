import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Btn, Field, Figure, Pills, Media, Circ } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { GROUPS_LIST, EQUIPS, Group, Equip } from "../../data/exercises";
import { GROUPS as FIG } from "../../ui/Figure";
import { lib } from "../../store/library";

const FRONT: [string, string][] = [["pecs", "Pectoraux"], ["delts", "Épaules"], ["biceps", "Biceps"], ["abs", "Abdos"], ["obliques", "Obliques"], ["quads", "Quadriceps"], ["adductors", "Adducteurs"], ["forearms", "Avant-bras"], ["calves", "Mollets"]];
const BACK: [string, string][] = [["lats", "Dorsaux"], ["traps", "Trapèzes"], ["rear_delts", "Deltoïdes post."], ["triceps", "Triceps"], ["lower_back", "Lombaires"], ["glutes", "Fessiers"], ["hamstrings", "Ischios"], ["calves", "Mollets"]];
/** S16 · Créer un exercice : nom, muscles (principal / secondaires), matériel, groupe */
export default function CreerExo() {
  const [name, setName] = useState(""); const [primary, setPrimary] = useState<string | null>(null); const [sec, setSec] = useState<string[]>([]);
  const [equip, setEquip] = useState(0); const [group, setGroup] = useState(0);
  const tap = (k: string) => { if (!primary) setPrimary(k); else if (primary === k) setPrimary(null); else setSec((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k])); };
  const hlOf = (list: [string, string][]) => Object.fromEntries(list.filter(([k]) => k === primary || sec.includes(k)).map(([k]) => [k, k === primary ? 1 : 0.5]));
  const label = (k: string | null) => [...FRONT, ...BACK].find(([x]) => x === k)?.[1];
  const inFront = FRONT.some(([k]) => k === primary);
  const create = () => {
    if (!name.trim() || !primary) return;
    const id = "custom-" + Date.now();
    lib.addExercise({ id, name: name.trim(), group: GROUPS_LIST[group] as Group, equip: EQUIPS[equip] as Equip, primary: label(primary)!, secondary: sec.map(label).join(", "), view: inFront ? "front" : "back", hl: hlOf(inFront ? FRONT : BACK), hlBack: hlOf(inFront ? BACK : FRONT), steps: ["Exercice créé par toi.", "Ajoute tes repères techniques dans la fiche.", "Les muscles ciblés s'affichent sur la figure."], photo: "photo-gym", custom: true });
    router.replace({ pathname: "/seance/exo", params: { id } });
  };
  const Chip = ({ k, t }: { k: string; t: string }) => { const on = k === primary ? 2 : sec.includes(k) ? 1 : 0; return (
    <Pressable onPress={() => tap(k)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, backgroundColor: on === 2 ? C.accent : on === 1 ? C.txt : "rgba(255,255,255,0.08)" }}>
      <Text style={{ fontFamily: inter(on ? 700 : 500), fontSize: 12, color: on === 2 ? "#fff" : on === 1 ? C.bg : C.txt }}>{t}</Text></Pressable>); };
  return (
    <Page>
      <Top title="Nouvel exercice" onBack={() => router.back()} right={<Btn label="Créer" size="sm" full={false} onPress={create} />} />
      <Media photo="photo-gym" h={120} r={20}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(12,14,26,0.55)", alignItems: "center", justifyContent: "center", gap: 6 } as any}><Circ icon="cam" size={44} kind="glass" /><Text style={{ fontFamily: inter(400), fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Photo ou vidéo · bientôt</Text></View>
      </Media>
      <Field label="Nom" value={name} onChange={setName} placeholder="Développé couché prise serrée" />
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Muscles · 1er choix = principal (rouge), suivants = secondaires</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Figure view="front" hl={hlOf(FRONT)} h={140} /><Figure view="back" hl={hlOf(BACK)} h={140} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.txt }}>Principal{"\n"}<Text style={{ fontFamily: inter(700), color: C.accent }}>{label(primary) ?? "—"}</Text></Text>
            <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.txt }}>Secondaires{"\n"}<Text style={{ fontFamily: inter(700) }}>{sec.map(label).join(", ") || "—"}</Text></Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{FRONT.map(([k, t]) => <Chip key={"f" + k} k={k} t={t} />)}{BACK.map(([k, t]) => <Chip key={"b" + k} k={k} t={t} />)}</View>
      </View>
      <View style={{ gap: 8 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Matériel</Text><Pills items={EQUIPS} on={equip} onChange={setEquip} /></View>
      <View style={{ gap: 8 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Famille</Text><Pills items={GROUPS_LIST} on={group} onChange={setGroup} /></View>
    </Page>
  );
}
