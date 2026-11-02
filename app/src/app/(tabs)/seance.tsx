import React from "react";
import { View, Text, Pressable } from "react-native";
import { Page, Top, Actions, Circ, Logo, Media, Shade, Ov, OvText, OvTitle, Btn, H2, Surf, Between, KV, Bars, FRow, B, Pill, Mono, Icon } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { router } from "expo-router";
import { useWorkout, actions, volume, fmtVol, fmtT } from "../../store/workout";
import { PUSH } from "../../data/seed";
import { isoWeek } from "../../store/activities";
import { useProfile, suggestProgram, weekPlan } from "../../store/profile";
import { useLibrary, getTemplate } from "../../store/library";
import { DAY_TO_TEMPLATE } from "../../data/templates";
import { HistRow } from "../seance/historique";

const DateBox = ({ d, m }: { d: string; m: string }) => (
  <View style={{ width: 44, alignItems: "center" }}>
    <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{d}</Text>
    <Text style={{ fontFamily: inter(400), fontSize: 10, color: C.mut }}>{m}</Text>
  </View>
);

/** S01 · Séance */
export default function Seance() {
  const { active, history } = useWorkout(); const p = useProfile(); useLibrary();
  const prog = suggestProgram(p); const plan = weekPlan(p); const today = (new Date().getDay() + 6) % 7;
  const nextDay = plan.find((w, i) => i >= today && w[1])?.[1] ?? plan.find((w) => w[1])?.[1] ?? "Push";
  const nextT = getTemplate(DAY_TO_TEMPLATE[nextDay] ?? "push") ?? PUSH;
  const week = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3);
  const vol = week.reduce((a, s) => a + volume(s), 0);
  const wk4 = [3, 2, 1, 0].map((k) => history.filter((s) => { const d = (Date.now() - s.startedAt) / 86400e3; return d >= k * 7 && d < (k + 1) * 7; }).reduce((a, s) => a + volume(s), 0));
  const wk4Labels = [3, 2, 1, 0].map((k) => "S" + isoWeek(Date.now() - k * 7 * 86400e3));
  const dur = week.reduce((a, s) => a + ((s.endedAt ?? s.startedAt) - s.startedAt), 0);
  const start = () => { if (!active) actions.start(nextT); router.push("/seance/encours"); };
  const last = history.find((s) => s.templateId === nextT.id);
  return (
    <Page withNav>
      <Top title="Séance" left={<Logo name={prog.discipline} size={38} />} right={<Actions><Circ icon="cal" size={38} onPress={() => router.push("/seance/bilan")} /><Circ icon="search" size={38} onPress={() => router.push("/seance/bibliotheque")} /></Actions>} />

      <Media photo={nextT.photo as any} h={190} r={22}>
        <Shade />
        <Ov x={16} y={14} anchor="lb">
          <OvText>{active ? "En cours" : "Prochaine"} · {nextT.program}</OvText>
          <OvTitle size={26}>{active ? active.name : nextT.name}</OvTitle>
          <OvText size={13}>{nextT.exos.length} exercices · ~{nextT.minutes} min{last ? ` · dernière fois ${fmtVol(volume(last))}` : ""}</OvText>
        </Ov>
        <Ov x={14} y={14} anchor="rt"><Btn label={active ? "Reprendre" : "Démarrer"} kind="white" icon="play" size="sm" full={false} onPress={start} /></Ov>
      </Media>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 }}>
        <Circ icon="plus" size={52} label="Créer" onPress={() => router.push("/seance/editeur")} />
        <Circ icon="bolt" size={52} label="Assistant" onPress={() => router.push("/seance/assistant")} />
        <Circ icon="search" size={52} label="Exercices" onPress={() => router.push("/seance/bibliotheque")} />
        <Circ icon="trophy" size={52} label="Records" onPress={() => router.push("/perf")} />
      </View>
      <Pressable onPress={() => router.push("/seance/modes")} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, backgroundColor: C.surf }}>
        <View style={{ flexDirection: "row" }}>{["course", "hyrox", "crossfit", "street"].map((d, i) => <View key={d} style={{ marginLeft: i ? -10 : 0 }}><Logo name={d} size={32} badge={false} /></View>)}</View>
        <View style={{ flex: 1 }}><Text style={{ fontFamily: inter(700), fontSize: 14, color: C.txt }}>Autres modes de séance</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>course · Hyrox · WOD · street · powerlifting</Text></View>
        <Icon name="chev" size={18} color={C.mut} />
      </Pressable>

      <H2>Cette semaine</H2>
      <Surf pad={14}>
        <Between align="flex-end">
          <KV k="Volume" v={fmtVol(vol)} strong />
          <KV k="Séances" v={`${week.length} / 4`} strong />
          <KV k="Durée" v={dur ? `${Math.floor(dur / 3600e3)} h ${String(Math.floor((dur % 3600e3) / 60e3)).padStart(2, "0")}` : "0 h 00"} strong />
        </Between>
        <Bars vals={wk4.map((v) => Math.max(0.05, v / 1000))} labels={wk4Labels} w={330} />
      </Surf>

      <H2 action="Séances types" onAction={() => router.push("/seance/types")}>Mon programme</H2>
      <FRow left={<Logo name={prog.discipline} size={48} />} text={<B>{prog.name}</B>} right={<Circ icon="chev" size={32} />} sub={`${prog.family} · ${p.seances} séances / sem. · prochain : ${nextDay}`} onPress={() => router.push("/seance/programmes")} />

      <H2 action="Tout voir" onAction={() => router.push("/seance/historique")}>Historique</H2>
      {history.length >= 2 ? <FRow left={<Circ icon="stats" size={44} />} text={<B>Comparer deux séances</B>} sub="la dernière contre la précédente, exercice par exercice" right={<Circ icon="chev" size={32} />} onPress={() => router.push("/seance/comparer")} /> : null}
      {history.slice(0, 3).map((s) => <HistRow key={s.id} s={s} onPress={() => router.push({ pathname: "/seance/detail", params: { id: s.id } })} />)}
      {!history.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Ta première séance apparaîtra ici.</Text> : null}
    </Page>
  );
}
