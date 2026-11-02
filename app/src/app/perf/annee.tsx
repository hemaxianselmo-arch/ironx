import React, { useMemo } from "react";
import { View, Text, Image, ScrollView, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Btn, KV, PerfC_Thumb, perfcActivities, perfcKg, perfcTonnes, perfcMonday, perfcPhoto } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume } from "../../store/workout";
import { useActivities, hyroxTotal, fmtTime, fmtTimeLong, streetMove, fmtStreet, STREET_MOVES } from "../../store/activities";
import { byId, e1rm, PREVIOUS_BEST } from "../../data/seed";
import { ImgName } from "../../theme/images";

type Prog = { label: string; delta: string; photo: ImgName; gain: number };
/** R19 · Ton année — plein écran photo, chiffres de l'année, 3 plus grosses progressions, partage */
export default function Annee() {
  const insets = useSafeAreaInsets(); const { history } = useWorkout(); const a = useActivities();
  const year = new Date().getFullYear(); const y0 = new Date(year, 0, 1).getTime(); const inY = (t: number) => t >= y0;
  const sess = history.filter((s) => inY(s.startedAt)); const runs = a.runs.filter((r) => inY(r.at)); const course = runs.filter((r) => r.sport === "course"); const sims = a.hyrox.filter((h) => inY(h.at) && !h.partial); const tests = a.street.filter((t) => inY(t.at));
  const vol = sess.reduce((x, s) => x + volume(s), 0);
  const prs = sess.reduce((x, s) => x + s.exos.reduce((y, e) => y + e.sets.filter((z) => z.done && z.pr).length, 0), 0);
  const hours = (sess.reduce((x, s) => x + ((s.endedAt ?? s.startedAt) - s.startedAt), 0) / 1000 + runs.reduce((x, r) => x + r.duration, 0) + sims.reduce((x, h) => x + hyroxTotal(h), 0)) / 3600;
  const km = course.reduce((x, r) => x + r.distance, 0) / 1000;
  const bestSim = sims.length ? sims.reduce((x, h) => (hyroxTotal(h) < hyroxTotal(x) ? h : x)) : undefined;
  const acts = useMemo(() => perfcActivities(history).filter((x) => inY(x.at)), [history, a.runs, a.hyrox, a.street, a.wods]);
  const weeksActive = new Set(acts.map((x) => perfcMonday(x.at).getTime())).size; const weeksTotal = Math.max(1, Math.ceil((Date.now() - y0) / (7 * 86400e3)));
  // 3 plus grosses progressions : gain de 1RM est. (départ de l'année → meilleur), tests street, Hyrox
  const top3 = useMemo(() => {
    const out: Prog[] = []; const ids = new Set(sess.flatMap((s) => s.exos.map((e) => e.exoId)));
    for (const id of ids) {
      const before = [...(PREVIOUS_BEST[id] ?? []).map((b) => e1rm(b.kg, b.reps)), ...history.filter((h) => !inY(h.startedAt)).flatMap((h) => h.exos.filter((q) => q.exoId === id).flatMap((q) => q.sets.filter((z) => z.done).map((z) => e1rm(z.kg, z.reps))))];
      const inYear = [...sess].sort((x, z) => x.startedAt - z.startedAt).flatMap((h) => h.exos.filter((q) => q.exoId === id).flatMap((q) => q.sets.filter((z) => z.done && z.kg > 0).map((z) => e1rm(z.kg, z.reps))));
      if (!inYear.length) continue; const start = before.length ? Math.max(...before) : inYear[0]; const best = Math.max(...inYear); const gain = best - start;
      if (gain > 0) out.push({ label: byId(id)?.name ?? id, delta: `+${perfcKg(gain)} kg`, photo: perfcPhoto(byId(id)?.photo), gain: gain / Math.max(1, start) });
    }
    for (const m of STREET_MOVES) { const t = tests.filter((x) => x.move === m.id).sort((x, z) => x.at - z.at); if (t.length < 2) continue; const best = Math.max(...t.map((x) => x.value)); const gain = best - t[0].value; if (gain > 0) out.push({ label: `${m.name} max`, delta: `+${fmtStreet(m.id, gain).replace("+", "")}`, photo: "photo-pullup", gain: gain / Math.max(1, t[0].value) }); }
    if (sims.length >= 2) { const first = [...sims].sort((x, z) => x.at - z.at)[0]; const gain = hyroxTotal(first) - hyroxTotal(bestSim!); if (gain > 0) out.push({ label: "Hyrox", delta: `−${Math.round(gain / 60)} min`, photo: "photo-sled", gain: gain / hyroxTotal(first) }); }
    const c = course.filter((r) => r.distance >= 4900).sort((x, z) => x.at - z.at); if (c.length >= 2) { const t = (r: typeof c[number]) => r.duration * (5000 / r.distance); const gain = t(c[0]) - Math.min(...c.map(t)); if (gain > 0) out.push({ label: "5 km", delta: `−${fmtTime(gain)}`, photo: "photo-run", gain: gain / t(c[0]) }); }
    return out.sort((x, z) => z.gain - x.gain).slice(0, 3);
  }, [sess, tests, sims, course, history]);
  const empty = !acts.length;
  const txt = `IRONX · Mon année ${year}\n${sess.length} séances · ${perfcTonnes(vol)} tonnes · ${prs} records\n${Math.round(hours)} h d'entraînement${km ? ` · ${Math.round(km)} km courus` : ""}${bestSim ? ` · Hyrox ${fmtTime(hyroxTotal(bestSim))}` : ""}${top3.length ? `\nProgressions : ${top3.map((t) => `${t.label} ${t.delta}`).join(", ")}` : ""}`;
  const big = (s: string) => <Text style={{ fontFamily: man(700), fontSize: 34, letterSpacing: -1.2, lineHeight: 40, color: "#fff" }}>{s}</Text>;
  const regul = empty ? "Ta première séance de l'année écrit la première ligne de ce bilan." : `Tu t'es entraîné ${weeksActive} semaine${weeksActive > 1 ? "s" : ""} sur ${weeksTotal} cette année (${Math.round((weeksActive / weeksTotal) * 100)} %)${weeksActive / weeksTotal >= 0.75 ? " · une régularité de haut niveau." : weeksActive / weeksTotal >= 0.5 ? " · plus d'une semaine sur deux, continue." : "."}`;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Image source={IMG["photo-portrait"]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      <LinearGradient colors={["rgba(12,14,26,0.35)", "rgba(12,14,26,0.55)", "rgba(12,14,26,0.97)"]} locations={[0, 0.35, 0.72]} style={{ position: "absolute", inset: 0 } as any} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: Math.max(insets.bottom, 16) + 16, paddingHorizontal: 24, gap: 14, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Circ icon="x" size={38} kind="glass" onPress={() => router.back()} />
          <Image source={IMG["ironx-full"]} style={{ width: 120, height: 40 }} resizeMode="contain" />
        </View>
        <View style={{ flex: 1, minHeight: 90 }} />
        <Text style={{ fontFamily: inter(600), fontSize: 12, letterSpacing: 1.5, color: "rgba(255,255,255,0.8)" }}>TON ANNÉE {year}</Text>
        <View>
          {big(`${sess.length} séance${sess.length > 1 ? "s" : ""}.`)}
          {big(`${perfcTonnes(vol)} tonne${vol >= 2000 ? "s" : ""}.`)}
          {big(`${prs} record${prs > 1 ? "s" : ""}.`)}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
          <KV k="Heures" v={String(Math.round(hours))} /><KV k="Km courus" v={String(Math.round(km))} align="center" /><KV k="Hyrox" v={bestSim ? fmtTime(hyroxTotal(bestSim)) : "—"} align="center" /><KV k="Badges" v={String(prs)} align="flex-end" />
        </View>
        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Tes 3 plus grosses progressions</Text>
        {top3.length ? top3.map((t) => (
          <View key={t.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <PerfC_Thumb photo={t.photo} size={40} r={10} />
            <Text style={{ flex: 1, fontFamily: inter(600), fontSize: 15, color: "#fff" }}>{t.label}</Text>
            <Text style={{ fontFamily: man(700), fontSize: 17, color: C.green }}>{t.delta}</Text>
          </View>
        )) : <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{empty ? "Elles apparaîtront après tes premières séances." : "Bats un de tes records pour voir tes progressions ici."}</Text>}
        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        <Text style={{ fontFamily: inter(400), fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.8)" }}>{regul}{hours ? ` ${fmtTimeLong(hours * 3600)} d'entraînement au total.` : ""}</Text>
        <View style={{ flexDirection: "row", gap: 10, paddingTop: 8 }}>
          <View style={{ flex: 1 }}><Btn label="Partager en story" kind="white" icon="share" onPress={() => router.push("/fil/story-creer")} /></View>
          <Circ icon="copy" size={54} kind="glass" onPress={() => Share.share({ message: txt })} />
        </View>
      </ScrollView>
    </View>
  );
}
