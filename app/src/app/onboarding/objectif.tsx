import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, SelCard, Logo, Label, Big, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";

const GOALS = [
  ["bodybuilding", "Prendre du muscle", "surplus modéré, progression des charges"],
  ["cardio", "Perdre du gras", "déficit contrôlé, garder la force"],
  ["powerlifting", "Performance", "compétition, records, Hyrox, course"],
  ["autres", "Rester régulier", "équilibre, santé, assiduité"],
];
/** D07 · Ton objectif */
export default function Objectif() {
  const [on, setOn] = useState(0);
  return (
    <Page>
      <ProgressTop step={4} total={8} onBack={() => router.back()} />
      <Headline q="Ton objectif principal" s="Il définit tes calories, tes macros et le programme suggéré." />
      {GOALS.map(([l, t, s], i) => <SelCard key={t} title={t} s={s} on={on === i} visual={<Logo name={l} size={48} on={on === i} />} onPress={() => setOn(i)} />)}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
        <View style={{ gap: 2 }}><Label>Poids visé</Label><Big v="86" unit="kg" size={36} /></View>
        <View style={{ gap: 2, alignItems: "flex-end" }}><Label>Rythme conseillé</Label><Text style={{ fontFamily: inter(600), fontSize: 14, color: C.txt }}>+0,25 kg / sem. · ~4 mois</Text></View>
      </View>
      <CTA label="Continuer" onPress={() => router.push("/onboarding/rythme")} />
    </Page>
  );
}
