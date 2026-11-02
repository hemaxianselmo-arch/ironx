import React, { useMemo } from "react";
import { View, Text, Image, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Big, Label, Sub, H2, KV, Heatmap, Bars, PerfC_Empty, PerfC_BarRow, PerfC_Logo, perfcActivities, perfcMonday, perfcDayKey, PERFC_MOIS, PERFC_KIND_LABEL, PERFC_KIND_LOGO, PerfcActivity } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useWorkout } from "../../store/workout";
import { useActivities } from "../../store/activities";
import { useProfile } from "../../store/profile";

const W = 7 * 86400e3;
/** R18 · Régularité — série de semaines, carte de chaleur, par discipline, semaine type (toutes disciplines) */
export default function Regularite() {
  const { history } = useWorkout(); const a = useActivities(); const p = useProfile();
  const acts = useMemo(() => perfcActivities(history), [history, a.runs, a.hyrox, a.street, a.wods]);
  const now = Date.now(); const thisMonday = perfcMonday(now).getTime();
  const weekIdx = (t: number) => Math.floor((thisMonday - perfcMonday(t).getTime()) / W); // 0 = cette semaine
  const byWeek: Record<number, number> = {}; for (const x of acts) { const k = weekIdx(x.at); byWeek[k] = (byWeek[k] ?? 0) + 1; }
  // série en cours : semaines consécutives avec ≥ 1 activité, en partant de cette semaine (ou de la précédente si celle-ci est vide)
  let streak = 0; { let k = byWeek[0] ? 0 : 1; while (byWeek[k]) { streak++; k++; } }
  // record de série
  let record = 0; { const first = acts.length ? weekIdx(acts[acts.length - 1].at) : -1; let cur = 0; for (let k = first; k >= 0; k--) { if (byWeek[k]) { cur++; record = Math.max(record, cur); } else cur = 0; } }
  const thisWeek = byWeek[0] ?? 0;
  const days: Record<string, number> = {}; for (const x of acts) { const k = perfcDayKey(x.at); days[k] = (days[k] ?? 0) + 1; }
  const weeksSince = acts.length ? Math.min(52, weekIdx(acts[acts.length - 1].at) + 1) : 0;
  const last52 = acts.filter((x) => now - x.at < 52 * W).length;
  const perWeek = weeksSince ? last52 / weeksSince : 0;
  // jours planifiés ratés sur 8 semaines (jusqu'à hier)
  let missed = 0; { const start = thisMonday - 7 * W; for (let t = start; t < now - 86400e3 + 1; t += 86400e3) { const d = new Date(t); if (p.jours.includes((d.getDay() + 6) % 7) && !days[perfcDayKey(t)]) missed++; } }
  // plus longue pause (jours) sur 12 mois
  let pause = 0; { const ts = acts.filter((x) => now - x.at < 365 * 86400e3).map((x) => x.at).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) pause = Math.max(pause, Math.round((ts[i] - ts[i - 1]) / 86400e3)); if (ts.length) pause = Math.max(pause, Math.floor((now - ts[ts.length - 1]) / 86400e3)); }
  // par discipline 12 mois
  const disc: Partial<Record<PerfcActivity["kind"], number>> = {}; for (const x of acts) if (now - x.at < 365 * 86400e3) disc[x.kind] = (disc[x.kind] ?? 0) + 1;
  const discList = (Object.entries(disc) as [PerfcActivity["kind"], number][]).sort((x, y) => y[1] - x[1]); const discMax = discList[0]?.[1] ?? 1;
  // semaine type : activités par jour de semaine
  const dow = Array(7).fill(0) as number[]; for (const x of acts) dow[(new Date(x.at).getDay() + 6) % 7]++;
  const hm = (() => { const out: string[] = []; const start = thisMonday - 25 * W; for (let k = 0; k < 4; k++) { const d = new Date(start + Math.round((k * 25) / 3) * W); out.push(`${PERFC_MOIS[d.getMonth()]} ${d.getDate()}`); } return out; })();
  const share = () => Share.share({ message: `IRONX · ${streak} semaine${streak > 1 ? "s" : ""} d'entraînement d'affilée (record ${record}) · ${acts.length} activités · ${perWeek.toFixed(1).replace(".", ",")} séances / semaine.` });

  return (
    <Page>
      <Top title="Régularité" sub="12 mois · toutes disciplines" onBack={() => router.back()} right={<Circ icon="share" size={38} onPress={share} />} />
      {!acts.length ? <PerfC_Empty icon="cal" title="Ta régularité commence ici" text="Fais ta première séance ou ta première sortie : chaque semaine active allonge ta série." cta="Lancer une séance" onPress={() => router.push("/(tabs)/seance")} /> : null}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}>
          <Label>série en cours</Label>
          <Big v={String(streak)} unit={streak > 1 ? "semaines" : "semaine"} size={50} />
          <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>record : {record} semaine{record > 1 ? "s" : ""} · <Text style={{ fontFamily: inter(600), color: thisWeek ? C.green : C.mut }}>{thisWeek} séance{thisWeek > 1 ? "s" : ""}</Text> cette semaine</Text>
        </View>
        {streak >= 4 ? <Image source={IMG["badge-uniquepremierrecord"]} style={{ width: 64, height: 64 }} resizeMode="contain" /> : null}
      </View>
      <Heatmap days={days} weeks={26} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -8 }}>{hm.map((t, i) => <Text key={i} style={{ fontFamily: inter(400), fontSize: 10.5, color: C.mut }}>{t}</Text>)}<Text style={{ fontFamily: inter(400), fontSize: 10.5, color: C.mut }}>auj.</Text></View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <KV k="Séances" v={String(acts.length)} /><KV k="Par semaine" v={perWeek.toFixed(1).replace(".", ",")} align="center" /><KV k="Jours ratés" v={String(missed)} align="center" /><KV k="Plus longue pause" v={`${pause} j`} align="flex-end" />
      </View>
      <Sub>Jours ratés : jours prévus dans ton planning sans aucune activité, sur 8 semaines.</Sub>

      <H2 action="12 mois">Par discipline</H2>
      {discList.length ? discList.map(([k, n]) => <PerfC_BarRow key={k} left={<PerfC_Logo name={PERFC_KIND_LOGO[k]} />} label={PERFC_KIND_LABEL[k]} pct={(n / discMax) * 100} value={String(n)} />) : <Sub>Aucune activité sur 12 mois.</Sub>}

      <H2>Ta semaine type</H2>
      <Bars vals={dow.map((v) => v || 0.001)} labels={["L", "M", "M", "J", "V", "S", "D"]} h={100} hl={dow.indexOf(Math.max(...dow))} />
      <Sub>{acts.length ? `Tu t'entraînes surtout le ${["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][dow.indexOf(Math.max(...dow))]}${dow.filter((v) => !v).length ? ` · jamais le ${dow.map((v, i) => (v ? "" : ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][i])).filter(Boolean).join(", ")}` : ""}.` : "Ta répartition sur la semaine apparaîtra après tes premières séances."}</Sub>
    </Page>
  );
}
