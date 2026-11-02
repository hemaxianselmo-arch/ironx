import React from "react";
import { View, Text } from "react-native";
import { Page, Top, Actions, Circ, Logo, Media, Shade, Ov, OvText, OvTitle, Btn, H2, Surf, Between, KV, Bars, FRow, B, Pill, Mono } from "../../ui";
import { C, inter, man } from "../../theme/tokens";

const DateBox = ({ d, m }: { d: string; m: string }) => (
  <View style={{ width: 44, alignItems: "center" }}>
    <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{d}</Text>
    <Text style={{ fontFamily: inter(400), fontSize: 10, color: C.mut }}>{m}</Text>
  </View>
);

/** S01 · Séance */
export default function Seance() {
  return (
    <Page withNav>
      <Top title="Séance" left={<Logo name="bodybuilding" size={38} />} right={<Actions><Circ icon="cal" size={38} /><Circ icon="search" size={38} /></Actions>} />

      <Media photo="photo-squat" h={190} r={22}>
        <Shade />
        <Ov x={16} y={14} anchor="lb">
          <OvText>Prochaine · PPL jour 1 / 6</OvText>
          <OvTitle size={26}>Push</OvTitle>
          <OvText size={13}>6 exercices · ~62 min · dernière fois 7,8 t</OvText>
        </Ov>
        <Ov x={14} y={14} anchor="rt"><Btn label="Démarrer" kind="white" icon="play" size="sm" full={false} /></Ov>
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
          <KV k="Volume" v="24,9 t" strong />
          <KV k="Séances" v="4 / 4" strong />
          <KV k="Durée" v="3 h 52" strong />
        </Between>
        <Bars vals={[18.2, 22.4, 20.1, 24.9]} labels={["S40", "S41", "S42", "S43"]} w={330} />
      </Surf>

      <H2 action="Tous">Mes programmes</H2>
      <FRow left={<Logo name="bodybuilding" size={48} />} text={<B>PPL 6 jours</B>} right={<Circ icon="chev" size={32} />} sub="Bodybuilding · semaine 7 / 12 · prochain : Push" />
      <FRow left={<Logo name="powerlifting" size={48} on={false} />} text={<B>Force 5/3/1</B>} right={<Pill label="En pause" />} sub="Powerlifting · cycle 2" />

      <H2 action="Tout voir">Historique</H2>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}>
        <DateBox d="30" m="OCT" />
        <Media photo="photo-sled" h={48} w={48} r={12} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Pull</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>54 min · 5 exos · tirage 95 kg</Text>
        </View>
        <Mono size={15}>8,1 t</Mono>
      </View>
    </Page>
  );
}
