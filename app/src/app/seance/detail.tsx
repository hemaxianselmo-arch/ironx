import React from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Media, Shade, Ov, OvText, OvTitle, Circ, KV, Divider, Btn } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkout, volume, setsDone, repsDone, fmtT, fmtVol, fmtKg, exoName } from "../../store/workout";

/** S17 · Détail d'une séance passée */
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history } = useWorkout();
  const insets = useSafeAreaInsets();
  const s = history.find((x) => x.id === id);
  if (!s) return <Page><Btn label="Retour" kind="secondary" onPress={() => router.back()} /></Page>;
  const d = new Date(s.startedAt);
  return (
    <Page pad={false}>
      <Media photo={s.photo as any} h={230} r={0}>
        <Shade />
        <Ov x={16} y={insets.top + 14} anchor="lt" style={{ right: 16, flexDirection: "row", justifyContent: "space-between" }}>
          <Circ icon="back" size={38} kind="glass" onPress={() => router.back()} />
          <View style={{ flexDirection: "row", gap: 8 }}><Circ icon="stats" size={38} kind="glass" onPress={() => router.push({ pathname: "/seance/comparer", params: { id: s.id } })} /><Circ icon="share" size={38} kind="glass" /></View>
        </Ov>
        <Ov x={16} y={14} anchor="lb">
          <OvText>{d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</OvText>
          <OvTitle size={28}>{s.name}</OvTitle>
          <OvText size={13} dim={0.85}>{fmtT((s.endedAt ?? s.startedAt) - s.startedAt)} · {s.exos.length} exercices</OvText>
        </Ov>
      </Media>
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Volume" v={fmtVol(volume(s))} /><KV k="Séries" v={String(setsDone(s))} /><KV k="Reps" v={String(repsDone(s))} /><KV k="Bravos" v="0" />
        </View>
        <Divider />
        {s.exos.map((e) => {
          const done = e.sets.filter((x) => x.done); if (!done.length) return null;
          const pr = done.some((x) => x.pr);
          return (
            <View key={e.exoId} style={{ gap: 4, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: inter(700), fontSize: 15, color: C.txt }}>{exoName(e.exoId)}{pr ? <Text style={{ color: C.green, fontSize: 11 }}>  PR</Text> : null}</Text>
                <Text style={{ fontFamily: man(700), fontSize: 14, color: C.txt }}>{fmtVol(done.reduce((a, x) => a + x.kg * x.reps, 0))}</Text>
              </View>
              <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{done.map((x) => `${fmtKg(x.kg)}×${x.reps}`).join(" · ")}</Text>
            </View>
          );
        })}
      </View>
    </Page>
  );
}
