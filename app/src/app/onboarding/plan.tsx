import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, LogoH, H1, Ring, Macro, H2, Media, Shade, Ov, OvText, OvTitle, Logo, CTA, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useProfile, setProfile, macros, pace, fmtRate, suggestProgram, weekPlan, GOAL_LABEL, tdee, bmr } from "../../store/profile";

/** D12 · Ton plan — calculé depuis le profil */
export default function Plan() {
  const p = useProfile();
  const m = macros(p); const { rate, weeks } = pace(p); const prog = suggestProgram(p); const week = weekPlan(p);
  const fmt = (v: number) => String(v).replace(".", ",");
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><LogoH h={24} /><View style={{ width: 38 }} />
      </View>
      <View style={{ alignItems: "center", gap: 4, paddingVertical: 4 }}>
        <H1 size={30}>Ton plan est prêt</H1>
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>
          {GOAL_LABEL[p.goal]} · {p.seances} séances / semaine{p.poidsVise !== p.poids ? ` · objectif ${fmt(p.poidsVise)} kg` : ""}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, paddingVertical: 6 }}>
        <Ring pct={100} size={110} thick={10} color="#fff">
          <Text style={{ fontFamily: man(700), fontSize: 28, letterSpacing: -1, color: C.txt }}>{m.kcal.toLocaleString("fr-FR")}</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 11, color: "rgba(255,255,255,0.8)" }}>kcal / jour</Text>
        </Ring>
        <View style={{ flex: 1, gap: 10 }}>
          <Macro label="Protéines" v={m.prot} g={m.prot} color="#4DB8FF" />
          <Macro label="Glucides" v={m.gluc} g={m.gluc} color="#FFB84D" />
          <Macro label="Lipides" v={m.lip} g={m.lip} color="#FF6B9A" />
        </View>
      </View>
      <Sub>
        Dépense estimée {tdee(p).toLocaleString("fr-FR")} kcal (métabolisme {bmr(p).toLocaleString("fr-FR")} + activité) · {fmtRate(rate)}{weeks ? ` · ~${weeks} semaines pour atteindre ${fmt(p.poidsVise)} kg` : ""}
      </Sub>
      <H2 action="Changer">Programme suggéré</H2>
      <Media photo="photo-squat" h={130} r={18}>
        <Shade />
        <Ov x={14} y={12} anchor="lb"><OvText>{prog.family} · {prog.weeks} semaines</OvText><OvTitle>{prog.name}</OvTitle></Ov>
        <Ov x={12} y={12} anchor="rt"><Logo name={prog.discipline} size={40} /></Ov>
      </Media>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {week.map(([d, t], i) => (
          <View key={i} style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 2, borderRadius: 12, alignItems: "center", backgroundColor: t ? C.surf : "transparent", opacity: t ? 1 : 0.4 }}>
            <Text style={{ fontFamily: inter(700), fontSize: 11, color: C.txt, marginBottom: 2 }}>{d}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 10.5, color: C.mut }} numberOfLines={1}>{t || "repos"}</Text>
          </View>
        ))}
      </View>
      <CTA label="C'est parti" icon="bolt" kind="white" onPress={() => { setProfile({ onboarded: true }); router.replace("/(tabs)"); }} />
    </Page>
  );
}
