import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Page, Media, Shade, Ov, OvText, OvTitle, Circ, Label, Big, Seg, Pill, KV, Macros3, H2, CTA, Btn } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { nut } from "../../data/foods";
import { useNutrition, nutri, foodOf, MEALS, MealKey, dayKey, getDay } from "../../store/nutrition";

/** N03 · Fiche aliment : quantité, macros, ajout au repas (ou modification d'une entrée) */
export default function Aliment() {
  const { id, meal, day, entry } = useLocalSearchParams<{ id: string; meal?: MealKey; day?: string; entry?: string }>(); const insets = useSafeAreaInsets();
  const n = useNutrition(); const f = foodOf(id!); const k = day ?? dayKey(); const m = meal ?? "dejeuner";
  const existing = entry ? getDay(k).meals[m].find((e) => e.id === entry) : undefined;
  const [grams, setGrams] = useState(existing?.grams ?? f?.portion ?? 100); const [mode, setMode] = useState(0);
  if (!f) return <Page><Btn label="Retour" kind="secondary" onPress={() => router.back()} /></Page>;
  const t = nut(f, grams); const fav = n.favorites.includes(f.id);
  const quick = [100, 150, f.portion, 200, 250].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  const fmt = (v: number) => String(v).replace(".", ",");
  return (
    <Page pad={false}>
      <Media photo={f.photo as any} h={220} r={0}>
        <Shade />
        <Ov x={16} y={insets.top + 14} anchor="lt" style={{ right: 16, flexDirection: "row", justifyContent: "space-between" }}><Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><Circ icon="star" size={38} kind={fav ? "primary" : "glass"} onPress={() => nutri.toggleFav(f.id)} /></Ov>
        <Ov x={16} y={14} anchor="lb"><OvText>{f.cat}{f.brand ? ` · ${f.brand}` : ""} · {f.custom ? "créé par toi" : "base IRONX"}</OvText><OvTitle size={26}>{f.name}</OvTitle></Ov>
      </Media>
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 }}>
          <View style={{ alignItems: "center", gap: 2 }}><Label>quantité</Label>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <TextInput value={String(grams)} onChangeText={(v) => setGrams(Math.max(0, parseInt(v) || 0))} keyboardType="number-pad" style={{ fontFamily: "Manrope_700Bold", fontSize: 56, letterSpacing: -2.5, color: C.txt, minWidth: 90, textAlign: "center", outlineStyle: "none" } as any} />
              <Text style={{ fontFamily: inter(600), fontSize: 18, color: C.mut }}>g</Text>
            </View>
          </View>
          <View style={{ width: 170 }}><Seg items={["g", "portion"]} on={mode} onChange={(i) => { setMode(i); if (i === 1) setGrams(f.portion); }} /></View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>{quick.map((v) => <Pill key={v} label={`${v} g`} on={grams === v} onPress={() => setGrams(v)} />)}</View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}><KV k="Calories" v={String(t.kcal)} /><KV k="Protéines" v={`${fmt(t.p)} g`} /><KV k="Glucides" v={`${fmt(t.g)} g`} /><KV k="Lipides" v={`${fmt(t.l)} g`} /></View>
        <Macros3 p={t.p} g={t.g} l={t.l} pg={Math.max(1, t.p + t.g + t.l)} gg={Math.max(1, t.p + t.g + t.l)} lg={Math.max(1, t.p + t.g + t.l)} />
        <H2>Pour 100 g</H2>
        {[["Calories", `${f.kcal} kcal`], ["Protéines", `${fmt(f.p)} g`], ["Glucides", `${fmt(f.g)} g`], ["Lipides", `${fmt(f.l)} g`], ["Fibres", f.fib ? `${f.fib} g` : "—"]].map(([a, b]) => (
          <View key={a} style={{ flexDirection: "row", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.line }}><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, color: C.txt }}>{a}</Text><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{b}</Text></View>))}
        <CTA label={existing ? `Modifier · ${t.kcal} kcal` : `Ajouter au ${MEALS.find((x) => x.key === m)?.label.toLowerCase()} · ${t.kcal} kcal`} icon={existing ? "check" : "plus"} onPress={() => { if (existing) nutri.setGrams(m, existing.id, grams, k); else nutri.add(m, { foodId: f.id, grams }, k); router.dismissTo ? router.dismissTo("/(tabs)/nutrition") : router.back(); }}
          secondary={existing ? "Retirer du repas" : undefined} onSecondary={() => { if (existing) { nutri.remove(m, existing.id, k); router.back(); } }} />
      </View>
    </Page>
  );
}
