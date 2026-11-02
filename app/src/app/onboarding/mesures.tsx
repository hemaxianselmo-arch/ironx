import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Seg, Label, Ruler, Divider, CTA } from "../../ui";

/** D06 · Tes mesures */
export default function Mesures() {
  const [unit, setUnit] = useState(0);
  return (
    <Page>
      <ProgressTop step={3} total={8} onBack={() => router.back()} />
      <Headline q="Taille et poids" />
      <View style={{ alignItems: "center" }}><View style={{ width: 200 }}><Seg items={["kg · cm", "lb · ft"]} on={unit} onChange={setUnit} /></View></View>
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 10 }}><Label>Taille</Label><Ruler value={178} unit="cm" /></View>
      <Divider />
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 10 }}><Label>Poids actuel</Label><Ruler value={82} unit="kg" step={0.5} /></View>
      <CTA label="Continuer" onPress={() => router.push("/onboarding/objectif")} secondary="Balance connectée ? Synchronise-la plus tard depuis Apple Santé." />
    </Page>
  );
}
