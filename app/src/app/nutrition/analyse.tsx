import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Label, Big, Sub, KV, Bars, H2, Macros3, SelRow, Icon, Btn, MG } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useProfile, macros } from "../../store/profile";
import { useNutrition, dayKey, dayTotals } from "../../store/nutrition";

/** N11 · Analyse : moyennes sur 7 / 30 / 90 jours, régularité, protéines */
export default function Analyse() {
  const p = useProfile(); const n = useNutrition(); const [r, setR] = useState(0); const m = macros(p); const kcal = m.kcal + n.kcalAdjust;
  const days = [7, 30, 90][r]; const keys = Array.from({ length: days }, (_, i) => dayKey(new Date(Date.now() - (days - 1 - i) * 86400e3)));
  const tots = keys.map((k) => ({ k, t: dayTotals(k), filled: !!n.days[k] && Object.values(n.days[k].meals).flat().length > 0 }));
  const filled = tots.filter((x) => x.filled); const avg = (f: (t: any) => number) => (filled.length ? Math.round(filled.reduce((a, x) => a + f(x.t), 0) / filled.length) : 0);
  const avgK = avg((t) => t.kcal); const inRange = filled.filter((x) => Math.abs(x.t.kcal - kcal) <= kcal * 0.1).length;
  const we = filled.filter((x) => [0, 6].includes(new Date(x.k).getDay())); const wd = filled.filter((x) => ![0, 6].includes(new Date(x.k).getDay()));
  const weP = we.length ? Math.round(we.reduce((a, x) => a + x.t.p, 0) / we.length) : 0; const wdP = wd.length ? Math.round(wd.reduce((a, x) => a + x.t.p, 0) / wd.length) : 0;
  const bars = r === 0 ? tots.map((x) => x.t.kcal) : Array.from({ length: Math.ceil(days / (days / 7)) }, (_, i) => { const s = tots.slice(i * Math.floor(days / 7), (i + 1) * Math.floor(days / 7)).filter((x) => x.filled); return s.length ? Math.round(s.reduce((a, x) => a + x.t.kcal, 0) / s.length) : 0; });
  const labels = r === 0 ? keys.map((k) => "LMMJVSD"[(new Date(k).getDay() + 6) % 7]) : bars.map((_, i) => `S${i + 1}`);
  return (
    <Page>
      <Top title="Analyse" right={<Circ icon="share" size={38} />} onBack={() => router.back()} />
      <Pills items={["7 jours", "30 jours", "3 mois"]} on={r} onChange={setR} />
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}><Label>moyenne / jour saisi</Label><Big v={avgK.toLocaleString("fr-FR")} unit="kcal" size={48} /><Sub>objectif {kcal.toLocaleString("fr-FR")} · {filled.length ? <Text style={{ fontFamily: inter(600), color: Math.abs(avgK - kcal) <= 150 ? C.green : MG }}>{avgK - kcal >= 0 ? "+" : "−"}{Math.abs(avgK - kcal)}</Text> : "—"} en moyenne · {filled.length} jour{filled.length > 1 ? "s" : ""} saisi{filled.length > 1 ? "s" : ""}</Sub></View>
        <KV k="Protéines" v={`${avg((t) => t.p)} g / j`} />
      </View>
      {bars.some((v) => v > 0) ? <Bars vals={bars.map((v) => v || 0.001)} labels={labels} h={100} hl={bars.length - 1} /> : <Sub>Saisis tes repas quelques jours pour voir les graphiques.</Sub>}
      <H2>Macros · moyenne</H2>
      <Macros3 p={avg((t) => t.p)} g={avg((t) => t.g)} l={avg((t) => t.l)} pg={m.prot} gg={m.gluc} lg={m.lip} />
      <H2>Ce que je vois</H2>
      {filled.length ? (<>
        {we.length && weP < m.prot * 0.85 ? <SelRow visual={<Icon name="bolt" size={24} color={C.accent} />} title="Protéines plus basses le week-end" s={`${weP} g samedi/dimanche contre ${wdP} g en semaine · vise ${m.prot} g`} right={null} /> : null}
        <SelRow visual={<Icon name="stats" size={24} color={inRange >= filled.length * 0.7 ? C.green : MG} />} title={inRange >= filled.length * 0.7 ? "Bonne régularité" : "Régularité à améliorer"} s={`${inRange} jour${inRange > 1 ? "s" : ""} sur ${filled.length} à ± 10 % de l'objectif`} right={null} />
        {avg((t) => t.p) < m.prot * 0.8 ? <SelRow visual={<Icon name="bolt" size={24} color={C.accent} />} title="Protéines sous la cible" s={`${avg((t) => t.p)} g en moyenne · ajoute une source à chaque repas (skyr, œufs, poulet)`} right={<Btn label="Recettes" kind="secondary" size="sm" full={false} onPress={() => router.push("/nutrition/recettes")} />} /> : null}
        {filled.length < days * 0.6 ? <SelRow visual={<Icon name="clock" size={24} color={C.mut} />} title="Journées non saisies" s={`${days - filled.length} jour${days - filled.length > 1 ? "s" : ""} sans repas · la copie d'hier prend 2 secondes`} right={<Btn label="Mes repas" kind="secondary" size="sm" full={false} onPress={() => router.push("/nutrition/repas")} />} /> : null}
      </>) : <Sub>Rien à analyser pour l'instant.</Sub>}
    </Page>
  );
}
