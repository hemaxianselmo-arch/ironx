import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Big, Slider, FieldLabel, Days, Seg, SelRow, Toggle, CTA } from "../../ui";
import { C, inter } from "../../theme/tokens";

/** D08 · Ton rythme */
export default function Rythme() {
  const [n, setN] = useState(4);
  const [days, setDays] = useState([0, 1, 3, 4]);
  const [dur, setDur] = useState(1);
  const [slot, setSlot] = useState(2);
  const [rappel, setRappel] = useState(true);
  return (
    <Page>
      <ProgressTop step={5} total={8} onBack={() => router.back()} />
      <Headline q="Combien de séances par semaine ?" />
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
        <Big v={String(n)} unit="séances / semaine" size={72} />
        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>2</Text>
          <Slider pct={((n - 2) / 5) * 100} />
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
