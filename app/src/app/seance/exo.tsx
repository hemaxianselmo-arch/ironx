import React, { useState } from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Actions, Circ, Figure, KV, Tabs, Btn, FRow, Mono, Icon } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { byId, e1rm } from "../../data/seed";
import { EXO_BY_ID, EXERCISES } from "../../data/exercises";
import { useLibrary, lib } from "../../store/library";
import { useWorkout, bestOf, heaviest, fmtKg, exoHistory, addExoToActive, startFromExos } from "../../store/workout";
import { ExoRow } from "./bibliotheque";

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
/** S03 · Fiche exercice : muscles sur la figure, stats, technique / variantes / historique */
export default function Exo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites } = useLibrary(); const { active } = useWorkout();
  const [tab, setTab] = useState(0);
  const e = byId(id!); if (!e) return <Page><Btn label="Retour" kind="secondary" onPress={() => router.back()} /></Page>;
  const best = bestOf(e.id); const hist = exoHistory(e.id); const last = hist[0];
  const variants = (e.variants ?? EXERCISES.filter((x) => x.group === e.group && x.id !== e.id).slice(0, 6).map((x) => x.id)).map((v) => EXO_BY_ID[v]).filter(Boolean);
  const fav = favorites.includes(e.id);
  return (
    <Page>
      <Top title={e.name} sub={`${e.group} · ${e.equip}${e.custom ? " · créé par toi" : ""}`} onBack={() => router.back()}
        right={<Actions><Circ icon="star" size={38} kind={fav ? "primary" : "secondary"} onPress={() => lib.toggleFav(e.id)} /><Circ icon="share" size={38} /></Actions>} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 4, borderRadius: 22, backgroundColor: C.surf }}>
        <Figure view="front" hl={e.view === "front" ? e.hl : (e.hlBack ?? {})} h={230} />
        <Figure view="back" hl={e.view === "back" ? e.hl : (e.hlBack ?? {})} h={230} />
      </View>
      <View style={{ flexDirection: "row", gap: 18 }}>
        <View style={{ gap: 2 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Principal</Text><Text style={{ fontFamily: inter(700), fontSize: 15, color: C.accent }}>{e.primary}</Text></View>
        {e.secondary ? <View style={{ gap: 2, flex: 1 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Secondaires</Text><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{e.secondary}</Text></View> : null}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Record" v={heaviest(e.id) ? `${fmtKg(heaviest(e.id)!.kg)} × ${heaviest(e.id)!.reps}` : "—"} />
        <KV k="1RM estimé" v={best && best.kg ? `${fmtKg(e1rm(best.kg, best.reps))} kg` : "—"} />
        <KV k="Dernière fois" v={last ? `${fmtKg(last.sets[0].kg)} × ${last.sets[0].reps}` : "—"} />
        <KV k="Séances" v={String(hist.length)} />
      </View>
      <Tabs items={["Technique", "Variantes", "Historique"]} on={tab} onChange={setTab} />
      {tab === 0 ? e.steps.map((t, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 12, paddingVertical: 8 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: inter(700), fontSize: 12, color: C.txt }}>{i + 1}</Text></View>
          <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, lineHeight: 20, color: C.soft }}>{t}</Text>
        </View>
      )) : null}
      {tab === 1 ? (variants.length ? variants.map((v) => <ExoRow key={v.id} e={v} onPress={() => router.push({ pathname: "/seance/exo", params: { id: v.id } })} />) : <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Pas de variante référencée.</Text>) : null}
      {tab === 2 ? (hist.length ? hist.slice(0, 8).map((h, i) => { const d = new Date(h.session.startedAt); const pr = h.sets.some((x) => x.pr); return (
        <FRow key={i} left={<View style={{ width: 44, alignItems: "center" }}><Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{d.getDate()}</Text><Text style={{ fontFamily: inter(400), fontSize: 10, color: C.mut }}>{MOIS[d.getMonth()]}</Text></View>}
          text={<Text style={{ fontFamily: inter(700), color: C.txt }}>{h.sets.map((x) => `${fmtKg(x.kg)} × ${x.reps}`).join(" · ")}</Text>} right={pr ? <Text style={{ fontFamily: inter(700), fontSize: 12, color: C.green }}>PR</Text> : undefined} sub={`${h.session.name} · ${h.sets.length} séries · ${fmtKg(Math.round(h.sets.reduce((a, x) => a + x.kg * x.reps, 0)))} kg`} />); })
        : <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Tu n'as pas encore fait cet exercice dans IRONX.</Text>) : null}
      <View style={{ flexDirection: "row", gap: 8, paddingTop: 6 }}>
        <View style={{ flex: 1 }}><Btn label="Progression" kind="secondary" icon="stats" size="md" onPress={() => router.push({ pathname: "/seance/progression", params: { id: e.id } })} /></View>
        <View style={{ flex: 1 }}><Btn label={active ? "Ajouter à la séance" : "Démarrer avec"} icon="plus" size="md" onPress={() => { if (active) { addExoToActive(e); router.push("/seance/encours"); } else { startFromExos(e.name, [{ exo: e }]); router.push("/seance/encours"); } }} /></View>
      </View>
    </Page>
  );
}
