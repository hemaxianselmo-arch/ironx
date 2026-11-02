import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Big, Sub, H2, AreaChart, Btn, KV, FRow, Progress, B, Logo, PerfB_Empty, PerfB_Thumb, perfB_date, PERFB_MOIS } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, STREET_MOVES, bestStreet, fmtStreet, StreetTest } from "../../store/activities";
import { useProfile } from "../../store/profile";

const PHOTO: Record<string, any> = { pullup: "photo-pullup", dips: "photo-chalk", pushup: "photo-burpees", muscleup: "photo-w-pullup", hspu: "photo-gym", pistol: "photo-w-squat", "pullup-w": "photo-pullup", "dips-w": "photo-chalk", frontlever: "photo-w-pullup", backlever: "photo-w-pullup", planche: "photo-gym", lsit: "photo-gym", handstand: "photo-gym", "human-flag": "photo-pullup" };
const FIGURES = [{ id: "frontlever", name: "Front lever" }, { id: "backlever", name: "Back lever" }, { id: "planche", name: "Planche" }, { id: "human-flag", name: "Drapeau" }];
const VARIANTS = ["tuck", "advanced tuck", "straddle", "full"];
const VAR_LABEL: Record<string, string> = { tuck: "Tuck", "advanced tuck": "Advanced tuck", straddle: "Straddle", full: "Full" };
const DAY = 86400e3;

