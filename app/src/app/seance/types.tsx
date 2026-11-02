import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Media, Shade, Ov, OvText, OvTitle, Btn } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useLibrary, allTemplates } from "../../store/library";
import { useProfile, weekPlan } from "../../store/profile";
import { DAY_TO_TEMPLATE, Template } from "../../data/templates";
import { useWorkout, actions } from "../../store/workout";

const TAG = (t: string) => <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.14)" }}><Text style={{ fontFamily: inter(700), fontSize: 11, color: C.soft }}>{t}</Text></View>;
const DISC = ["Pour toi", "Muscu", "Powerlifting", "Hyrox", "Course", "Street", "Les miennes"];
const KEY: Record<string, string> = { Muscu: "bodybuilding", Powerlifting: "powerlifting", Hyrox: "hyrox", Course: "course", Street: "street" };

/** Carte de séance type (type_card) */
export function TypeCard({ t, onPress }: { t: Template; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: "48%" }}>
      <Media photo={t.photo as any} h={150} r={18}>
        <Shade />
        <Ov x={12} y={10} anchor="lb"><Text style={{ fontFamily: man(700), fontSize: 17, lineHeight: 19, color: "#fff" }}>{t.name}</Text><OvText size={11}>{t.exos.length} exos · {t.minutes} min</OvText></Ov>
        <Ov x={10} y={10} anchor="rt">{TAG(t.level)}</Ov>
      </Media>
    </Pressable>
  );
}
/** S04 · Séances types */
export default function Types() {
  useLibrary(); const p = useProfile(); const { active, history } = useWorkout();
  const [f, setF] = useState(0);
  const week = weekPlan(p); const today = (new Date().getDay() + 6) % 7;
  const nextDay = week.find((w, i) => i >= today && w[1])?.[1] ?? week.find((w) => w[1])?.[1];
  const sug = allTemplates().find((t) => t.id === (DAY_TO_TEMPLATE[nextDay ?? ""] ?? "push"))!;
  const list = allTemplates().filter((t) => f === 0 ? true : f === 6 ? t.custom : t.discipline === KEY[DISC[f]]);
  const start = (t: Template) => { actions.start(t); router.push("/seance/encours"); };
  const lastLegs = history.find((s) => /legs|bas/i.test(s.name));
  return (
    <Page>
      <Top title="Séances types" sub="Prêtes à lancer, adaptées à ton programme" right={<Circ icon="plus" size={38} kind="primary" onPress={() => router.push("/seance/editeur")} />} onBack={() => router.back()} />
      <Pills items={DISC} on={f} onChange={setF} />
      {f === 0 ? (
        <Media photo={sug.photo as any} h={190} r={22}>
          <Shade />
          <Ov x={16} y={14} anchor="lb"><OvText>Suggestion du jour · d'après ton programme</OvText><OvTitle size={24}>{sug.name} · {sug.minutes} min</OvTitle><OvText size={12.5}>{lastLegs && Date.now() - lastLegs.startedAt < 2 * 86400e3 ? "Jambes récemment, je te propose le haut du corps" : `${sug.exos.length} exercices · ${sug.program}`}</OvText></Ov>
          <Ov x={14} y={14} anchor="rt"><Btn label={active ? "Reprendre" : "Lancer"} kind="white" icon="play" size="sm" full={false} onPress={() => (active ? router.push("/seance/encours") : start(sug))} /></Ov>
        </Media>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignContent: "flex-start" }}>
        {list.map((t) => <TypeCard key={t.id} t={t} onPress={() => router.push({ pathname: "/seance/apercu", params: { id: t.id } })} />)}
      </View>
      {!list.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Aucune séance ici. Crée la tienne avec le bouton +.</Text> : null}
    </Page>
  );
}
