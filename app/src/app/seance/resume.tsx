import React from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Label, Big, KV, Media, Shade, Ov, OvText, Btn, Figure, FRow, B } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume, setsDone, repsDone, fmtT, fmtVol, fmtKg, exoName } from "../../store/workout";
import { byId } from "../../data/seed";

/** S11 · Résumé de séance */
export default function Resume() {
  const { history } = useWorkout();
  const s = history[0];
  if (!s) return <Page><Btn label="Retour" kind="secondary" onPress={() => router.replace("/(tabs)/seance")} /></Page>;
  const prs = s.exos.flatMap((e) => e.sets.filter((x) => x.pr).map((x) => ({ exoId: e.exoId, ...x })));
  const hl: Record<string, number> = {};
  for (const e of s.exos) for (const [g, v] of Object.entries(byId(e.exoId).hl)) hl[g] = Math.max(hl[g] ?? 0, v);
  const prev = history[1];
  const dv = prev && volume(prev) ? Math.round(((volume(s) - volume(prev)) / volume(prev)) * 100) : null;
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="x" size={38} kind="glass" onPress={() => router.replace("/(tabs)/seance")} />
        <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Séance terminée</Text>
        <Circ icon="share" size={38} kind="white" />
      </View>
      <View style={{ alignItems: "center", gap: 4, paddingVertical: 4 }}>
        <Label>{s.name} · {fmtT((s.endedAt ?? Date.now()) - s.startedAt)}</Label>
        <Big v={Math.round(volume(s)).toLocaleString("fr-FR")} unit="kg" size={56} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
          {dv != null ? <><Text style={{ fontFamily: inter(600), color: dv >= 0 ? C.green : C.red }}>{dv >= 0 ? "+" : ""}{dv} %</Text> vs la dernière fois · </> : null}{prs.length} record{prs.length > 1 ? "s" : ""}
        </Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Séries" v={String(setsDone(s))} /><KV k="Reps" v={String(repsDone(s))} /><KV k="Calories" v={String(Math.round(setsDone(s) * 26))} /><KV k="Exercices" v={String(s.exos.length)} />
      </View>
      <Media photo="photo-squat" h={150}>
        <Shade />
        <Ov x={14} y={12} anchor="lb"><OvText>Ajoute une photo ou une vidéo</OvText><Text style={{ fontFamily: man(700), fontSize: 18, color: "#fff" }}>Partage ta séance</Text></Ov>
        <Ov x={12} y={12} anchor="rt"><Circ icon="cam" size={40} kind="glass" /></Ov>
      </Media>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Figure view="front" hl={hl} h={130} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ fontFamily: inter(700), fontSize: 13, color: C.mut }}>{prs.length ? "Records" : "Muscles travaillés"}</Text>
          {prs.slice(0, 3).map((p, i) => <FRow key={i} left={<Image source={IMG["record"]} style={{ width: 32, height: 32 }} resizeMode="contain" />} text={<B>{exoName(p.exoId)}</B>} sub={`${fmtKg(p.kg)} × ${p.reps}`} />)}
          {!prs.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Pas de record aujourd'hui, le volume compte aussi.</Text> : null}
        </View>
      </View>
      <Btn label="Publier dans le fil" icon="share" onPress={() => router.replace("/(tabs)/seance")} />
    </Page>
  );
}
