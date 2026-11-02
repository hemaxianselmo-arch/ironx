import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Media, Shade, Ov, OvText, H2, AreaChart, MemberRow, Btn, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useGym, gym, MEMBERS, fmtT } from "../../store/gym";
import { useWorkout, volume } from "../../store/workout";

/** G05 · Salle contre salle */
export default function Versus() {
  const g = useGym(); const { history } = useWorkout();
  const myWeek = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3).reduce((a, s) => a + volume(s), 0);
  const us = (MEMBERS.reduce((a, m) => a + m.weekVol, 0) + myWeek) / (MEMBERS.length + 1); const them = g.challengeOther.vol;
  const curve = [0.87, 0.91, 0.93, 0.95, 0.97, 0.985, 1].map((k) => us * k);
  return (
    <Page>
      <Top title="Salle contre salle" sub="Volume par membre actif · fin dans 5 jours" right={<Circ icon="share" size={38} />} onBack={() => router.back()} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Media photo="photo-group" h={130} r={18}><Shade /><Ov x={10} y={10} anchor="lb"><OvText size={11}>Nous</OvText><Text style={{ fontFamily: man(700), fontSize: 26, color: C.accent }}>{fmtT(us)}</Text></Ov></Media></View>
        <View style={{ flex: 1 }}><Media photo="photo-box" h={130} r={18}><Shade /><Ov x={10} y={10} anchor="lb"><OvText size={11}>{g.challengeOther.name}</OvText><Text style={{ fontFamily: man(700), fontSize: 26, color: "#fff" }}>{fmtT(them)}</Text></Ov></Media></View>
      </View>
      <View style={{ flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden" }}><View style={{ flex: us, backgroundColor: C.accent }} /><View style={{ flex: them, backgroundColor: "rgba(255,255,255,0.15)" }} /></View>
      <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut, textAlign: "center" }}>{us > them ? `${fmtT(us - them)} d'avance par membre` : `${fmtT(them - us)} de retard par membre`}</Text>
      <H2 action="7 jours">Évolution</H2>
      <AreaChart points={curve} h={100} />
      <Sub>Objectif : garder l'avance jusqu'à la fin du défi. Tes séances comptent dans la moyenne de la salle.</Sub>
      <H2>Fil des deux salles</H2>
      <MemberRow ini="KM" name="kevin.m · nous" s="a soulevé 9,2 t aujourd'hui" right={<Text style={{ fontFamily: inter(700), fontSize: 12, color: C.green }}>+9,2 t</Text>} />
      <MemberRow ini="LP" name="lea.p · eux" s="nouveau record au squat 120 kg" ring={false} right={<Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>eux</Text>} />
      <Btn label={g.cheers ? `Encouragé ${g.cheers} fois · encore !` : "Encourager l'équipe"} icon="bolt" onPress={gym.cheer} />
    </Page>
  );
}
