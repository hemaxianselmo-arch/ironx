import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, H2, Media, Mono, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume, fmtT, fmtVol, Session } from "../../store/workout";

const MOIS = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
export function HistRow({ s, onPress }: { s: Session; onPress?: () => void }) {
  const d = new Date(s.startedAt); const prs = s.exos.reduce((a, e) => a + e.sets.filter((x) => x.pr).length, 0);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }} onTouchEnd={onPress}>
      <View style={{ width: 44, alignItems: "center" }}><Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{d.getDate()}</Text><Text style={{ fontFamily: inter(400), fontSize: 10, color: C.mut }}>{MOIS[d.getMonth()]}</Text></View>
      <Media photo={s.photo as any} h={48} w={48} r={12} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{s.name}{prs ? <Text style={{ color: C.green, fontSize: 11, fontFamily: inter(700) }}>  PR</Text> : null}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{fmtT((s.endedAt ?? s.startedAt) - s.startedAt).replace(":", " min ")}s · {s.exos.length} exos{prs ? ` · ${prs} record${prs > 1 ? "s" : ""}` : ""}</Text>
      </View>
      <Mono size={15}>{fmtVol(volume(s))}</Mono>
    </View>
  );
}
/** S12 · Historique */
export default function Historique() {
  const { history } = useWorkout();
  const week = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3);
  const vol = week.reduce((a, s) => a + volume(s), 0);
  return (
    <Page>
      <Top title="Historique" sub={`${history.length} séance${history.length > 1 ? "s" : ""} enregistrée${history.length > 1 ? "s" : ""}`} right={<Circ icon="cal" size={38} />} onBack={() => router.back()} />
      <H2>Cette semaine · {week.length} séance{week.length > 1 ? "s" : ""} · {fmtVol(vol)}</H2>
      {history.length ? history.map((s) => <HistRow key={s.id} s={s} onPress={() => router.push({ pathname: "/seance/detail", params: { id: s.id } })} />) : <Sub>Ta première séance apparaîtra ici.</Sub>}
    </Page>
  );
}
