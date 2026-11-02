import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Page, Media, Shade, Ov, OvText, Circ, Avatar, Tabs, Surf, H2, MemberRow, Btn, Progress, Sub } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { useGym, MEMBERS, fmtT, CHALLENGE, gym } from "../../store/gym";
import { useWorkout, volume } from "../../store/workout";
import { useProfile } from "../../store/profile";

/** G01 · Salle */
export default function Salle() {
  const g = useGym(); const { history } = useWorkout(); const p = useProfile(); const insets = useSafeAreaInsets(); const [tab, setTab] = useState(0);
  const myMonth = history.filter((s) => new Date(s.startedAt).getMonth() === new Date().getMonth()).reduce((a, s) => a + volume(s), 0);
  const myWeek = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3).reduce((a, s) => a + volume(s), 0);
  const total = CHALLENGE.base + myMonth; const pct = Math.min(100, (total / CHALLENGE.goal) * 100);
  const us = (MEMBERS.reduce((a, m) => a + m.weekVol, 0) + myWeek) / (MEMBERS.length + 1); const them = g.challengeOther.vol;
  const live = MEMBERS.filter((m) => m.live);
  return (
    <Page pad={false} withNav>
      <Media photo="photo-group" h={210} r={0}>
        <Shade />
        <Ov x={16} y={insets.top + 14} anchor="lt" style={{ right: 16, flexDirection: "row", justifyContent: "space-between" }}><Circ icon="search" size={38} kind="glass" onPress={() => router.push("/salle/membres")} /><View style={{ flexDirection: "row", gap: 8 }}><Circ icon="share" size={38} kind="glass" /><Circ icon="more" size={38} kind="glass" onPress={() => router.push("/salle/admin")} /></View></Ov>
        <Ov x={16} y={14} anchor="lb" style={{ right: 16, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View style={{ gap: 2 }}><Text style={{ fontFamily: man(700), fontSize: 26, letterSpacing: -0.5, color: "#fff" }}>{g.gymName}</Text><OvText size={13}>{p.salle ? "Lamballe" : "Salle de démonstration"} · {MEMBERS.length + 78} membres · {MEMBERS.filter((m) => m.weekSessions > 0).length + 23} actifs cette semaine</OvText></View>
          <View style={{ flexDirection: "row" }}>{live.slice(0, 3).map((m, i) => <View key={m.id} style={{ marginLeft: i ? -10 : 0 }}><Avatar ini={m.ini} size={32} ring /></View>)}</View>
        </Ov>
      </Media>
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        <Tabs items={["Défis", "Classement", "Membres", "Discussion"]} on={tab} onChange={(i) => { setTab(i); if (i === 1) router.push("/salle/classement"); if (i === 2) router.push("/salle/membres"); if (i === 3) router.push("/salle/discussion"); }} />
        <Surf>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ gap: 2 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Défi collectif · J-{CHALLENGE.endsIn}</Text><Text style={{ fontFamily: man(700), fontSize: 22, letterSpacing: -0.4, color: C.txt }}>{CHALLENGE.name}</Text></View>
            <Image source={IMG["record"]} style={{ width: 48, height: 48 }} resizeMode="contain" />
          </View>
          <Progress pct={pct} h={10} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>{fmtT(total)} / {fmtT(CHALLENGE.goal)} · {Math.round(pct)} %</Text><Text style={{ fontFamily: inter(600), fontSize: 12.5, color: C.accent }}>ta part {fmtT(myMonth)}</Text></View>
          <Btn label="Voir le défi" kind="secondary" size="sm" onPress={() => router.push("/salle/defi")} />
        </Surf>
        <Surf>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, alignItems: "center", gap: 4 }}><Text style={{ fontFamily: man(700), fontSize: 24, color: C.accent }}>{fmtT(us)}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>Nous · par membre</Text></View>
            <Text style={{ fontFamily: man(700), color: C.mut }}>VS</Text>
            <View style={{ flex: 1, alignItems: "center", gap: 4 }}><Text style={{ fontFamily: man(700), fontSize: 24, color: C.txt }}>{fmtT(them)}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{g.challengeOther.name}</Text></View>
          </View>
          <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden" }}><View style={{ flex: us, backgroundColor: C.accent }} /><View style={{ flex: them, backgroundColor: "rgba(255,255,255,0.15)" }} /></View>
          <Btn label="Salle contre salle · 5 jours restants" kind="secondary" size="sm" onPress={() => router.push("/salle/versus")} />
        </Surf>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Btn label="Événements" kind="secondary" size="sm" onPress={() => router.push("/salle/evenements")} /></View>
          <View style={{ flex: 1 }}><Btn label="Lancer un défi" size="sm" icon="bolt" onPress={() => router.push("/salle/lancer")} /></View>
        </View>
        <H2 action={String(live.length)}>En séance maintenant</H2>
        {live.map((m) => <MemberRow key={m.id} ini={m.ini} name={m.name} s={`${m.live} · depuis ${Math.round((Date.now() - (m.liveSince ?? Date.now())) / 60e3)} min`} right={<Circ icon="chev" size={32} />} onPress={() => router.push({ pathname: "/salle/membre", params: { id: m.id } })} />)}
        <Sub>Les autres membres sont des profils de démonstration jusqu'à la mise en ligne du serveur ; tes chiffres, eux, sont réels.</Sub>
      </View>
    </Page>
  );
}
