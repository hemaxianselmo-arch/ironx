import React from "react";
import { View, Text } from "react-native";
import { Page, Between, Actions, Avatar, Circ, Label, Big, Sub, B, Surf, Row, Ring, H2, Media, Shade, Ov, OvText, OvTitle, Btn, FRow, Mono } from "../../ui";
import { C, inter, man } from "../../theme/tokens";

/** V3 · Accueil */
export default function Accueil() {
  return (
    <Page hero withNav>
      <Between>
        <Avatar ini="HA" size={40} ring />
        <Actions>
          <Circ icon="search" size={40} kind="glass" />
          <Circ icon="bell" size={40} kind="glass" />
        </Actions>
      </Between>

      <View style={{ alignItems: "center", gap: 4, paddingTop: 6, paddingBottom: 2 }}>
        <Label>Cette semaine · volume soulevé</Label>
        <Big v="24 860" unit="kg" size={60} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
          4 séances · 2 records · <Text style={{ fontFamily: inter(600), color: C.green }}>+6 %</Text> vs semaine passée
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 4 }}>
        <Circ icon="play" size={56} kind="white" label="Séance" />
        <Circ icon="plus" size={56} kind="glass" label="Repas" />
        <Circ icon="cam" size={56} kind="glass" label="Story" />
        <Circ icon="stats" size={56} kind="glass" label="Poids" />
      </View>

      <Surf pad={14}>
        <Row gap={14}>
          <Ring pct={68} size={64} thick={7}><Mono size={15}>1 040</Mono></Ring>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>1 040 kcal restantes</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>P 142 / 180 · G 210 / 320 · L 48 / 80</Text>
          </View>
          <Circ icon="chev" size={32} />
        </Row>
      </Surf>

      <H2>Aujourd'hui</H2>
      <Media photo="photo-deadlift" h={150}>
        <Shade />
        <Ov x={14} y={12} anchor="lb">
          <OvText>Programme PPL · jour 1 / 6</OvText>
          <OvTitle>Push · 62 min</OvTitle>
          <OvText dim={0.75}>Développé couché · Incliné · Dips · Élévations</OvText>
        </Ov>
        <Ov x={14} y={14} anchor="rb"><Btn label="Lancer" kind="white" icon="play" size="sm" full={false} /></Ov>
      </Media>

      <H2 action="Voir tout">Ta salle</H2>
      <FRow left={<Avatar ini="KM" size={44} ring />} text={<><B>kevin.m</B> vient de battre son record au squat</>} right={<Mono size={15}>150 kg</Mono>} sub="il y a 1 h · [NOM DE LA SALLE]" />
      <FRow left={<Avatar ini="JB" size={44} ring />} text={<><B>julie.b</B> et 3 membres sont en séance maintenant</>} right={<Circ icon="chev" size={32} />} sub="Hyrox · depuis 18 min" />
    </Page>
  );
}
