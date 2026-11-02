import React, { useState } from "react";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, SelRow, Logo, CTA } from "../../ui";
import { useProfile, setProfile } from "../../store/profile";

const LIST = [
  ["bodybuilding", "Musculation / Bodybuilding", "hypertrophie, volume, muscles ciblés"],
  ["powerlifting", "Powerlifting", "squat, développé, soulevé · % du 1RM"],
  ["hyrox", "Hyrox", "8 stations, course, temps par station"],
  ["crossfit", "CrossFit", "WOD, AMRAP, EMOM, benchmarks"],
  ["course", "Course et cardio", "allure, fréquence cardiaque, zones"],
  ["street", "Street workout", "figures, lest, statiques"],
  ["velo", "Vélo", "puissance, FTP, dénivelé"],
  ["natation", "Natation", "allure aux 100 m, SWOLF"],
  ["mobilite", "Mobilité et yoga", "amplitudes, souplesse, récupération"],
];
/** D04 · Tes disciplines */
export default function Disciplines() {
  const on = useProfile().disciplines;
  const toggle = (k: string) => setProfile({ disciplines: on.includes(k) ? on.filter((x) => x !== k) : [...on, k] });
  return (
    <Page>
      <ProgressTop step={1} total={8} onBack={() => router.back()} />
      <Headline q="Qu'est-ce que tu pratiques ?" s="Une ou plusieurs. L'écran de séance, les stats et les classements s'adaptent." />
      {LIST.map(([k, t, s]) => <SelRow key={k} visual={<Logo name={k} size={52} on={on.includes(k)} />} title={t} s={s} on={on.includes(k)} onPress={() => toggle(k)} />)}
      <CTA label="Continuer" onPress={() => router.push("/onboarding/toi")} />
    </Page>
  );
}
