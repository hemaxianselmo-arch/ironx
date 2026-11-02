import React from "react";
import { View, Text } from "react-native";
import { Page, Top, Actions, Circ, Logo, Media, Shade, Ov, OvText, OvTitle, Btn, H2, Surf, Between, KV, Bars, FRow, B, Pill, Mono } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { router } from "expo-router";
import { useWorkout, actions, volume, fmtVol, fmtT } from "../../store/workout";
import { PUSH } from "../../data/seed";
import { HistRow } from "../seance/historique";

const DateBox = ({ d, m }: { d: string; m: string }) => (
  <View style={{ width: 44, alignItems: "center" }}>
    <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{d}</Text>
    <Text style={{ fontFamily: inter(400), fontSize: 10, color: C.mut }}>{m}</Text>
  </View>
);

/** S01 · Séance */
export default function Seance() {
  const { active, history } = useWorkout();
  const week = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3);
  const vol = week.reduce((a, s) => a + volume(s), 0);
  const dur = week.reduce((a, s) => a + ((s.endedAt ?? s.startedAt) - s.startedAt), 0);
  const start = () => { if (!active) actions.start(PUSH); router.push("/seance/encours"); };
  const last = history.find((s) => s.templateId === "push");
  return (
    <Page withNav>
      <Top title="Séance" left={<Logo name="bodybuilding" size={38} />} right={<Actions><Circ icon="cal" size={38} /><Circ icon="search" size={38} /></Actions>} />

      <Media photo="photo-squat" h={190} r={22}>
        <Shade />
        <Ov x={16} y={14} anchor="lb">
          <OvText>Prochaine · PPL jour 1 / 6</OvText>
          <OvTitle size={26}>Push</OvTitle>
          <OvText size={13}>6 exercices · ~62 min{last ? ` · dernière fois ${fmtVol(volume(last))}` : ""}</OvText>
        </Ov>
        <Ov x={14} y={14} anchor="rt"><Btn label={active ? "Reprendre" : "Démarrer"} kind="white" icon="play" size="sm" full={false} onPress={start} /></Ov>
      </Media>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 }}>
        <Circ icon="plus" size={52} label="Vide" />
        <Circ icon="bolt" size={52} label="Assistant" />
        <Circ icon="search" size={52} label="Exercices" />
        <Circ icon="trophy" size={52} label="Records" />
      </View>

      <H2>Cette semaine</H2>
      <Surf pad={14}>
        <Between align="flex-end">
          <KV k="Volume" v={fmtVol(vol)} strong />
          <KV k="Séances" v={`${week.length} / 4`} strong />
          <KV k="Durée" v={dur ? `${Math.floor(dur / 3600e3)} h ${String(Math.floor((dur % 3600e3) / 60e3)).padStart(2, "0")}` : "0 h 00"} strong />
        </Between>
        <Bars vals={[18.2, 22.4, 20.1, Math.max(0.1, vol / 1000)]} labels={["S42", "S43", "S44", "S45"]} w={330} />
      </Surf>

      <H2 action="Tous">Mes programmes</H2>
      <FRow left={<Logo name="bodybuilding" size={48} />} text={<B>PPL 6 jours</B>} right={<Circ icon="chev" size={32} />} sub="Bodybuilding · semaine 7 / 12 · prochain : Push" />
      <FRow left={<Logo name="powerlifting" size={48} on={false} />} text={<B>Force 5/3/1</B>} right={<Pill label="En pause" />} sub="Powerlifting · cycle 2" />

      <H2 action="Tout voir" onAction={() => router.push("/seance/historique")}>Historique</H2>
      {history.slice(0, 3).map((s) => <HistRow key={s.id} s={s} onPress={() => router.push({ pathname: "/seance/detail", params: { id: s.id } })} />)}
      {!history.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Ta première séance apparaîtra ici.</Text> : null}
    </Page>
  );
}
