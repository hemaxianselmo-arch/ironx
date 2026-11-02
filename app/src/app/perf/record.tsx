import React, { useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Circ, Seg, Label, Big, Sub, H2, Btn, Divider, PerfA_Empty, perfaDate, perfaKg } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useWorkout, exoHistory, heaviest, fmtKg } from "../../store/workout";
import { byId, e1rm, PREVIOUS_BEST } from "../../data/seed";

const REPS = [1, 2, 3, 5, 6, 8, 10, 12];
const PCTS = [60, 70, 80, 85, 90, 95];
const brzycki = (kg: number, reps: number) => (reps <= 1 ? kg : Math.round(((kg * 36) / (37 - Math.min(36, reps))) * 2) / 2);

/** R02 · Détail d'un record : 1RM estimé (Epley / Brzycki), table reps → charge réelle, table de charges */
export default function PerfRecord() {
  const { id } = useLocalSearchParams<{ id: string }>(); useWorkout();
  const e = byId(id ?? ""); const [f, setF] = useState(0);
  const sets = useMemo(() => {
    const out: { kg: number; reps: number; at?: number }[] = (PREVIOUS_BEST[id ?? ""] ?? []).map((s) => ({ ...s }));
    for (const h of exoHistory(id ?? "")) for (const s of h.sets) out.push({ kg: s.kg, reps: s.reps, at: h.session.startedAt });
    return out.filter((s) => s.kg > 0 && s.reps > 0);
  }, [id]);
  if (!e) return <Page><Top onBack={() => router.back()} title="Record" /><PerfA_Empty title="Exercice introuvable" text="Ce record n'existe plus dans ta bibliothèque." cta="Retour" onPress={() => router.back()} /></Page>;
  const est = (kg: number, reps: number) => (f === 0 ? e1rm(kg, reps) : brzycki(kg, reps));
  const best = sets.length ? sets.reduce((a, b) => (est(b.kg, b.reps) > est(a.kg, a.reps) ? b : a)) : null;
  const oneRm = best ? est(best.kg, best.reps) : 0;
  const real = heaviest(e.id);
  // pour chaque nombre de reps : la charge la plus lourde réellement faite à ce nombre de reps (ou plus)
  const table = REPS.map((r) => { const c = sets.filter((s) => s.reps >= r); if (!c.length) return { r, kg: 0 as number, at: undefined as number | undefined }; const b = c.reduce((a, s) => (s.kg > a.kg ? s : a)); return { r, kg: b.kg, at: b.at }; });
  const mx = Math.max(1, ...table.map((t) => t.kg));
  const share = () => Share.share({ message: `${e.name} · 1RM estimé ${perfaKg(oneRm)} kg${real ? ` · meilleur réel ${fmtKg(real.kg)} × ${real.reps}` : ""} — IRONX` }).catch(() => {});

  return (
    <Page>
      <Top title={e.name} sub="Records par nombre de répétitions" right={<Circ icon="share" size={38} onPress={share} />} onBack={() => router.back()} />
      {!sets.length ? <PerfA_Empty icon="trophy" title="Aucune série enregistrée" text={`Valide une série de ${e.name.toLowerCase()} en séance pour voir ton 1RM estimé et tes records par nombre de reps.`} cta="Démarrer une séance" onPress={() => router.push("/seance" as any)} /> : (
        <>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ gap: 2 }}>
              <Label>1RM estimé · {f === 0 ? "Epley" : "Brzycki"}</Label>
              <Big v={perfaKg(oneRm)} unit="kg" size={52} />
              <Sub>meilleur réel · {real ? `${fmtKg(real.kg)} × ${real.reps}` : "—"}{best?.at ? ` le ${perfaDate(best.at)}` : ""}</Sub>
            </View>
            <View style={{ width: 150 }}><Seg items={["Epley", "Brzycki"]} on={f} onChange={setF} /></View>
          </View>
          <View style={{ gap: 2 }}>
            {table.map((t) => (
              <View key={t.r} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
                <Text style={{ fontFamily: inter(500), fontSize: 13, color: C.soft, width: 52 }}>{t.r} rep{t.r > 1 ? "s" : ""}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  {t.kg ? <View style={{ width: `${Math.round((t.kg / mx) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: t.kg === real?.kg && t.r <= (real?.reps ?? 0) ? C.accent : "rgba(255,255,255,0.3)" }} /> : null}
                </View>
                <Text style={{ fontFamily: man(700), fontSize: 15, color: t.kg ? C.txt : C.mut, width: 64, textAlign: "right" }}>{t.kg ? `${fmtKg(t.kg)} kg` : "—"}</Text>
                <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut, width: 52, textAlign: "right" }}>{t.kg ? (t.at ? perfaDate(t.at) : "départ") : ""}</Text>
              </View>
            ))}
          </View>
          <Divider />
          <H2 action="% du 1RM">Table de charges</H2>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {PCTS.map((p) => (
              <View key={p} style={{ flex: 1, borderRadius: 14, backgroundColor: C.surf, paddingVertical: 12, alignItems: "center", gap: 3 }}>
                <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{p} %</Text>
                <Text style={{ fontFamily: man(700), fontSize: 14, color: C.txt }}>{perfaKg((oneRm * p) / 100)}</Text>
              </View>
            ))}
          </View>
          <Sub>Charges arrondies à 0,5 kg. Épaule-toi sur le 1RM estimé pour programmer tes séries lourdes.</Sub>
          <Btn label="Voir la progression" kind="secondary" icon="stats" onPress={() => router.push({ pathname: "/seance/progression", params: { id: e.id } })} />
        </>
      )}
    </Page>
  );
}
