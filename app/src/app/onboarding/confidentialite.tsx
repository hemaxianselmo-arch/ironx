import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, SelCard, Icon, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useProfile, setProfile } from "../../store/profile";

/** D11 · Confidentialité */
export default function Confidentialite() {
  const on = useProfile().visibilite; const setOn = (v: number) => setProfile({ visibilite: v as any });
  const opts: [any, string, string][] = [["Salle", "Ma salle", "séances et records visibles par les membres de ta salle"], ["Fil", "Public", "visible par tous les membres IRONX, classements régionaux"], ["x", "Privé", "personne ne voit tes séances, tu gardes les statistiques"]];
  return (
    <Page>
      <ProgressTop step={8} total={8} skip={false} onBack={() => router.back()} />
      <Headline q="Qui peut voir quoi" s="Poids, mensurations et nutrition restent privés quoi qu'il arrive." />
      {opts.map(([ic, t, s], i) => <SelCard key={t} title={t} s={s} on={on === i} visual={<Icon name={ic} size={30} color={C.txt} w={1.6} />} onPress={() => setOn(i)} />)}
      <View style={{ paddingTop: 6 }}>
        <Text style={{ fontFamily: inter(700), fontSize: 13, color: C.mut, paddingBottom: 4 }}>Toujours privé</Text>
        {["Poids et mensurations", "Journal nutrition", "Photos de progression"].map((t) => (
          <View key={t} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={{ fontFamily: inter(400), fontSize: 14, color: C.txt }}>{t}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>privé</Text>
          </View>
        ))}
      </View>
      <CTA label="Voir mon plan" icon="bolt" onPress={() => router.push("/onboarding/plan")} />
    </Page>
  );
}
