import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Seg, Label, Ruler, Divider, CTA } from "../../ui";
import { useProfile, setProfile } from "../../store/profile";

/** D06 · Tes mesures */
export default function Mesures() {
  const p = useProfile();
  const unit = p.unit, taille = p.taille, poids = p.poids;
  const setUnit = (v: number) => setProfile({ unit: v as any }); const setTaille = (v: number) => setProfile({ taille: v }); const setPoids = (v: number) => setProfile({ poids: v, poidsVise: p.poidsVise === p.poids ? v : p.poidsVise });
  return (
    <Page>
      <ProgressTop step={3} total={8} onBack={() => router.back()} />
      <Headline q="Taille et poids" />
      <View style={{ alignItems: "center" }}><View style={{ width: 200 }}><Seg items={["kg · cm", "lb · ft"]} on={unit} onChange={setUnit} /></View></View>
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 10 }}><Label>Taille</Label><Ruler value={taille} unit="cm" min={120} max={230} onChange={setTaille} /></View>
      <Divider />
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 10 }}><Label>Poids actuel</Label><Ruler value={poids} unit="kg" step={0.5} min={30} max={250} onChange={setPoids} /></View>
      <CTA label="Continuer" onPress={() => router.push("/onboarding/objectif")} secondary="Balance connectée ? Synchronise-la plus tard depuis Apple Santé." />
    </Page>
  );
}
