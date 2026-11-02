import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Btn, Label, Big, Pill, H2, SelRow, Icon, MP, MG, ML } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useProfile, macros, tdee, GOAL_LABEL } from "../../store/profile";
import { useNutrition, nutri } from "../../store/nutrition";

/** N10 · Objectifs nutrition : cible calorique ajustable, répartition des macros, eau */
export default function Objectifs() {
  const p = useProfile(); const n = useNutrition(); const m = macros(p); const kcal = m.kcal + n.kcalAdjust; const maint = tdee(p);
  const pct = (g: number, k: number) => Math.round((g * k / (m.prot * 4 + m.gluc * 4 + m.lip * 9)) * 100);
  const rows: [string, number, number, string][] = [["Protéines", m.prot, pct(m.prot, 4), MP], ["Glucides", m.gluc, pct(m.gluc, 4), MG], ["Lipides", m.lip, pct(m.lip, 9), ML]];
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Objectifs</Text><Btn label="OK" kind="white" size="sm" full={false} onPress={() => router.back()} /></View>
      <View style={{ alignItems: "center", gap: 2 }}>
        <Label>objectif quotidien</Label><Big v={kcal.toLocaleString("fr-FR")} unit="kcal" size={60} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>{GOAL_LABEL[p.goal]} · {kcal - maint >= 0 ? "+" : "−"}{Math.abs(kcal - maint)} kcal sur ta maintenance ({maint.toLocaleString("fr-FR")}){n.kcalAdjust ? ` · ajustement manuel ${n.kcalAdjust > 0 ? "+" : ""}${n.kcalAdjust}` : ""}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}><Pill label="−100" onPress={() => nutri.setAdjust(n.kcalAdjust - 100)} /><Pill label="+100" onPress={() => nutri.setAdjust(n.kcalAdjust + 100)} /><Pill label="Recalculer" on onPress={() => nutri.setAdjust(0)} /></View>
      <H2>Répartition des macros</H2>
      {rows.map(([name, g, pc, c]) => (
        <View key={name} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} /><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 15, color: C.txt }}>{name}</Text><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{g} g</Text><Text style={{ width: 48, textAlign: "right", fontFamily: man(700), fontSize: 16, color: C.txt }}>{pc} %</Text></View>))}
      <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 2 }}>{rows.map(([name, , pc, c]) => <View key={name} style={{ flex: pc, backgroundColor: c }} />)}</View>
      <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>Protéines {p.goal === "fat" ? "2,2" : "2"} g/kg, lipides 0,9 g/kg, le reste en glucides. Modifie ton profil (objectif, poids, séances) pour recalculer.</Text>
      <H2>Autres cibles</H2>
      <SelRow title="Eau" s={`${String(n.waterGoal).replace(".", ",")} L par jour`} right={<View style={{ flexDirection: "row", gap: 6 }}><Pill label="−" onPress={() => nutri.setWaterGoal(Math.max(1, n.waterGoal - 0.25))} /><Pill label="+" onPress={() => nutri.setWaterGoal(n.waterGoal + 0.25)} /></View>} />
      <SelRow title="Fibres" s="30 g par jour (recommandation)" right={<Icon name="chev" size={18} color={C.mut} />} />
      <SelRow title="Jours d'entraînement" s="les calories brûlées en séance s'ajoutent automatiquement au budget du jour" right={<Icon name="check" size={18} color={C.green} />} />
    </Page>
  );
}
