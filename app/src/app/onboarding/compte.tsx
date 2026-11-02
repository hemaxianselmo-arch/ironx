import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, LogoH, Headline, SocialBtn, OrLine, Field, CheckCircle, CTA, B } from "../../ui";
import { C, inter } from "../../theme/tokens";

/** D02 · Créer un compte */
export default function Compte() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const strength = Math.min(4, Math.floor(pw.length / 3));
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} onPress={() => router.back()} /><LogoH h={24} /><View style={{ width: 38 }} />
      </View>
      <Headline q="Crée ton compte" s="30 secondes. Gratuit, sans publicité, tes données restent à toi." />
      <SocialBtn provider="apple" />
      <SocialBtn provider="google" />
      <OrLine text="ou avec ton e-mail" />
      <Field label="E-mail" value={email} onChange={setEmail} placeholder="prenom@exemple.fr" keyboard="email-address" />
      <Field label="Mot de passe" value={pw} onChange={setPw} secure right="voir" />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < strength ? C.green : "rgba(255,255,255,0.1)" }} />)}
        <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut, marginLeft: 8 }}>{["", "faible", "moyen", "bon", "solide"][strength]}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <CheckCircle on />
        <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 12.5, color: C.soft, lineHeight: 18 }}>J'ai 18 ans ou plus et j'accepte les <B color={C.soft}>conditions d'utilisation</B> et la <B color={C.soft}>politique de confidentialité</B>.</Text>
      </View>
      <CTA label="Créer mon compte" onPress={() => router.push("/onboarding/disciplines")} secondary={<>Déjà un compte ? <B>Se connecter</B></>} onSecondary={() => router.replace("/onboarding/connexion")} />
    </Page>
  );
}
