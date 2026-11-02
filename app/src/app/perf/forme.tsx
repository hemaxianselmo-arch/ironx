import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Ring, KV, H2, Sub, Btn, Bars, Field, Label, PerfC_Hero, PerfC_HeroTop, PerfC_Body, PerfC_Scale, PerfC_Advice, PERFC_JOURS, PERFC_MOIS, perfcDayKey } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useActivities, act, readiness, dayKey, Wellness } from "../../store/activities";
import { useProfile, weekPlan } from "../../store/profile";

const SORE = ["—", "aucune", "faibles", "moyennes", "fortes", "très fortes"];
const num = (s: string) => { const v = parseFloat(s.replace(",", ".")); return isFinite(v) ? v : undefined; };

/** R15 · Forme du jour — score de préparation calculé depuis ton ressenti et tes mesures */
export default function Forme() {
  const { wellness } = useActivities(); const p = useProfile();
  const day = dayKey(); const r = readiness(day); const w = r.w as Wellness & { adjust?: string };
  const [sleep, setSleep] = useState(w.sleep != null ? String(w.sleep).replace(".", ",") : ""); const [hr, setHr] = useState(w.hrRest != null ? String(w.hrRest) : ""); const [hrv, setHrv] = useState(w.hrv != null ? String(w.hrv) : "");
  const [edit, setEdit] = useState(w.sleep == null && w.hrRest == null && w.hrv == null);
  const d = new Date(); const title = `Forme du jour · ${PERFC_JOURS[(d.getDay() + 6) % 7]} ${d.getDate()} ${PERFC_MOIS[d.getMonth()]}`;
  const state = r.score >= 80 ? "prêt à performer" : r.score >= 60 ? "en forme" : r.score >= 40 ? "fatigué" : "à ménager";
  const today = weekPlan(p)[(d.getDay() + 6) % 7][1];
  const adj = r.score >= 80 ? { t: `${today ? today + " · " : ""}charges +2,5 % sur le top set`, s: "au lieu de la progression normale · ton corps est prêt", key: "+2,5 % top set" }
    : r.score >= 60 ? { t: `${today ? today + " · " : ""}plan normal`, s: "suis les charges prévues, rien à changer", key: "plan normal" }
    : r.score >= 40 ? { t: `${today ? today + " · " : ""}volume −20 %`, s: "garde les charges, enlève une série par exercice", key: "volume −20 %" }
    : { t: "séance légère ou repos", s: "récupération incomplète : mobilité, technique ou repos complet", key: "séance légère / repos" };
  const applied = w.adjust === adj.key;
  const save = () => { act.setWellness(day, { sleep: num(sleep), hrRest: num(hr) != null ? Math.round(num(hr)!) : undefined, hrv: num(hrv) != null ? Math.round(num(hrv)!) : undefined }); setEdit(false); };
  const apply = () => { const patch: Record<string, unknown> = { adjust: adj.key }; act.setWellness(day, patch as Partial<Wellness>); };
  // 14 derniers jours
  const hist = Array.from({ length: 14 }, (_, i) => { const t = Date.now() - (13 - i) * 86400e3; return { k: perfcDayKey(t), d: new Date(t).getDate() }; });
  const scores = hist.map((h) => readiness(h.k).score); const filled = hist.filter((h) => wellness[h.k] != null).length;
  const ringColor = r.score >= 60 ? "#fff" : r.score >= 40 ? C.orange : "#FFB3B3";

  return (
    <Page pad={false}>
      <PerfC_Hero>
        <PerfC_HeroTop title={title} left={<Circ icon="back" size={38} kind="glass" onPress={() => router.back()} />} right={<Circ icon="edit" size={38} kind="glass" onPress={() => setEdit((e) => !e)} />} />
        <View style={{ alignItems: "center", gap: 10, paddingTop: 4 }}>
          <Ring pct={r.score} size={150} thick={11} color={ringColor}>
            <Text style={{ fontFamily: man(700), fontSize: 46, letterSpacing: -2, color: "#fff", lineHeight: 50 }}>{r.score}</Text>
            <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: "rgba(255,255,255,0.85)" }}>{state}</Text>
          </Ring>
          <Text style={{ fontFamily: inter(400), fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.9)", textAlign: "center", paddingHorizontal: 8 }}>{r.tips[0]}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <KV k="Sommeil" v={w.sleep != null ? `${Math.floor(w.sleep)} h ${String(Math.round((w.sleep % 1) * 60)).padStart(2, "0")}` : "—"} />
          <KV k="FC repos" v={w.hrRest != null ? String(w.hrRest) : "—"} align="center" />
          <KV k="VFC" v={w.hrv != null ? `${w.hrv} ms` : "—"} align="center" />
          <KV k="Courbatures" v={SORE[w.soreness ?? 0]} align="flex-end" />
        </View>
      </PerfC_Hero>
      <PerfC_Body>
        {edit ? (
          <View style={{ gap: 10 }}>
            <H2>Tes mesures du matin</H2>
            <Field label="Sommeil (h, ex. 7,5)" value={sleep} onChange={setSleep} placeholder="7,5" keyboard="decimal-pad" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><Field label="FC repos (bpm)" value={hr} onChange={setHr} placeholder="52" keyboard="number-pad" /></View>
              <View style={{ flex: 1 }}><Field label="VFC (ms)" value={hrv} onChange={setHrv} placeholder="68" keyboard="number-pad" /></View>
            </View>
            <Btn label="Enregistrer" kind="white" size="md" onPress={save} />
            <Label>La FC de repos et la VFC se comparent à ta moyenne des 14 derniers jours : saisis-les quelques jours pour que le score en tienne compte.</Label>
          </View>
        ) : null}

        <H2>Ton ressenti ce matin</H2>
        <PerfC_Scale label="Énergie" v={w.energy} onChange={(n) => act.setWellness(day, { energy: n })} />
        <PerfC_Scale label="Courbatures" v={w.soreness} onChange={(n) => act.setWellness(day, { soreness: n })} />
        <PerfC_Scale label="Stress" v={w.stress} onChange={(n) => act.setWellness(day, { stress: n })} />
        <PerfC_Scale label="Motivation" v={w.motivation} onChange={(n) => act.setWellness(day, { motivation: n })} />
        <Sub>1 = très bas · 5 = très haut (pour les courbatures et le stress, 5 = très fort).</Sub>

        <H2>Ajustement proposé</H2>
        <PerfC_Advice icon="bolt" title={adj.t} text={applied ? "appliqué à la séance du jour" : adj.s} action={applied ? "Appliqué" : "Appliquer"} actionKind={applied ? "secondary" : "white"} onAction={apply} />

        <H2>14 derniers jours</H2>
        <Bars vals={scores} labels={hist.map((h) => String(h.d))} h={100} hl={13} />
        <Sub>{filled ? `Score moyen ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)} · ${filled} jour${filled > 1 ? "s" : ""} renseigné${filled > 1 ? "s" : ""} sur 14.` : "Renseigne ton ressenti chaque matin pour suivre ta forme sur 14 jours."}</Sub>
      </PerfC_Body>
    </Page>
  );
}
