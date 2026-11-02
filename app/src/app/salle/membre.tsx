import React from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Avatar, Btn, KV, H2, FRow, B, Logo, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useGym, gym, MEMBERS, fmtT } from "../../store/gym";

/** Profil d'un membre (F13 simplifié) */
export default function Membre() {
  const { id } = useLocalSearchParams<{ id: string }>(); const g = useGym(); const m = MEMBERS.find((x) => x.id === id);
  if (!m) return <Page><Top title="Membre" onBack={() => router.back()} /></Page>;
  const on = g.following.includes(m.id);
  const disc: Record<string, string> = { Powerlifting: "powerlifting", Bodybuilding: "bodybuilding", Hyrox: "hyrox", CrossFit: "crossfit", "Street workout": "street", Course: "course" };
  return (
    <Page>
      <Top title={m.name} sub={`${m.discipline} · ${m.bw} kg`} onBack={() => router.back()} right={<Btn label={on ? "Suivi" : "Suivre"} kind={on ? "secondary" : "primary"} size="sm" full={false} onPress={() => gym.follow(m.id)} />} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}><Avatar ini={m.ini} size={72} ring /><View style={{ flex: 1, gap: 4 }}><Text style={{ fontFamily: man(700), fontSize: 20, color: C.txt }}>{m.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{m.live ? `En séance · ${m.live}` : `${m.weekSessions} séances cette semaine`}</Text></View><Logo name={disc[m.discipline] ?? "autres"} size={44} /></View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}><KV k="Semaine" v={fmtT(m.weekVol)} /><KV k="Mois" v={fmtT(m.monthVol)} /><KV k="Séances" v={String(m.weekSessions)} />{m.km ? <KV k="Km / mois" v={String(m.km)} /> : <KV k="Abonnés" v={String(40 + m.weekSessions * 7)} />}</View>
      <H2>Records</H2>
      <FRow text={<B>Développé couché</B>} right={<Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{m.bench} kg</Text>} sub={`ratio ${(m.bench / m.bw).toFixed(2).replace(".", ",")}`} />
      <FRow text={<B>Squat</B>} right={<Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{m.squat} kg</Text>} sub={`ratio ${(m.squat / m.bw).toFixed(2).replace(".", ",")}`} />
      <FRow text={<B>Soulevé de terre</B>} right={<Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{m.deadlift} kg</Text>} sub={`ratio ${(m.deadlift / m.bw).toFixed(2).replace(".", ",")}`} />
      <Sub>Profil de démonstration : les vrais membres arriveront avec le serveur.</Sub>
    </Page>
  );
}
