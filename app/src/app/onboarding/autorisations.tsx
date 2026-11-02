import React, { useState } from "react";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, SelRow, Icon, Toggle, Btn, CTA } from "../../ui";
import { C } from "../../theme/tokens";
import { useProfile, setProfile } from "../../store/profile";

/** D10 · Autorisations */
export default function Autorisations() {
  const notif = useProfile().rappel; const setNotif = (v: boolean) => setProfile({ rappel: v });
  return (
    <Page>
      <ProgressTop step={7} total={8} onBack={() => router.back()} />
      <Headline q="Trois accès, chacun expliqué" s="Modifiables à tout moment dans les réglages." />
      <SelRow visual={<Icon name="bell" size={28} color={C.txt} w={1.6} />} title="Notifications" s="chrono de repos en arrière-plan, bravos, défis de ta salle. Jamais de pub." right={<Toggle on={notif} onChange={setNotif} />} />
      <SelRow visual={<Icon name="cam" size={28} color={C.txt} w={1.6} />} title="Appareil photo" s="scanner, photo d'assiette, stories, photos de progression." right={<Btn label="Autoriser" kind="secondary" size="sm" full={false} />} />
      <SelRow visual={<Icon name="stats" size={28} color={C.txt} w={1.6} />} title="Apple Santé" s="poids depuis ta balance, pas, fréquence cardiaque, calories." right={<Btn label="Autoriser" kind="secondary" size="sm" full={false} />} />
      <CTA label="Continuer" onPress={() => router.push("/onboarding/confidentialite")} secondary="Tes données ne sont jamais vendues." />
    </Page>
  );
}
