import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Avatar, RankRow, GOLD, SILVER, BRONZE, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useGym, MEMBERS, fmtT } from "../../store/gym";
import { useWorkout, volume, heaviest } from "../../store/workout";
import { useProfile } from "../../store/profile";
import { e1rm } from "../../data/seed";

/** G03 · Classements — toi inclus avec tes vraies valeurs */
export default function Classement() {
  const g = useGym(); const { history } = useWorkout(); const p = useProfile(); const [scope, setScope] = useState(0); const [crit, setCrit] = useState(0);
  const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const myWeek = history.filter((s) => Date.now() - s.startedAt < 7 * 86400e3);
  const my1 = (id: string) => { const h = heaviest(id); return h ? e1rm(h.kg, h.reps) : 0; };
  const me = { id: "me", ini, name: "Toi", bench: my1("bench"), squat: my1("squat"), deadlift: my1("deadlift"), bw: p.poids, weekVol: myWeek.reduce((a, s) => a + volume(s), 0), weekSessions: myWeek.length };
  const pool: any[] = [...(scope === 1 ? MEMBERS.filter((m) => g.following.includes(m.id)) : MEMBERS), me];
  const val = (m: any) => [m.bench, m.squat, m.deadlift, m.weekVol, m.weekSessions][crit];
  const ratio = crit < 3;
  const sorted: any[] = pool.map((m) => ({ ...m, v: val(m), r: ratio ? val(m) / m.bw : val(m) })).sort((a, b) => b.r - a.r);
  const fmt = (m: any) => (crit < 3 ? `${String(m.v).replace(".", ",")} kg` : crit === 3 ? fmtT(m.v) : `${m.v} séances`);
  const myRank = sorted.findIndex((m) => m.id === "me") + 1; const above = sorted[myRank - 2]; const meV = sorted[myRank - 1];
  const top3 = sorted.slice(0, 3); const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  return (
    <Page>
      <Top title="Classement" right={<Circ icon="share" size={38} />} onBack={() => router.back()} />
      <Pills items={["Ma salle", "Abonnés", "Région", "National"]} on={scope} onChange={(i) => setScope(Math.min(i, 1))} />
      <Pills items={["Couché", "Squat", "Soulevé", "Volume", "Assiduité"]} on={crit} onChange={setCrit} />
      <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{ratio ? "Ratio charge / poids de corps · 1RM estimé" : "Cette semaine"}{scope > 1 ? " · région et national avec le serveur" : ""}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 14, paddingTop: 10 }}>
        {order.map((m, i) => { const rank = sorted.indexOf(m) + 1; const big = rank === 1; return (
          <View key={m.id} style={{ alignItems: "center", gap: 6 }}>
            <Avatar ini={m.ini} size={big ? 68 : 56} ring /><Text style={{ fontFamily: inter(m.id === "me" ? 700 : 600), fontSize: 12, color: C.txt }}>{m.name}</Text><Text style={{ fontFamily: man(700), fontSize: big ? 18 : 16, color: m.id === "me" ? C.accent : C.txt }}>{fmt(m)}</Text>
            <View style={{ width: big ? 76 : 70, height: big ? 64 : rank === 2 ? 44 : 32, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: big ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: man(700), fontSize: big ? 18 : 15, color: [GOLD, SILVER, BRONZE][rank - 1] }}>{rank}</Text></View>
          </View>); })}
      </View>
      {sorted.slice(3).map((m) => <RankRow key={m.id} n={sorted.indexOf(m) + 1} ini={m.ini} name={m.name} val={fmt(m)} s={ratio ? `ratio ${m.r.toFixed(2).replace(".", ",")}` : m.discipline ?? "toi"} me={m.id === "me"} onPress={() => m.id !== "me" && router.push({ pathname: "/salle/membre", params: { id: m.id } })} />)}
      {above ? <Sub style={{ textAlign: "center" }}>{crit < 3 ? `+${Math.max(2.5, Math.ceil((above.r * me.bw - meV.v) / 2.5) * 2.5).toString().replace(".", ",")} kg et tu passes ${myRank - 1}e · devant toi : ${above.name}` : `Tu es ${myRank}e · devant toi : ${above.name} (${fmt(above)})`}</Sub> : <Sub style={{ textAlign: "center" }}>Tu es 1er, garde la place.</Sub>}
    </Page>
  );
}
