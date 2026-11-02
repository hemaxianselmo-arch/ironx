import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Avatar, Btn, Field, Seg, FieldLabel, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";

/** D05 · Toi */
export default function Toi() {
  const [prenom, setPrenom] = useState("Hemaxi");
  const [pseudo, setPseudo] = useState("@hemaxi");
  const [sexe, setSexe] = useState(0);
  const [niveau, setNiveau] = useState(1);
  return (
    <Page>
      <ProgressTop step={2} total={8} onBack={() => router.back()} />
      <Headline q="Parle-nous de toi" s="Pour tes besoins caloriques et tes catégories de classement." />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Avatar ini="HA" size={72} ring />
        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Photo de profil</Text>
          <View style={{ flexDirection: "row", gap: 8 }}><Btn label="Prendre" kind="secondary" icon="cam" size="sm" full={false} /><Btn label="Galerie" kind="secondary" size="sm" full={false} /></View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Prénom" value={prenom} onChange={setPrenom} /></View>
        <View style={{ flex: 1 }}><Field label="Pseudo" value={pseudo} onChange={setPseudo} /></View>
      </View>
      <View style={{ gap: 6 }}><FieldLabel>Sexe</FieldLabel><Seg items={["Homme", "Femme", "Autre"]} on={sexe} onChange={setSexe} /></View>
      <Field label="Date de naissance" value="12 avril 1986" right="40 ans" />
      <View style={{ gap: 6 }}><FieldLabel>Niveau</FieldLabel><Seg items={["Débutant", "Intermédiaire", "Confirmé"]} on={niveau} onChange={setNiveau} /></View>
      <CTA label="Continuer" onPress={() => router.push("/onboarding/mesures")} />
    </Page>
  );
}
