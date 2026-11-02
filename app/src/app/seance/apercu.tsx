import React from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Media, Shade, Ov, OvText, OvTitle, Circ, KV, Divider, Btn, ExoThumb } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLibrary, getTemplate, lib } from "../../store/library";
import { useWorkout, actions, fmtKg, fmtVol } from "../../store/workout";
import { byId } from "../../data/seed";

/** Aperçu d'une séance type avant de la lancer */
export default function Apercu() {
  const { id } = useLocalSearchParams<{ id: string }>(); const insets = useSafeAreaInsets();
  useLibrary(); const { active } = useWorkout();
  const t = getTemplate(id!); if (!t) return <Page><Btn label="Retour" kind="secondary" onPress={() => router.back()} /></Page>;
  const vol = t.exos.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.kg * s.reps, 0), 0); const sets = t.exos.reduce((a, e) => a + e.sets.length, 0);
  return (
    <Page pad={false}>
      <Media photo={t.photo as any} h={230} r={0}>
        <Shade />
        <Ov x={16} y={insets.top + 14} anchor="lt" style={{ right: 16, flexDirection: "row", justifyContent: "space-between" }}>
          <Circ icon="back" size={38} kind="glass" onPress={() => router.back()} />
          <View style={{ flexDirection: "row", gap: 8 }}><Circ icon="edit" size={38} kind="glass" onPress={() => router.push({ pathname: "/seance/editeur", params: { id: t.id } })} />{t.custom ? <Circ icon="x" size={38} kind="glass" onPress={() => { lib.deleteTemplate(t.id); router.back(); }} /> : null}</View>
        </Ov>
        <Ov x={16} y={14} anchor="lb"><OvText>{t.program} · {t.level}</OvText><OvTitle size={28}>{t.name}</OvTitle><OvText size={13} dim={0.85}>{t.exos.length} exercices · ~{t.minutes} min</OvText></Ov>
      </Media>
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}><KV k="Volume prévu" v={fmtVol(vol)} /><KV k="Séries" v={String(sets)} /><KV k="Exercices" v={String(t.exos.length)} /><KV k="Durée" v={`~${t.minutes} min`} /></View>
        <Divider />
        {t.exos.map((e, i) => { const d = byId(e.exoId); return (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <ExoThumb hl={d.hl} view={d.view} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: inter(700), fontSize: 15, color: C.txt }}>{i + 1} · {d.name}{e.note ? <Text style={{ fontFamily: inter(400), color: C.mut }}>  {e.note}</Text> : null}</Text>
              <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{e.sets.map((s) => `${s.kg ? fmtKg(s.kg) + "×" : ""}${s.reps}`).join(" · ")} · repos {Math.floor(e.rest / 60)}:{String(e.rest % 60).padStart(2, "0")}</Text>
            </View>
          </View>); })}
        <Btn label={active ? "Une séance est déjà en cours" : "Démarrer cette séance"} icon="play" kind={active ? "secondary" : "primary"} onPress={() => { if (!active) actions.start(t); router.push("/seance/encours"); }} />
      </View>
    </Page>
  );
}
