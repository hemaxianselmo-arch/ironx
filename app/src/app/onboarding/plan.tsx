import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, LogoH, H1, Ring, Macro, H2, Media, Shade, Ov, OvText, OvTitle, Logo, CTA } from "../../ui";
import { C, inter, man } from "../../theme/tokens";

const WEEK: [string, string][] = [["L", "Haut A"], ["M", "Bas A"], ["M", ""], ["J", "Haut B"], ["V", "Bas B"], ["S", ""], ["D", ""]];
/** D12 · Ton plan */
export default function Plan() {
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><LogoH h={24} /><View style={{ width: 38 }} />
      </View>
      <View style={{ alignItems: "center", gap: 4, paddingVertical: 4 }}>
        <H1 size={30}>Ton plan est prêt</H1>
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)" }}>Prise de muscle · 4 séances / semaine · objectif 86 kg</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, paddingVertical: 6 }}>
        <Ring pct={100} size={110} thick={10} color="#fff">
          <Text style={{ fontFamily: man(700), fontSize: 28, letterSpacing: -1, color: C.txt }}>2 650</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 11, color: "rgba(255,255,255,0.8)" }}>kcal / jour</Text>
        </Ring>
        <View style={{ flex: 1, gap: 10 }}>
          <Macro label="Protéines" v={180} g={180} color="#4DB8FF" />
          <Macro label="Glucides" v={320} g={320} color="#FFB84D" />
          <Macro label="Lipides" v={85} g={85} color="#FF6B9A" />
        </View>
      </View>
      <H2 action="Changer">Programme suggéré</H2>
      <Media photo="photo-squat" h={130} r={18}>
        <Shade />
        <Ov x={14} y={12} anchor="lb"><OvText>Bodybuilding · 6 semaines</OvText><OvTitle>Upper / Lower · 4 jours</OvTitle></Ov>
        <Ov x={12} y={12} anchor="rt"><Logo name="bodybuilding" size={40} /></Ov>
      </Media>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {WEEK.map(([d, t], i) => (
          <View key={i} style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 2, borderRadius: 12, alignItems: "center", backgroundColor: t ? C.surf : "transparent", opacity: t ? 1 : 0.4 }}>
            <Text style={{ fontFamily: inter(700), fontSize: 11, color: C.txt, marginBottom: 2 }}>{d}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{t || "repos"}</Text>
          </View>
        ))}
      </View>
      <CTA label="C'est parti" icon="bolt" kind="white" onPress={() => router.replace("/(tabs)")} />
    </Page>
  );
}
