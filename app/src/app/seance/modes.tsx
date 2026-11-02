import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Media, Shade, Ov, OvText, OvTitle, Logo, Sub } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useProfile } from "../../store/profile";

const MODES: { key: string; disc: string; title: string; s: string; photo: string; route: string }[] = [
  { key: "muscu", disc: "bodybuilding", title: "Musculation", s: "séries, charges, repos, records", photo: "photo-bench", route: "/seance" },
  { key: "power", disc: "powerlifting", title: "Powerlifting", s: "tentatives en % du 1RM, top set, back-off", photo: "photo-deadlift", route: "/seance/mode-power" },
  { key: "course", disc: "course", title: "Course · vélo · natation", s: "chrono, distance, allure, tours au km", photo: "photo-run-rain", route: "/seance/mode-course" },
  { key: "hyrox", disc: "hyrox", title: "Hyrox", s: "8 courses + 8 stations enchaînées au chrono", photo: "photo-sled", route: "/seance/mode-hyrox" },
  { key: "wod", disc: "crossfit", title: "CrossFit · WOD", s: "For time, AMRAP, EMOM, Tabata", photo: "photo-wallball", route: "/seance/mode-wod" },
  { key: "street", disc: "street", title: "Street workout", s: "tests max, tenues, lest, figures", photo: "photo-pullup", route: "/seance/mode-street" },
];
/** Choix du mode de séance selon la discipline */
export default function Modes() {
  const p = useProfile();
  const mine = MODES.filter((m) => p.disciplines.includes(m.disc)); const others = MODES.filter((m) => !p.disciplines.includes(m.disc));
  const Card = ({ m }: { m: (typeof MODES)[number] }) => (
    <Media photo={m.photo as any} h={110} r={20} onPress={() => router.push(m.route as any)}>
      <Shade />
      <Ov x={14} y={12} anchor="lb"><OvTitle size={20}>{m.title}</OvTitle><OvText size={12}>{m.s}</OvText></Ov>
      <Ov x={12} y={12} anchor="rt"><Logo name={m.disc} size={34} badge={false} /></Ov>
    </Media>
  );
  return (
    <Page>
      <Top title="Mode de séance" sub="chaque discipline a son chrono et sa saisie" onBack={() => router.back()} />
      {mine.map((m) => <Card key={m.key} m={m} />)}
      {others.length ? <><Sub>Autres disciplines</Sub>{others.map((m) => <Card key={m.key} m={m} />)}</> : null}
      <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut, textAlign: "center" }}>Tout ce que tu enregistres ici alimente Performances, les records et ta régularité.</Text>
    </Page>
  );
}
