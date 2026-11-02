import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Avatar, Btn, Field, Seg, FieldLabel, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useProfile, setProfile, age } from "../../store/profile";

/** D05 · Toi */
export default function Toi() {
  const p = useProfile();
  const prenom = p.prenom, pseudo = p.pseudo, sexe = p.sexe, niveau = p.niveau;
  const setPrenom = (v: string) => setProfile({ prenom: v }); const setPseudo = (v: string) => setProfile({ pseudo: v });
  const setSexe = (v: number) => setProfile({ sexe: v as any }); const setNiveau = (v: number) => setProfile({ niveau: v as any });
  const ini = (prenom.trim().slice(0, 2) || "IX").toUpperCase();
  return (
    <Page>
      <ProgressTop step={2} total={8} onBack={() => router.back()} />
      <Headline q="Parle-nous de toi" s="Pour tes besoins caloriques et tes catégories de classement." />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Avatar ini={ini} size={72} ring />
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Photo de profil</Text>
          <View style={{ flexDirection: "row", gap: 8 }}><Btn label="Prendre" kind="secondary" icon="cam" size="sm" full={false} /><Btn label="Galerie" kind="secondary" size="sm" full={false} /></View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Prénom" value={prenom} onChange={setPrenom} placeholder="Ton prénom" /></View>
        <View style={{ flex: 1 }}><Field label="Pseudo" value={pseudo} onChange={setPseudo} placeholder="@pseudo" /></View>
      </View>
      <View style={{ gap: 6 }}><FieldLabel>Sexe</FieldLabel><Seg items={["Homme", "Femme", "Autre"]} on={sexe} onChange={setSexe} /></View>
      <Field label="Date de naissance" value={p.naissance} onChange={(v) => setProfile({ naissance: v })} right={`${age(p)} ans`} placeholder="AAAA-MM-JJ" />
      <View style={{ gap: 6 }}><FieldLabel>Niveau</FieldLabel><Seg items={["Débutant", "Intermédiaire", "Confirmé"]} on={niveau} onChange={setNiveau} /></View>
      <CTA label="Continuer" onPress={() => router.push("/onboarding/mesures")} />
    </Page>
  );
}
