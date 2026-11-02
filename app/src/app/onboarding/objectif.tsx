import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, SelCard, Logo, Label, Big, CTA, Ruler } from "../../ui";
import { useProfile, setProfile, pace, fmtRate, Goal } from "../../store/profile";
import { C, inter } from "../../theme/tokens";

const GOALS: [string, string, string, Goal][] = [
  ["bodybuilding", "Prendre du muscle", "surplus modéré, progression des charges", "muscle"],
  ["cardio", "Perdre du gras", "déficit contrôlé, garder la force", "fat"],
  ["powerlifting", "Performance", "compétition, records, Hyrox, course", "perf"],
  ["autres", "Rester régulier", "équilibre, santé, assiduité", "regular"],
];
/** D07 · Ton objectif */
export default function Objectif() {
  const p = useProfile();
  const on = GOALS.findIndex((g) => g[3] === p.goal);
  const setOn = (i: number) => { const g = GOALS[i][3]; setProfile({ goal: g, poidsVise: g === "muscle" ? Math.max(p.poidsVise, p.poids + 4) : g === "fat" ? Math.min(p.poidsVise, p.poids - 4) : p.poids }); };
  const { rate, weeks } = pace(p);
  return (
    <Page>
      <ProgressTop step={4} total={8} onBack={() => router.back()} />
      <Headline q="Ton objectif principal" s="Il définit tes calories, tes macros et le programme suggéré." />
      {GOALS.map(([l, t, s], i) => <SelCard key={t} title={t} s={s} on={on === i} visual={<Logo name={l} size={48} on={on === i} />} onPress={() => setOn(i)} />)}
      <View style={{ alignItems: "center", gap: 6, paddingTop: 4 }}><Label>Poids visé</Label><Ruler value={p.poidsVise} unit="kg" step={0.5} min={30} max={250} onChange={(v) => setProfile({ poidsVise: v })} /></View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
        <View style={{ gap: 2 }}><Label>Rythme conseillé</Label><Text style={{ fontFamily: inter(600), fontSize: 14, color: C.txt }}>{fmtRate(rate)}{weeks ? ` · ~${weeks} sem.` : ""}</Text></View>
        <View style={{ gap: 2, alignItems: "flex-end" }}><Label>Écart</Label><Text style={{ fontFamily: inter(600), fontSize: 14, color: C.txt }}>{String(Math.round((p.poidsVise - p.poids) * 10) / 10).replace(".", ",").replace("-", "−")} kg</Text></View>
      </View>
      <CTA label="Continuer" onPress={() => router.push("/onboarding/rythme")} />
    </Page>
  );
}
