import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Tabs, Media, Shade, Ov, OvText, OvTitle, Logo, FRow, B, Icon, H2, Pill } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useProfile, suggestProgram, weekPlan } from "../../store/profile";
import { useWorkout, volume } from "../../store/workout";
import { DAY_TO_TEMPLATE } from "../../data/templates";

/** S05 · Mes programmes */
export default function Programmes() {
  const p = useProfile(); const { history } = useWorkout(); const [tab, setTab] = useState(0);
  const prog = suggestProgram(p); const week = weekPlan(p);
  const weeksDone = Math.min(prog.weeks, Math.max(1, Math.ceil(history.length / Math.max(1, p.seances))));
  const today = (new Date().getDay() + 6) % 7; const next = week.find((w, i) => i >= today && w[1])?.[1] ?? week.find((w) => w[1])?.[1] ?? "";
  return (
    <Page>
      <Top title="Programmes" right={<Circ icon="plus" size={38} kind="primary" onPress={() => router.push("/seance/editeur")} />} onBack={() => router.back()} />
      <Tabs items={["En cours", "Bibliothèque", "Archivés"]} on={tab} onChange={setTab} />
      {tab === 0 ? (<>
        <Media photo="photo-squat" h={200} r={22}>
          <Shade />
          <Ov x={16} y={14} anchor="lb"><OvText>{prog.family} · semaine {weeksDone} / {prog.weeks}</OvText><OvTitle size={26}>{prog.name}</OvTitle><OvText size={12.5}>Prochain : {next}</OvText></Ov>
          <Ov x={14} y={14} anchor="rt"><Logo name={prog.discipline} size={44} /></Ov>
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, backgroundColor: "rgba(255,255,255,0.2)" }}><View style={{ width: `${(weeksDone / prog.weeks) * 100}%`, height: 4, backgroundColor: C.accent }} /></View>
        </Media>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {week.map(([d, t], i) => (
            <View key={i} style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 2, borderRadius: 12, alignItems: "center", backgroundColor: C.surf, opacity: t ? 1 : 0.4 }} onTouchEnd={() => t && DAY_TO_TEMPLATE[t] && router.push({ pathname: "/seance/apercu", params: { id: DAY_TO_TEMPLATE[t] } })}>
              <Text style={{ fontFamily: inter(700), fontSize: 11, color: C.txt, marginBottom: 2 }}>{d}</Text>
              <Text style={{ fontFamily: inter(400), fontSize: 10.5, color: C.mut }} numberOfLines={1}>{t || "repos"}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>Programme calculé depuis ton profil ({p.seances} séances / semaine). Change tes jours ou tes disciplines dans l'onboarding pour en obtenir un autre.</Text>
      </>) : null}
      {tab === 1 ? (<>
        {[["Full body · 3 jours", "bodybuilding", "débutant · 6 semaines"], ["Upper / Lower · 4 jours", "bodybuilding", "intermédiaire · 6 semaines"], ["PPL · 6 jours", "bodybuilding", "avancé · 8 semaines"], ["Force 5/3/1", "powerlifting", "4 jours · cycles de 3 semaines"], ["Préparation Hyrox · 8 semaines", "hyrox", "3 séances + 2 courses"]].map(([n, l, s]) => (
          <FRow key={n} left={<Logo name={l} size={48} on={false} />} text={<B>{n}</B>} sub={s} right={<Pill label="Bientôt" />} />
        ))}
      </>) : null}
      {tab === 2 ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Aucun programme archivé.</Text> : null}
      <H2>Créer</H2>
      <FRow left={<Circ icon="bolt" size={44} kind="primary" />} text={<B>Assistant</B>} sub="je compose une séance d'après ton objectif, ton temps et ton matériel" right={<Icon name="chev" size={18} color={C.mut} />} onPress={() => router.push("/seance/assistant")} />
      <FRow left={<Circ icon="plus" size={44} />} text={<B>De zéro</B>} sub="exercices, séries, charges, repos" right={<Icon name="chev" size={18} color={C.mut} />} onPress={() => router.push("/seance/editeur")} />
      <FRow left={<Circ icon="copy" size={44} />} text={<B>Importer</B>} sub="Hevy, Strong, fichier CSV · bientôt" right={<Icon name="chev" size={18} color={C.mut} />} />
    </Page>
  );
}
