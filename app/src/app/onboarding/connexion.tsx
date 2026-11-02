import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, LogoH, Headline, SocialBtn, OrLine, Field, CTA, B, Avatar } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { auth, useAuth } from "../../store/auth";

/** D03 · Connexion */
export default function Connexion() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const a = useAuth(); const last = a.lastEmail ? a.accounts[a.lastEmail] : null;
  const go = (e: string, p: string) => { const r = auth.login(e, p); if (r) setErr(r); else router.replace(a.accounts[e.trim().toLowerCase()]?.profile.onboarded ? "/(tabs)" : "/onboarding/disciplines"); };
  const ini = (last?.profile.prenom.trim().slice(0, 2) || last?.email.slice(0, 2) || "IX").toUpperCase();
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} onPress={() => router.back()} /><LogoH h={24} /><View style={{ width: 38 }} />
      </View>
      <Headline q="Content de te revoir" s="Reprends là où tu t'es arrêté." />
      {last ? <><View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.surf }}>
        <Avatar ini={ini} size={52} ring />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: inter(700), fontSize: 16, color: C.txt }}>{last.profile.prenom || "Dernier compte"}</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }} numberOfLines={1}>{last.email}</Text>
        </View>
        <Circ icon="chev" size={36} onPress={() => setEmail(last.email)} />
      </View>
      <OrLine /></> : null}
      <SocialBtn provider="apple" />
      <SocialBtn provider="google" />
      <Field label="E-mail" value={email} onChange={setEmail} keyboard="email-address" />
      <Field label="Mot de passe" value={pw} onChange={setPw} secure={!show} right={show ? "cacher" : "voir"} onRight={() => setShow((v) => !v)} />
      {err ? <Text style={{ fontFamily: inter(500), fontSize: 13, color: C.red }}>{err}</Text> : null}
      <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.txt, textAlign: "right" }}>Mot de passe oublié ?</Text>
      <CTA label="Se connecter" onPress={() => go(email, pw)} secondary={<>Nouveau sur IRONX ? <B>Créer un compte</B></>} onSecondary={() => router.replace("/onboarding/compte")} />
    </Page>
  );
}
