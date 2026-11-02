import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, LogoH, Headline, SocialBtn, OrLine, Field, CTA, B, Avatar } from "../../ui";
import { C, inter } from "../../theme/tokens";

/** D03 · Connexion */
export default function Connexion() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} onPress={() => router.back()} /><LogoH h={24} /><View style={{ width: 38 }} />
      </View>
      <Headline q="Content de te revoir" s="Reprends là où tu t'es arrêté." />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.surf }}>
        <Avatar ini="HA" size={52} ring />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: inter(700), fontSize: 16, color: C.txt }}>Hemaxi</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>hemaxi@exemple.fr · Face ID</Text>
        </View>
        <Circ icon="chev" size={36} onPress={() => router.replace("/(tabs)")} />
      </View>
      <OrLine />
      <SocialBtn provider="apple" />
      <SocialBtn provider="google" />
      <Field label="E-mail" value={email} onChange={setEmail} keyboard="email-address" />
      <Field label="Mot de passe" value={pw} onChange={setPw} secure right="voir" />
      <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.txt, textAlign: "right" }}>Mot de passe oublié ?</Text>
      <CTA label="Se connecter" onPress={() => router.replace("/(tabs)")} secondary={<>Nouveau sur IRONX ? <B>Créer un compte</B></>} onSecondary={() => router.replace("/onboarding/compte")} />
    </Page>
  );
}
