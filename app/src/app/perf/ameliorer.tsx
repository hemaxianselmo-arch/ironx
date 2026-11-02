import React, { useMemo, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Btn, Sub, ExoThumb, Icon, PerfA_Empty, PerfA_Spark, PerfA_Tag, perfaKg, perfaDate } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout } from "../../store/workout";
import { useActivities, fmtTime, fmtStreet, STREET_MOVES, HYROX_STATIONS, hyroxTotal } from "../../store/activities";
import { byId, e1rm } from "../../data/seed";

type Status = "plateau" | "regresse" | "progresse";
type Item = { key: string; cat: 1 | 2 | 3 | 4; name: string; exoId?: string; status: Status; sub: string; points: number[]; advice: string; actions: { label: string; to: string }[] };
const FILTERS = ["Tout", "Musculation", "Hyrox", "Course", "Street"];
const STATUS: Record<Status, { label: string; color: string }> = { plateau: { label: "Plateau", color: C.orange }, regresse: { label: "Régresse", color: C.red }, progresse: { label: "Progresse", color: C.green } };
const weeksAgo = (t: number) => Math.max(1, Math.round((Date.now() - t) / (7 * 86400e3)));

/** Classe une série chronologique : plus grand = mieux (ou plus petit si lower) */
function classify(points: number[], lower = false): { status: Status; best: number; last: number } {
  const v = lower ? points.map((x) => -x) : points; const last = v[v.length - 1]; const best = Math.max(...v);
  const bestBefore = Math.max(...v.slice(0, -3)); // meilleur avant les 3 dernières valeurs
  if (Math.abs(last) > 0 && (best - last) / Math.abs(best) > 0.03) return { status: "regresse", best: Math.abs(best), last: Math.abs(last) };
  if (v.length >= 3 && Math.max(...v.slice(-3)) <= (isFinite(bestBefore) ? bestBefore : -Infinity)) return { status: "plateau", best: Math.abs(best), last: Math.abs(last) };
  if (v.length >= 3 && v.slice(-3).every((x) => Math.abs(x - last) / Math.abs(last || 1) < 0.01) && last <= (isFinite(bestBefore) ? bestBefore : last)) return { status: "plateau", best: Math.abs(best), last: Math.abs(last) };
  return { status: "progresse", best: Math.abs(best), last: Math.abs(last) };
}

