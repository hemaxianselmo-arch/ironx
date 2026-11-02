import React from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Label, Ring, KV, H2, RankRow, FRow, Sub } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { MEMBERS, fmtT, CHALLENGE } from "../../store/gym";
import { useWorkout, volume } from "../../store/workout";
import { useProfile } from "../../store/profile";

/** G04 · Défi collectif */
export default function Defi() {
  const { history } = useWorkout(); const p = useProfile(); const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const month = history.filter((s) => new Date(s.startedAt).getMonth() === new Date().getMonth());
  const myMonth = month.reduce((a, s) => a + volume(s), 0); const myWeek = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3).reduce((a, s) => a + volume(s), 0);
  const today = history.filter((s) => new Date(s.startedAt).toDateString() === new Date().toDateString()).reduce((a, s) => a + volume(s), 0);
  const total = CHALLENGE.base + myMonth; const pct = Math.min(100, (total / CHALLENGE.goal) * 100);
  const rows = [...MEMBERS.map((m) => ({ id: m.id, ini: m.ini, name: m.name, v: m.monthVol, s: `${m.weekSessions * 3} séances` })), { id: "me", ini, name: "Toi", v: myMonth, s: `${month.length} séance${month.length > 1 ? "s" : ""} · +${fmtT(myWeek)} cette semaine` }].sort((a, b) => b.v - a.v);
  const myRank = rows.findIndex((r) => r.id === "me") + 1; const perDay = (total - CHALLENGE.base * 0.85) / 18; const daysLeft = perDay > 0 ? Math.ceil((CHALLENGE.goal - total) / perDay) : 99;
  return (
    <Page hero>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Défi collectif · J-{CHALLENGE.endsIn}</Text><Circ icon="share" size={38} kind="glass" /></View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Label>{CHALLENGE.name} · ce mois</Label>
        <Ring pct={pct} size={150} thick={12} color="#fff"><Text style={{ fontFamily: man(700), fontSize: 38, letterSpacing: -1.5, color: C.txt }}>{Math.round(pct)} %</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{fmtT(total)} / {fmtT(CHALLENGE.goal)}</Text></Ring>
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>{daysLeft <= CHALLENGE.endsIn ? `Rythme actuel : objectif atteint dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}, ${CHALLENGE.endsIn - daysLeft} jour${CHALLENGE.endsIn - daysLeft > 1 ? "s" : ""} d'avance` : "Il faut accélérer pour atteindre l'objectif à temps"}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}><KV k="Ta part" v={fmtT(myMonth)} /><KV k="Rang" v={`${myRank}e`} /><KV k="Participants" v={String(CHALLENGE.participants)} /><KV k="Aujourd'hui" v={`+${fmtT(today)}`} /></View>
      <H2 action="Tout">Contributions</H2>
      {rows.slice(0, 6).map((r) => <RankRow key={r.id} n={rows.indexOf(r) + 1} ini={r.ini} name={r.name} val={fmtT(r.v)} s={r.s} me={r.id === "me"} />)}
      {myRank > 6 ? <RankRow n={myRank} ini={ini} name="Toi" val={fmtT(myMonth)} s={rows[myRank - 1].s} me /> : null}
      <FRow left={<Image source={IMG["record"]} style={{ width: 40, height: 40 }} resizeMode="contain" />} text="Badge « 1 000 t · Novembre » pour tous les participants" sub="à la réussite du défi" />
      <Sub>Chaque série validée dans IRONX compte automatiquement.</Sub>
    </Page>
  );
}
