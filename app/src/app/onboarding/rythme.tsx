import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Big, Slider, FieldLabel, Days, Seg, SelRow, Toggle, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useProfile, setProfile } from "../../store/profile";

/** D08 · Ton rythme */
export default function Rythme() {
  const p = useProfile();
  const n = p.seances, days = p.jours, dur = p.duree, slot = p.creneau, rappel = p.rappel;
  const setN = (v: number) => setProfile({ seances: v, jours: p.jours.length > v ? [...p.jours].sort().slice(0, v) : p.jours });
  const setDays = (f: (d: number[]) => number[]) => setProfile({ jours: f(p.jours) });
  const setDur = (v: number) => setProfile({ duree: v as any }); const setSlot = (v: number) => setProfile({ creneau: v as any }); const setRappel = (v: boolean) => setProfile({ rappel: v });
  return (
    <Page>
      <ProgressTop step={5} total={8} onBack={() => router.back()} />
      <Headline q="Combien de séances par semaine ?" />
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
        <Big v={String(n)} unit="séances / semaine" size={72} />
        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>2</Text>
          <Slider pct={((n - 2) / 5) * 100} onChange={(p) => setN(2 + Math.round(p * 5))} />
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>7</Text>
        </View>
      </View>
      <FieldLabel>Tes jours habituels</FieldLabel>
      <Days on={days} onToggle={(i) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))} />
      <View style={{ gap: 6, paddingTop: 6 }}><FieldLabel>Durée moyenne</FieldLabel><Seg items={["45 min", "1 h", "1 h 30", "2 h +"]} on={dur} onChange={setDur} /></View>
      <View style={{ gap: 6 }}><FieldLabel>Créneau</FieldLabel><Seg items={["Matin", "Midi", "Soir", "Variable"]} on={slot} onChange={setSlot} /></View>
      <SelRow title="Rappel 30 min avant la séance" s="les jours choisis" right={<Toggle on={rappel} onChange={setRappel} />} />
      <CTA label="Continuer" onPress={() => router.push("/onboarding/salle")} />
    </Page>
  );
}