/** R17 · À améliorer : plateaux et régressions détectés sur 6 semaines, avec conseil et actions */
export default function PerfAmeliorer() {
  const { history } = useWorkout(); const { runs, street, hyrox } = useActivities();
  const [f, setF] = useState(0); const [hidden, setHidden] = useState<string[]>([]);
  const items = useMemo<Item[]>(() => {
    const lim = Date.now() - 42 * 86400e3; const out: Item[] = [];
    // musculation : meilleur 1RM est. par séance, exercices faits ≥ 3 fois
    const per: Record<string, { t: number; v: number }[]> = {};
    for (const s of history.slice().reverse()) { if (s.startedAt < lim) continue; for (const ex of s.exos) { const sets = ex.sets.filter((x) => x.done && x.kg > 0 && x.reps > 0); if (!sets.length) continue; (per[ex.exoId] ??= []).push({ t: s.startedAt, v: Math.max(...sets.map((x) => e1rm(x.kg, x.reps))) }); } }
    for (const [id, h] of Object.entries(per)) { if (h.length < 3) continue; const e = byId(id); if (!e) continue; const pts = h.map((x) => x.v); const c = classify(pts); const since = h.find((x) => x.v === c.best)!;
      const sub = c.status === "plateau" ? `${weeksAgo(since.t)} semaine${weeksAgo(since.t) > 1 ? "s" : ""} à ${perfaKg(c.best)} kg` : c.status === "regresse" ? `−${perfaKg(c.best - c.last)} kg en ${h.length} séances` : `+${perfaKg(c.last - pts[0])} kg en ${h.length} séances`;
      const advice = c.status === "plateau" ? `Aucun record depuis le ${perfaDate(since.t)}. Change de variante 3 semaines (${e.variants?.length ? e.variants.slice(0, 2).map((v) => byId(v)?.name?.toLowerCase() ?? v).join(", ") : "tempo, pause"}) ou passe à 5 × 3 à 85 %.`
        : c.status === "regresse" ? `Tu perds de la force sur ${e.name.toLowerCase()} : vérifie le sommeil et la récupération, puis une semaine de décharge avant de reprendre à 90 % du record.` : `Rien à changer, continue : ${perfaKg(c.best + 2.5)} kg est à portée dans les 2 semaines.`;
      out.push({ key: "exo-" + id, cat: 1, name: e.name, exoId: id, status: c.status, sub, points: pts, advice, actions: c.status === "plateau" ? [{ label: "Changer de variante", to: "/seance/bibliotheque" }] : c.status === "regresse" ? [{ label: "Ajouter au plan", to: "/seance/editeur" }] : [{ label: "Continuer", to: "/seance" }] }); }
    // hyrox : par station, ≥ 3 simulations
    const sims = hyrox.filter((h) => h.at >= lim).slice().reverse();
    if (sims.length >= 3) {
      HYROX_STATIONS.forEach((st, i) => { const pts = sims.map((h) => h.stations[i]).filter((x) => x > 0); if (pts.length < 3) return; const c = classify(pts, true);
        const sub = c.status === "regresse" ? `+${fmtTime(c.last - c.best)} en ${pts.length} sim.` : c.status === "plateau" ? `stagne à ${fmtTime(c.best)}` : `−${fmtTime(pts[0] - c.last)} en ${pts.length} sim.`;
        const advice = c.status === "regresse" ? `Seule station qui recule. Ajoute 2 blocs de ${st.short.toLowerCase()} spécifiques par semaine (intervalles courts, charge compétition).` : c.status === "plateau" ? `Travaille ${st.short.toLowerCase()} en fin de séance, fatigué, pour reproduire les conditions de course.` : "Rien à changer, continue.";
        out.push({ key: "hx-" + st.id, cat: 2, name: st.name, exoId: st.id === "sled-push" ? "sled-push" : st.id === "sled-pull" ? "sled-pull" : st.id === "rowing" ? "rower" : st.id === "wallballs" ? "wallball" : st.id === "skierg" ? "skierg" : st.id === "farmers" ? "farmers" : st.id === "lunges" ? "sandbag-lunge" : "burpee-bj", status: c.status, sub, points: pts.map((x) => -x), advice, actions: [{ label: c.status === "progresse" ? "Continuer" : "Ajouter au plan", to: c.status === "progresse" ? "/seance" : "/seance/editeur" }] }); });
      const tot = sims.filter((h) => !h.partial).map(hyroxTotal); if (tot.length >= 3) { const c = classify(tot, true); out.push({ key: "hx-total", cat: 2, name: "Hyrox · temps total", exoId: "run", status: c.status, sub: `${fmtTime(c.last)} · meilleur ${fmtTime(c.best)}`, points: tot.map((x) => -x), advice: c.status === "progresse" ? "Rien à changer, continue." : "Le total ne baisse plus : regarde la station qui recule et le roxzone (transitions).", actions: [{ label: "Points faibles", to: "/perf/radar-hyrox" }] }); }
    }
    // course : 5 km (sorties ≥ 4,9 km, temps ramené à 5 km)
    const r5 = runs.filter((r) => r.sport === "course" && r.at >= lim && r.distance >= 4900).slice().reverse().map((r) => r.duration * (5000 / r.distance));
    if (r5.length >= 3) { const c = classify(r5, true);
      const sub = c.status === "plateau" ? `Stagne à ${fmtTime(c.best)}` : c.status === "regresse" ? `+${fmtTime(c.last - c.best)} vs meilleur` : `−${fmtTime(r5[0] - c.last)} en ${r5.length} sorties`;
      const advice = c.status === "plateau" ? "Tes sorties sont toutes à la même allure. Une séance de seuil + un fractionné court par semaine." : c.status === "regresse" ? "Tu ralentis : baisse le volume une semaine, garde une séance de qualité, surveille le sommeil." : "Rien à changer, continue : garde une sortie longue et une séance rapide.";
      out.push({ key: "run-5k", cat: 3, name: "5 km", exoId: "run", status: c.status, sub, points: r5.map((x) => -x), advice, actions: [{ label: "Programmer", to: "/seance/programmes" }] }); }
    // street : par mouvement, ≥ 3 tests
    for (const m of STREET_MOVES) { const t = street.filter((x) => x.move === m.id && x.at >= lim).slice().reverse(); if (t.length < 3) continue; const pts = t.map((x) => x.value); const c = classify(pts);
      const sub = c.status === "progresse" ? `+${fmtStreet(m.id, Math.round((c.last - pts[0]) * 10) / 10).replace("+", "")}`.replace("++", "+") : c.status === "plateau" ? `stagne à ${fmtStreet(m.id, c.best)}` : `−${fmtStreet(m.id, Math.round((c.best - c.last) * 10) / 10).replace("+", "")}`;
      const advice = c.status === "progresse" ? `Rien à changer, continue : ${m.kind === "sec" ? "le full est à portée en 2 semaines" : "le prochain palier est proche"}.` : c.status === "plateau" ? `Ajoute du volume : 2 séances par semaine de ${m.name.toLowerCase()} en séries sous-max (60 % du max).` : "Tu recules : repos 4 à 5 jours puis reprise progressive, technique avant tout.";
      out.push({ key: "st-" + m.id, cat: 4, name: m.name, exoId: m.id === "pullup-w" ? "pullup-weighted" : m.id === "dips-w" ? "dips" : m.id === "frontlever" ? "front-lever" : m.id === "muscleup" ? "muscle-up" : m.id, status: c.status, sub, points: pts, advice, actions: [{ label: c.status === "progresse" ? "Continuer" : "Programmer", to: c.status === "progresse" ? "/perf/street" : "/seance/programmes" }] }); }
    const order: Record<Status, number> = { regresse: 0, plateau: 1, progresse: 2 };
    return out.sort((a, b) => order[a.status] - order[b.status]);
  }, [history, runs, street, hyrox]);
  const list = items.filter((i) => !hidden.includes(i.key) && (f === 0 || i.cat === f));
  const hasData = history.length || runs.length || street.length || hyrox.length;

  return (
    <Page>
      <Top title="À améliorer" sub="ce que l'app a détecté sur 6 semaines" right={<Circ icon="filter" size={38} />} onBack={() => router.back()} />
      <Pills items={FILTERS} on={f} onChange={setF} />
      {!hasData ? <PerfA_Empty icon="filter" title="Rien à analyser pour l'instant" text="Après 3 séances (ou sorties, tests) sur un même mouvement, IRONX détecte les plateaux et les régressions et te propose quoi changer." cta="Démarrer une séance" onPress={() => router.push("/seance" as any)} />
        : !list.length ? <PerfA_Empty icon="check" title={items.length ? "Tout est masqué ou filtré" : "Pas encore assez de répétitions"} text={items.length ? "Change de filtre ou réaffiche les éléments ignorés." : "Il faut au moins 3 séances sur un même exercice en 6 semaines pour détecter une tendance."} cta={items.length ? "Tout réafficher" : undefined} onPress={() => setHidden([])} /> : null}
      {list.map((it) => { const e = it.exoId ? byId(it.exoId) : undefined; const s = STATUS[it.status]; return (
        <View key={it.key} style={{ gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {e ? <ExoThumb hl={e.hl} view={e.view} size={48} /> : <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.surf, alignItems: "center", justifyContent: "center" }}><Icon name="run" size={22} color={C.soft} /></View>}
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontFamily: man(700), fontSize: 16, color: C.txt }}>{it.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><PerfA_Tag label={s.label} color={s.color} /><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }} numberOfLines={1}>{it.sub}</Text></View>
            </View>
            <PerfA_Spark points={it.points} color={s.color} />
          </View>
          <Sub>{it.advice}</Sub>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {it.actions.map((a) => <Btn key={a.label} label={a.label} kind={it.status === "progresse" ? "secondary" : "white"} size="sm" full={false} onPress={() => router.push(a.to as any)} />)}
            <Btn label="Ignorer" kind="secondary" size="sm" full={false} onPress={() => setHidden((h) => [...h, it.key])} />
          </View>
        </View>); })}
    </Page>
  );
}
