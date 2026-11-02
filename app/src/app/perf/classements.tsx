import React, { useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Big, Label, Sub, H2, AreaChart, Divider, PerfC_Demo, PerfC_Advice, PerfC_Empty, perfcKg, perfcNum, PERFC_MOIS } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, bestOf, volume, exoHistory } from "../../store/workout";
import { useProfile } from "../../store/profile";
import { useGym, MEMBERS } from "../../store/gym";
import { e1rm, PREVIOUS_BEST } from "../../data/seed";

const CRIT = ["Couché", "Squat", "Soulevé", "Total", "Volume"];
const IDS = ["bench", "squat", "deadlift"];

/** R03 · Mes classements — tes chiffres réels, classement de démonstration en attendant le serveur */
export default function Classements() {
  const { history } = useWorkout(); const p = useProfile(); const g = useGym(); const [crit, setCrit] = useState(0);
  const my1 = (id: string) => { const b = bestOf(id); return b ? e1rm(b.kg, b.reps) : 0; };
  const now = new Date(); const m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthVol = history.filter((s) => s.startedAt >= m0).reduce((a, s) => a + volume(s), 0);
  const mine = [my1("bench"), my1("squat"), my1("deadlift")]; const total = mine.reduce((a, b) => a + b, 0);
  const myV = crit < 3 ? mine[crit] : crit === 3 ? total : monthVol;
  const isVol = crit === 4; const bw = p.poids || 1;
  const memberV = (m: typeof MEMBERS[number]) => (crit < 3 ? [m.bench, m.squat, m.deadlift][crit] : crit === 3 ? m.bench + m.squat + m.deadlift : m.monthVol);
  const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const pool = [...MEMBERS.map((m) => ({ id: m.id, name: m.name, v: memberV(m), r: isVol ? memberV(m) : memberV(m) / m.bw })), { id: "me", name: "Toi", v: myV, r: isVol ? myV : myV / bw }];
  const sorted = [...pool].sort((a, b) => b.r - a.r);
  const myRank = sorted.findIndex((x) => x.id === "me") + 1; const above = sorted[myRank - 2];
  const fol = sorted.filter((x) => x.id === "me" || g.following.includes(x.id)); const folRank = fol.findIndex((x) => x.id === "me") + 1;
  const fmtV = (v: number) => (isVol ? `${perfcNum(v / 1000, 1)} t` : `${perfcKg(v)} kg`);
  // besoin pour passer devant : écart arrondi à 2,5 kg (ratio × ton poids) ou en tonnes
  const need = above ? (isVol ? above.v - myV : Math.max(2.5, Math.ceil((above.r * bw - myV) / 2.5) * 2.5)) : 0;
  const goal = isVol ? Math.ceil((myV * 1.05) / 100) * 100 : Math.ceil((myV * 1.05) / 2.5) * 2.5;

  // évolution de ta valeur : par séance (1RM est. cumulé) ou par mois (volume)
  const series = useMemo(() => {
    if (isVol) { const out: number[] = []; const lbl: string[] = []; for (let k = 5; k >= 0; k--) { const d = new Date(now.getFullYear(), now.getMonth() - k, 1); const e = new Date(d.getFullYear(), d.getMonth() + 1, 1); out.push(history.filter((s) => s.startedAt >= d.getTime() && s.startedAt < e.getTime()).reduce((a, s) => a + volume(s), 0)); lbl.push(PERFC_MOIS[d.getMonth()]); } return { pts: out, lbl, n: history.length }; }
    const ids = crit === 3 ? IDS : [IDS[crit]];
    const sessions = [...history].sort((a, b) => a.startedAt - b.startedAt).filter((s) => s.exos.some((e) => ids.includes(e.exoId) && e.sets.some((x) => x.done)));
    const best: Record<string, number> = {}; for (const id of ids) best[id] = Math.max(0, ...(PREVIOUS_BEST[id] ?? []).map((x) => e1rm(x.kg, x.reps)));
    const pts: number[] = []; const lbl: string[] = [];
    if (Object.values(best).some((v) => v > 0)) { pts.push(Object.values(best).reduce((a, b) => a + b, 0)); lbl.push("départ"); }
    for (const s of sessions) { for (const e of s.exos) if (ids.includes(e.exoId)) for (const x of e.sets) if (x.done && x.kg > 0) best[e.exoId] = Math.max(best[e.exoId], e1rm(x.kg, x.reps)); pts.push(Object.values(best).reduce((a, b) => a + b, 0)); lbl.push(`${new Date(s.startedAt).getDate()} ${PERFC_MOIS[new Date(s.startedAt).getMonth()]}`); }
    return { pts, lbl, n: sessions.length };
  }, [crit, history]);

  const share = () => Share.share({ message: `IRONX · ${CRIT[crit]} : ${fmtV(myV)}${isVol ? "" : ` (× ${perfcNum(myV / bw, 2)} poids de corps)`} — ${myRank}e de ma salle.` });
  const ratioTxt = isVol ? "volume du mois" : `× ${perfcNum(myV / bw, 2)} poids de corps`;
  const exoLbl = exoHistory(IDS[Math.min(crit, 2)]).length;

  return (
    <Page>
      <Top title="Mes classements" sub={`${p.sexe === 1 ? "Femmes" : "Hommes"} ~${Math.round(p.poids)} kg · ratio poids de corps`} onBack={() => router.back()} right={<Circ icon="share" size={38} onPress={share} />} />
      <Pills items={CRIT} on={crit} onChange={setCrit} />
      {myV > 0 ? (
        <View style={{ gap: 2 }}>
          <Label>{isVol ? "ton volume ce mois-ci" : crit === 3 ? "ton total SBD estimé" : "ton 1RM estimé"}</Label>
          <Big v={isVol ? perfcNum(myV / 1000, 1) : perfcKg(myV)} unit={isVol ? "t" : "kg"} size={50} />
          <Sub>{ratioTxt}</Sub>
        </View>
      ) : (
        <PerfC_Empty icon="trophy" title={isVol ? "Pas encore de volume ce mois-ci" : "Pas encore de performance"} text={isVol ? "Fais ta première séance du mois pour entrer dans le classement." : `Valide une série de ${CRIT[crit].toLowerCase()} pour obtenir ton 1RM estimé et ta place.`} cta="Lancer une séance" onPress={() => router.push("/(tabs)/seance")} />
      )}

      <RankLine title="Ma salle" sub={`${g.gymName} · ${pool.length} membres`} rank={myRank} total={pool.length} demo />
      <RankLine title="Abonnés" sub="ceux que tu suis" rank={folRank} total={fol.length} demo />
      <RankLine title="Bretagne" sub="région" />
      <RankLine title="France" sub="national" />
      <Sub>Classements réels à l'arrivée du serveur. En attendant, « Ma salle » et « Abonnés » sont une démonstration dans laquelle tes chiffres sont réels.</Sub>

      <H2>Pour monter</H2>
      {above ? (
        <PerfC_Advice icon="bolt" title={`${isVol ? `+${perfcNum(need / 1000, 1)} t` : `+${perfcKg(need)} kg`} et tu passes ${myRank - 1 === 1 ? "1er" : `${myRank - 1}e`} de ta salle`} text={`${above.name} · ${fmtV(above.v)}${isVol ? "" : ` · ratio ${perfcNum(above.r, 2)}`} · démo`} />
      ) : myV > 0 ? (
        <PerfC_Advice icon="trophy" color={C.orange} title="Tu es 1er de ta salle" text="Garde la place : vise un nouveau record ce mois-ci." />
      ) : null}
      {myV > 0 ? <PerfC_Advice icon="star" color={C.orange} title={`Objectif suggéré : ${fmtV(goal)}`} text={isVol ? "+5 % de volume le mois prochain, sans rajouter de séance." : "+5 % de 1RM estimé d'ici 8 semaines, à raison de +2,5 kg toutes les 2 semaines."} action="Objectif" onAction={() => router.push("/perf/objectifs")} /> : null}

      <H2>Évolution</H2>
      {series.pts.length >= 2 ? (
        <View style={{ gap: 6 }}>
          <AreaChart points={series.pts} h={110} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{series.lbl[0]}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{series.lbl[series.lbl.length - 1]}</Text>
          </View>
          <Sub>{isVol ? `Volume mensuel sur 6 mois · ${fmtV(series.pts[0])} → ${fmtV(series.pts[series.pts.length - 1])}` : `${CRIT[crit]} · ${fmtV(series.pts[0])} → ${fmtV(series.pts[series.pts.length - 1])} sur ${series.n} séance${series.n > 1 ? "s" : ""}`}</Sub>
        </View>
      ) : (
        <Sub>{isVol ? "L'évolution de ton volume apparaît après deux mois de séances." : `Fais ${exoLbl ? "encore une" : "deux"} séance${exoLbl ? "" : "s"} avec ce mouvement pour voir ton évolution.`}</Sub>
      )}
    </Page>
  );
}

function RankLine({ title, sub, rank, total, demo }: { title: string; sub: string; rank?: number; total?: number; demo?: boolean }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
        <View style={{ gap: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{title}</Text>{demo ? <PerfC_Demo /> : null}</View>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{sub}</Text>
        </View>
        {rank ? (
          <Text style={{ fontFamily: man(700), fontSize: 24, color: C.accent, letterSpacing: -0.5 }}>{rank === 1 ? "1er" : `${rank}e`}<Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut, letterSpacing: 0 }}> / {total}</Text></Text>
        ) : (
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut, textAlign: "right" }}>avec le serveur</Text>
        )}
      </View>
      <Divider />
    </View>
  );
}
