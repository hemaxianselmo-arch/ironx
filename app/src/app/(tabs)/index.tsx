import React from "react";
import { View, Text, Pressable } from "react-native";
import { Page, Between, Actions, Avatar, Circ, Label, Big, Sub, B, Surf, Row, Ring, H2, Media, Shade, Ov, OvText, OvTitle, Btn, FRow, Mono } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { router } from "expo-router";
import { useWorkout, actions, volume } from "../../store/workout";
import { PUSH } from "../../data/seed";
import { useProfile, macros, weekPlan, suggestProgram } from "../../store/profile";
import { useNutrition, dayTotals, burnedToday } from "../../store/nutrition";
import { useActivities, readiness } from "../../store/activities";

/** V3 · Accueil */
export default function Accueil() {
  const { active, history } = useWorkout(); useActivities(); const forme = readiness();
  const p = useProfile(); const m = macros(p); const nu = useNutrition(); const eaten = dayTotals(); const kcalLeft = m.kcal + nu.kcalAdjust + burnedToday(history) - eaten.kcal; const prog = suggestProgram(p); const week = weekPlan(p);
  const today = (new Date().getDay() + 6) % 7; const todayName = week[today][1]; const next = week.find((w, i) => i >= today && w[1])?.[1] ?? week.find((w) => w[1])?.[1] ?? "Séance";
  const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const now = Date.now(); const wk = history.filter((s) => now - s.startedAt < 7 * 86400e3); const prev = history.filter((s) => now - s.startedAt >= 7 * 86400e3 && now - s.startedAt < 14 * 86400e3);
  const wkVol = wk.reduce((a, s) => a + volume(s), 0); const prevVol = prev.reduce((a, s) => a + volume(s), 0);
  const wkPR = wk.reduce((a, s) => a + s.exos.reduce((b, e) => b + e.sets.filter((x) => x.pr).length, 0), 0);
  const delta = prevVol > 0 ? Math.round(((wkVol - prevVol) / prevVol) * 100) : null;
  const start = () => { if (!active) actions.start(PUSH); router.push("/seance/encours"); };
  return (
    <Page hero withNav>
      <Between>
        <Pressable onPress={() => router.push("/profil")}><Avatar ini={ini} size={40} ring /></Pressable>
        <Actions>
          <Circ icon="search" size={40} kind="glass" />
          <Circ icon="bell" size={40} kind="glass" />
        </Actions>
      </Between>

      <View style={{ alignItems: "center", gap: 4, paddingTop: 6, paddingBottom: 2 }}>
        <Label>Cette semaine · volume soulevé</Label>
        <Big v={Math.round(wkVol).toLocaleString("fr-FR").replace(/\u202f/g, " ")} unit="kg" size={60} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
          {wk.length} séance{wk.length > 1 ? "s" : ""} · {wkPR} record{wkPR > 1 ? "s" : ""}{delta !== null ? <> · <Text style={{ fontFamily: inter(600), color: delta >= 0 ? C.green : C.red }}>{delta >= 0 ? "+" : ""}{delta} %</Text> vs semaine passée</> : wk.length === 0 ? " · lance ta première séance" : ""}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 4 }}>
        <Circ icon="play" size={56} kind="white" label="Séance" onPress={start} />
        <Circ icon="plus" size={56} kind="glass" label="Repas" onPress={() => router.push({ pathname: "/nutrition/ajouter", params: { meal: new Date().getHours() < 11 ? "petitdej" : new Date().getHours() < 15 ? "dejeuner" : new Date().getHours() < 19 ? "collation" : "diner" } })} />
        <Circ icon="cam" size={56} kind="glass" label="Story" />
        <Circ icon="stats" size={56} kind="glass" label="Poids" />
      </View>

      <Surf pad={14}>
        <Row gap={14}>
          <Ring pct={Math.min(100, (eaten.kcal / (m.kcal + nu.kcalAdjust)) * 100)} size={64} thick={7}><Mono size={15}>{Math.abs(kcalLeft).toLocaleString("fr-FR")}</Mono></Ring>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{Math.abs(kcalLeft).toLocaleString("fr-FR")} kcal {kcalLeft < 0 ? "en trop" : "restantes"}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>P {Math.round(eaten.p)} / {m.prot} · G {Math.round(eaten.g)} / {m.gluc} · L {Math.round(eaten.l)} / {m.lip}</Text>
          </View>
          <Circ icon="chev" size={32} onPress={() => router.push("/(tabs)/nutrition")} />
        </Row>
      </Surf>

      <H2>{todayName ? "Aujourd'hui" : "Prochaine séance"}</H2>
      <Media photo="photo-deadlift" h={150}>
        <Shade />
        <Ov x={14} y={12} anchor="lb">
          <OvText>{prog.name}</OvText>
          <OvTitle>{todayName || next} · ~{[45, 60, 90, 120][p.duree]} min</OvTitle>
          <OvText dim={0.75}>Développé couché · Incliné · Dips · Élévations</OvText>
        </Ov>
        <Ov x={14} y={14} anchor="rb"><Btn label="Lancer" kind="white" icon="play" size="sm" full={false} onPress={start} /></Ov>
      </Media>
      <Surf pad={14}>
        <Row gap={14}>
          <Ring pct={forme.score} size={56} thick={6} color={forme.score >= 60 ? C.green : forme.score >= 40 ? C.orange : C.red}><Mono size={15}>{forme.score}</Mono></Ring>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Forme du jour · {forme.score >= 80 ? "prêt à performer" : forme.score >= 60 ? "en forme" : forme.score >= 40 ? "fatigué" : "à ménager"}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }} numberOfLines={2}>{forme.tips[0]}</Text>
          </View>
          <Circ icon="chev" size={32} onPress={() => router.push("/perf/forme")} />
        </Row>
      </Surf>

      <H2 action="Voir tout">Ta salle</H2>
      <FRow left={<Avatar ini="KM" size={44} ring />} text={<><B>kevin.m</B> vient de battre son record au squat</>} right={<Mono size={15}>150 kg</Mono>} sub="il y a 1 h · [NOM DE LA SALLE]" />
      <FRow left={<Avatar ini="JB" size={44} ring />} text={<><B>julie.b</B> et 3 membres sont en séance maintenant</>} right={<Circ icon="chev" size={32} />} sub="Hyrox · depuis 18 min" />
    </Page>
  );
}
