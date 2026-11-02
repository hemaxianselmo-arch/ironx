import React, { useMemo, useState } from "react";
import { View, Text, Share, Image } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Pills, Big, Label, Sub, H2, KV, Media, Shade, Ov, OvText, OvTitle, Btn, FRow, B, PerfC_Hero, PerfC_HeroTop, PerfC_Body, PerfC_Empty, PerfC_Thumb, PerfC_Delta, perfcPhoto, perfcDate, perfcKg, perfcNum, perfcTonnes, PERFC_MOIS_LONG } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, volume, setsDone, Session } from "../../store/workout";
import { useProfile } from "../../store/profile";
import { useActivities, hyroxTotal, fmtTime, fmtTimeLong, fmtKm, fmtPace, pace, fmtStreet, streetMove } from "../../store/activities";
import { byId, e1rm, PREVIOUS_BEST } from "../../data/seed";

const mk = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** R09 · Rapport du mois — tout est calculé depuis ton historique (séances, course, Hyrox, street) */
export default function Rapport() {
  const { history } = useWorkout(); const a = useActivities(); const p = useProfile();
  const months = useMemo(() => { const s = new Set<string>([mk(Date.now())]); for (const x of history) s.add(mk(x.startedAt)); for (const r of a.runs) s.add(mk(r.at)); for (const h of a.hyrox) s.add(mk(h.at)); for (const t of a.street) s.add(mk(t.at)); return [...s].sort().reverse(); }, [history, a.runs, a.hyrox, a.street]);
  const [mi, setMi] = useState(0); const key = months[mi] ?? months[0];
  const [y, m] = key.split("-").map(Number); const start = new Date(y, m - 1, 1).getTime(), end = new Date(y, m, 1).getTime(); const pStart = new Date(y, m - 2, 1).getTime();
  const inM = (t: number) => t >= start && t < end; const inP = (t: number) => t >= pStart && t < start;
  const sess = history.filter((s) => inM(s.startedAt)); const prev = history.filter((s) => inP(s.startedAt));
  const vol = sess.reduce((x, s) => x + volume(s), 0); const pv = prev.reduce((x, s) => x + volume(s), 0);
  const sets = sess.reduce((x, s) => x + setsDone(s), 0);
  const runs = a.runs.filter((r) => inM(r.at)); const course = runs.filter((r) => r.sport === "course"); const sims = a.hyrox.filter((h) => inM(h.at)); const tests = a.street.filter((t) => inM(t.at));
  const dur = sess.reduce((x, s) => x + ((s.endedAt ?? s.startedAt) - s.startedAt), 0) / 1000 + runs.reduce((x, r) => x + r.duration, 0) + sims.reduce((x, h) => x + hyroxTotal(h), 0);
  const kcal = Math.round(sets * 26 + runs.reduce((x, r) => x + (r.distance / 1000) * (p.poids || 75), 0));
  const daysIn = Math.min(new Date(y, m, 0).getDate(), Math.max(1, Math.ceil((Math.min(Date.now(), end) - start) / 86400e3)));
  const planned = Math.max(1, Math.round((p.seances || 3) * (daysIn / 7)));
  const done = sess.length + course.length + sims.length; const assid = Math.min(100, Math.round((done / planned) * 100));
  // records du mois : séries marquées pr, delta vs meilleur 1RM est. connu avant la séance
  const prs = useMemo(() => {
    const out: { s: Session; exoId: string; kg: number; reps: number; delta: number }[] = [];
    for (const s of [...sess].sort((x, z) => x.startedAt - z.startedAt)) for (const e of s.exos) for (const x of e.sets) if (x.done && x.pr) {
      const before = [...(PREVIOUS_BEST[e.exoId] ?? []).map((b) => e1rm(b.kg, b.reps)), ...history.filter((h) => h.startedAt < s.startedAt).flatMap((h) => h.exos.filter((q) => q.exoId === e.exoId).flatMap((q) => q.sets.filter((z) => z.done).map((z) => e1rm(z.kg, z.reps))))];
      const prevBest = before.length ? Math.max(...before) : 0; out.push({ s, exoId: e.exoId, kg: x.kg, reps: x.reps, delta: prevBest ? e1rm(x.kg, x.reps) - prevBest : 0 });
    }
    // un seul record par exercice (le meilleur)
    const best: Record<string, typeof out[number]> = {}; for (const r of out) if (!best[r.exoId] || e1rm(r.kg, r.reps) > e1rm(best[r.exoId].kg, best[r.exoId].reps)) best[r.exoId] = r;
    return Object.values(best).sort((x, z) => z.s.startedAt - x.s.startedAt);
  }, [sess, history]);
  const top = sess.length ? sess.reduce((x, s) => (volume(s) > volume(x) ? s : x)) : undefined;
  const topPr = top ? top.exos.reduce((x, e) => x + e.sets.filter((z) => z.pr && z.done).length, 0) : 0;
  const title = `${cap(PERFC_MOIS_LONG[m - 1])} ${y}`; const prevName = PERFC_MOIS_LONG[(m + 10) % 12];
  const bestSim = sims.length ? sims.filter((h) => !h.partial).reduce((x, h) => (!x || hyroxTotal(h) < hyroxTotal(x) ? h : x), undefined as typeof sims[number] | undefined) : undefined;
  const km = course.reduce((x, r) => x + r.distance, 0);
  const empty = !sess.length && !runs.length && !sims.length && !tests.length;
  const share = () => Share.share({ message: `IRONX · Rapport ${title}\n${perfcTonnes(vol)} t soulevées · ${sess.length} séance${sess.length > 1 ? "s" : ""} · ${prs.length} record${prs.length > 1 ? "s" : ""}${km ? ` · ${fmtKm(km)} courus` : ""}${bestSim ? ` · Hyrox ${fmtTime(hyroxTotal(bestSim))}` : ""}\nDurée ${fmtTimeLong(dur)} · ${sets} séries · ~${kcal.toLocaleString("fr-FR")} kcal · assiduité ${assid} %` });

  return (
    <Page pad={false}>
      <PerfC_Hero>
        <PerfC_HeroTop title={title} left={<Circ icon="back" size={38} kind="glass" onPress={() => router.back()} />} right={<Circ icon="share" size={38} kind="glass" onPress={share} />} />
        <View style={{ alignItems: "center", gap: 4 }}>
          <Text style={{ fontFamily: inter(400), fontSize: 12, color: "rgba(255,255,255,0.8)" }}>volume du mois</Text>
          <Big v={perfcTonnes(vol)} unit="t" size={60} />
          <Text style={{ fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
            {pv ? <><Text style={{ fontFamily: inter(600), color: vol >= pv ? C.green : C.red }}>{vol >= pv ? "+" : "−"}{Math.abs(Math.round(((vol - pv) / pv) * 100))} %</Text> vs {prevName} · </> : null}{sess.length} séance{sess.length > 1 ? "s" : ""} · {prs.length} record{prs.length > 1 ? "s" : ""}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Durée" v={fmtTimeLong(dur)} /><KV k="Séries" v={String(sets)} align="center" /><KV k="Calories" v={kcal.toLocaleString("fr-FR")} align="center" /><KV k="Assiduité" v={`${assid} %`} align="flex-end" />
        </View>
      </PerfC_Hero>
      <PerfC_Body>
        {months.length > 1 ? <Pills items={months.map((k) => { const [yy, mm] = k.split("-").map(Number); return `${cap(PERFC_MOIS_LONG[mm - 1])} ${yy}`; })} on={mi} onChange={setMi} /> : null}
        {empty ? <PerfC_Empty icon="cal" title="Rien ce mois-ci" text="Fais ta première séance ou ta première sortie du mois pour remplir ton rapport." cta="Lancer une séance" onPress={() => router.push("/(tabs)/seance")} /> : null}

        {top ? (
          <Media photo={perfcPhoto(top.photo)} h={150}>
            <Shade />
            {topPr ? <Ov x={14} y={12} anchor="rt"><Image source={IMG["record"]} style={{ width: 40, height: 40 }} resizeMode="contain" /></Ov> : null}
            <Ov x={14} y={12} anchor="lb">
              <OvText>Séance du mois · {perfcDate(top.startedAt)}</OvText>
              <OvTitle>{top.name} · {perfcTonnes(volume(top))} t{topPr ? ` · ${topPr} record${topPr > 1 ? "s" : ""}` : ""}</OvTitle>
            </Ov>
          </Media>
        ) : null}

        {sess.length ? <H2>Records du mois</H2> : null}
        {sess.length && !prs.length ? <Sub>Pas de record ce mois-ci : vise un top set sur ton mouvement principal.</Sub> : null}
        {prs.map((r) => (
          <FRow key={r.exoId} left={<PerfC_Thumb photo={perfcPhoto(byId(r.exoId)?.photo)} size={44} r={12} />} text={<B>{byId(r.exoId)?.name ?? r.exoId}</B>} sub={perfcDate(r.s.startedAt)}
            right={<View style={{ alignItems: "flex-end", gap: 2 }}><Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{perfcKg(r.kg)} × {r.reps}</Text>{r.delta > 0 ? <PerfC_Delta text={`+${perfcKg(r.delta)} kg`} good /> : <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>1RM est. {perfcKg(e1rm(r.kg, r.reps))}</Text>}</View>} />
        ))}

        {course.length ? <>
          <H2>Course du mois</H2>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <KV k="Distance" v={fmtKm(km)} /><KV k="Sorties" v={String(course.length)} align="center" /><KV k="Allure moy." v={fmtPace(course.reduce((x, r) => x + r.duration, 0) / (km / 1000 || 1))} align="center" /><KV k="Plus longue" v={fmtKm(Math.max(...course.map((r) => r.distance)))} align="flex-end" />
          </View>
          {(() => { const b = course.reduce((x, r) => (pace(r) < pace(x) ? r : x)); return <Sub>Sortie la plus rapide : {fmtKm(b.distance)} en {fmtTime(b.duration)} ({fmtPace(pace(b))}) le {perfcDate(b.at)}.</Sub>; })()}
        </> : null}

        {sims.length ? <>
          <H2>Hyrox du mois</H2>
          {bestSim ? <FRow left={<PerfC_Thumb photo="photo-sled" size={44} r={12} />} text={<B>{bestSim.name ?? "Simulation"} · {bestSim.division}</B>} sub={`${perfcDate(bestSim.at)} · ${sims.length} simulation${sims.length > 1 ? "s" : ""} ce mois-ci`} right={<Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt }}>{fmtTime(hyroxTotal(bestSim))}</Text>} onPress={() => router.push("/perf/endurance")} /> : <Sub>{sims.length} simulation{sims.length > 1 ? "s" : ""} partielle{sims.length > 1 ? "s" : ""} ce mois-ci.</Sub>}
        </> : null}

        {tests.length ? <>
          <H2>Street du mois</H2>
          {Object.values(tests.reduce((acc, t) => { if (!acc[t.move] || t.value > acc[t.move].value) acc[t.move] = t; return acc; }, {} as Record<string, typeof tests[number]>)).map((t) => (
            <FRow key={t.id} left={<PerfC_Thumb photo="photo-pullup" size={44} r={12} />} text={<B>{streetMove(t.move)?.name ?? t.move}</B>} sub={`${perfcDate(t.at)}${t.variant ? ` · ${t.variant}` : ""}`} right={<Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{fmtStreet(t.move, t.value)}</Text>} />
          ))}
        </> : null}

        {!empty ? <Btn label="Partager le rapport" kind="white" icon="share" onPress={share} style={{ marginTop: 6 }} /> : null}
        {!empty ? <Label style={{ textAlign: "center" }}>Calories estimées : 26 kcal par série + 1 kcal par kg et par km couru. Assiduité : {done} activité{done > 1 ? "s" : ""} sur {planned} prévue{planned > 1 ? "s" : ""}.</Label> : null}
      </PerfC_Body>
    </Page>
  );
}