/** R14 · Street workout : tests max, lesté (ratio poids de corps), isométries, figures */
export default function Street() {
  const { street } = useActivities(); const p = useProfile();
  const [tab, setTab] = useState(0); const [moveSel, setMoveSel] = useState<string | null>(null);
  const goTest = () => router.push("/perf/saisie-street");
  const kinds = ["reps", "kg", "sec"] as const;
  const moves = STREET_MOVES.filter((m) => m.kind === kinds[Math.min(tab, 2)]);
  const withData = moves.filter((m) => bestStreet(m.id));
  const move = STREET_MOVES.find((m) => m.id === moveSel && m.kind === kinds[Math.min(tab, 2)]) ?? withData[0] ?? moves[0];
  const hist = street.filter((t) => t.move === move.id).slice().sort((a, b) => a.at - b.at);
  const best = bestStreet(move.id); const lastT = hist[hist.length - 1];
  const threeMonths = hist.filter((t) => Date.now() - t.at >= 90 * DAY); const base = threeMonths.length ? Math.max(...threeMonths.map((t) => t.value)) : hist[0]?.value;
  const delta = best && base != null ? best.value - base : undefined;
  const prevOf = (m: string) => { const h = street.filter((t) => t.move === m); return h.length >= 2 ? h[0].value - h[1].value : undefined; };
  const fmtD = (m: string, d: number) => `${d >= 0 ? "+" : "−"}${Math.abs(Math.round(d * 10) / 10).toString().replace(".", ",")}${STREET_MOVES.find((x) => x.id === m)?.kind === "sec" ? " s" : STREET_MOVES.find((x) => x.id === m)?.kind === "kg" ? " kg" : ""}`;
  const unit = move.kind === "sec" ? "s" : move.kind === "kg" ? "kg" : "reps";
  const nextTest = lastT ? new Date(lastT.at + 30 * DAY) : undefined;
  const figureLevel = (id: string) => { const h = street.filter((t) => t.move === id); let lv = -1; h.forEach((t) => { const i = VARIANTS.indexOf((t.variant ?? "tuck").toLowerCase()); if (i > lv) lv = i; }); return { lv, best: bestStreet(id), n: h.length }; };
  const monthLbl = (t: StreetTest) => PERFB_MOIS[new Date(t.at).getMonth()];
  return (
    <Page>
      <Top left={<Pressable onPress={() => router.back()}><Logo name="autres" size={40} /></Pressable>} title="Street workout" sub={`poids de corps ${String(p.poids).replace(".", ",")} kg · ${street.length} test${street.length > 1 ? "s" : ""}`} right={<Circ icon="share" size={38} onPress={() => Share.share({ message: best ? `${move.name} : ${fmtStreet(move.id, best.value)} 💪 #IRONX` : "Mes tests street workout sur IRONX" })} />} />
      <Pills items={["Tests max", "Lesté", "Isométries", "Figures"]} on={tab} onChange={(i) => { setTab(i); setMoveSel(null); }} />
      {tab < 3 ? (!street.length ? (
        <PerfB_Empty title="Aucun test enregistré" text="Enregistre ton premier test max (tractions, dips, front lever…) pour suivre ta progression." action="Enregistrer un test" onPress={goTest} />
      ) : (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}>
              <Sub>{move.name.toLowerCase()} · {move.kind === "reps" ? "max reps" : move.kind === "kg" ? "charge max" : "tenue max"}</Sub>
              <Big v={best ? String(best.value).replace(".", ",") : "—"} unit={unit} size={52} />
              <Sub>{delta != null && hist.length > 1 ? <><Text style={{ fontFamily: inter(600), color: delta >= 0 ? C.green : C.red }}>{fmtD(move.id, delta)}</Text> {threeMonths.length ? "depuis 3 mois" : "depuis le premier test"} · </> : null}{lastT ? `test du ${perfB_date(lastT.at)}` : "pas encore testé"}</Sub>
            </View>
            {nextTest ? <KV k="Prochain test" v={perfB_date(nextTest.getTime())} align="flex-end" /> : null}
          </View>
          {hist.length >= 2 ? <AreaChart points={hist.map((t) => t.value)} h={110} /> : <Sub>Refais ce test dans 30 jours pour tracer ta courbe.</Sub>}
          {hist.length >= 2 ? <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{monthLbl(hist[0])}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{monthLbl(hist[hist.length - 1])}</Text></View> : null}

          {tab === 0 ? <H2 action="Historique">Mes tests max</H2> : null}
          {tab === 1 ? <H2>Lesté · ratio poids de corps</H2> : null}
          {tab === 2 ? <H2>Isométries · tenue max</H2> : null}
          {moves.map((m) => { const b = bestStreet(m.id); const d = prevOf(m.id); const ratio = m.kind === "kg" && b ? b.value / p.poids : 0; return (
            <FRow key={m.id} left={<PerfB_Thumb photo={PHOTO[m.id]} size={44} />} text={<B>{m.name}</B>} sub={m.kind === "kg" ? (b ? `× ${ratio.toFixed(2).replace(".", ",")} poids de corps${b.variant ? ` · ${b.variant}` : ""}` : "pas encore testé") : `${m.kind === "sec" ? "tenue max" : "max reps"}${b?.variant ? ` · ${b.variant}` : ""}${b ? ` · ${perfB_date(b.at)}` : ""}`}
              right={<View style={{ alignItems: "flex-end", gap: 2 }}>{b ? <Text style={{ fontFamily: man(700), fontSize: 17, color: move.id === m.id ? C.accent : C.txt }}>{m.kind === "kg" ? `+${String(b.value).replace(".", ",")}` : b.value}<Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}> {unitOf(m.kind)}</Text></Text> : <Text style={{ fontFamily: man(700), fontSize: 15, color: C.mut }}>—</Text>}{d != null ? <Text style={{ fontFamily: inter(700), fontSize: 11.5, color: d >= 0 ? C.green : C.red }}>{fmtD(m.id, d)}</Text> : null}</View>}
              onPress={() => setMoveSel(m.id)} />
          ); })}
          {tab === 1 && withData.length ? withData.map((m) => { const b = bestStreet(m.id)!; const ratio = b.value / p.poids; return (
            <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ width: 110, fontFamily: inter(500), fontSize: 13.5, color: C.txt }}>{m.name.replace(" lestées", "").replace(" lestés", "")} +kg</Text>
              <View style={{ flex: 1 }}><Progress pct={Math.min(100, ratio * 100)} /></View>
              <Text style={{ fontFamily: man(700), fontSize: 14, color: C.txt }}>+{String(b.value).replace(".", ",")}</Text>
              <Text style={{ width: 48, textAlign: "right", fontFamily: inter(400), fontSize: 11.5, color: C.mut }}>× {ratio.toFixed(2).replace(".", ",")}</Text>
            </View>
          ); }) : null}
          {tab === 1 ? <Sub>Barre pleine = 1 × ton poids de corps ({String(p.poids).replace(".", ",")} kg) en lest.</Sub> : null}
        </>
      )) : null}

      {tab === 3 ? (
        <>
          <H2>Figures</H2>
          {FIGURES.map((f) => { const { lv, best: b, n } = figureLevel(f.id); return (
            <View key={f.id} style={{ gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <PerfB_Thumb photo={PHOTO[f.id]} size={44} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: inter(700), fontSize: 14, color: C.txt }}>{f.name}</Text>
                  <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{lv >= 0 ? `${VAR_LABEL[VARIANTS[lv]]} atteint${b ? ` · ${b.value} s` : ""} · ${n} test${n > 1 ? "s" : ""}` : "pas encore testé"}</Text>
                </View>
                <Text style={{ fontFamily: man(700), fontSize: 15, color: lv >= 0 ? C.txt : C.mut }}>{lv >= 0 ? `${lv + 1}/4` : "—"}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {VARIANTS.map((v, i) => <View key={v} style={{ flex: 1, gap: 4 }}><View style={{ height: 5, borderRadius: 3, backgroundColor: i <= lv ? (i === lv ? C.accent : C.green) : "rgba(255,255,255,0.08)" }} /><Text style={{ fontFamily: inter(400), fontSize: 9.5, color: i <= lv ? C.soft : C.mut }}>{VAR_LABEL[v]}</Text></View>)}
              </View>
            </View>
          ); })}
          <Sub>Progression : tuck → advanced tuck → straddle → full. La variante vient de tes tests enregistrés.</Sub>
        </>
      ) : null}
      <Btn label="Enregistrer un test" icon="plus" onPress={goTest} />
    </Page>
  );
}
const unitOf = (k: string) => (k === "sec" ? "s" : k === "kg" ? "kg" : "reps");
