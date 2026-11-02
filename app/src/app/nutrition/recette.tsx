import React, { useState } from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Page, Media, Shade, Ov, OvText, OvTitle, Circ, KV, Tabs, Btn, Sub, Pills } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { RECIPE_BY_ID, recipeNut, nut } from "../../data/foods";
import { useNutrition, nutri, foodOf, MEALS, MealKey, dayKey, foodsMap, recipeToShop } from "../../store/nutrition";

/** N08 · Fiche recette : portions, ingrédients, étapes, ajout au repas / aux courses */
export default function Recette() {
  const { id, meal: m0, day } = useLocalSearchParams<{ id: string; meal?: MealKey; day?: string }>(); const insets = useSafeAreaInsets();
  const n = useNutrition(); const r = RECIPE_BY_ID[id!]; const [serv, setServ] = useState(1); const [tab, setTab] = useState(0); const [meal, setMeal] = useState<MealKey>(m0 ?? "diner");
  if (!r) return <Page><Btn label="Retour" kind="secondary" onPress={() => router.back()} /></Page>;
  const t = recipeNut(r, serv, foodsMap()); const fav = n.favorites.includes("r:" + r.id);
  return (
    <Page pad={false}>
      <Media photo={r.photo as any} h={280} r={0}>
        <Shade />
        <Ov x={16} y={insets.top + 14} anchor="lt" style={{ right: 16, flexDirection: "row", justifyContent: "space-between" }}><Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><View style={{ flexDirection: "row", gap: 8 }}><Circ icon="star" size={38} kind={fav ? "primary" : "glass"} onPress={() => nutri.toggleFav("r:" + r.id)} /><Circ icon="share" size={38} kind="glass" /></View></Ov>
        <Ov x={16} y={14} anchor="lb"><OvText>{r.tags.join(" · ")} · {r.minutes} min · {r.level}</OvText><OvTitle size={28}>{r.name}</OvTitle><OvText size={12.5} dim={0.85}>{r.ingredients.length} ingrédients · {r.servings} portion{r.servings > 1 ? "s" : ""} à la base</OvText></Ov>
      </Media>
      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}><KV k="Calories" v={String(t.kcal)} /><KV k="Protéines" v={`${t.p} g`} /><KV k="Glucides" v={`${t.g} g`} /><KV k="Lipides" v={`${t.l} g`} /></View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: inter(400), fontSize: 14, color: C.txt }}>Portions</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Circ icon="x" size={30} onPress={() => setServ(Math.max(1, serv - 1))} /><Text style={{ fontFamily: man(700), fontSize: 18, color: C.txt }}>{serv}</Text><Circ icon="plus" size={30} onPress={() => setServ(serv + 1)} /></View>
        </View>
        <Tabs items={["Ingrédients", "Étapes", "Repas"]} on={tab} onChange={setTab} />
        {tab === 0 ? r.ingredients.map((i) => { const f = foodOf(i.foodId); const g = Math.round((i.grams / r.servings) * serv); return (
          <View key={i.foodId} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }}><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, color: C.txt }}>{f?.name ?? i.foodId}</Text><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{g} g · {f ? nut(f, g).kcal : 0} kcal</Text></View>); }) : null}
        {tab === 1 ? r.steps.map((s, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 12, paddingVertical: 8 }}><View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: inter(700), fontSize: 12, color: C.txt }}>{i + 1}</Text></View><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, lineHeight: 20, color: C.soft }}>{s}</Text></View>)) : null}
        {tab === 2 ? <View style={{ gap: 10 }}><Sub>Dans quel repas l'ajouter ?</Sub><Pills items={MEALS.map((x) => x.short)} on={MEALS.findIndex((x) => x.key === meal)} onChange={(i) => setMeal(MEALS[i].key)} /></View> : null}
        <View style={{ flexDirection: "row", gap: 8, paddingTop: 6 }}>
          <View style={{ flex: 1 }}><Btn label="Aux courses" kind="secondary" icon="copy" size="md" onPress={() => { nutri.shopAdd(recipeToShop(r, serv)); router.push("/nutrition/courses"); }} /></View>
          <View style={{ flex: 1 }}><Btn label={`Au ${MEALS.find((x) => x.key === meal)!.label.toLowerCase()}`} icon="plus" size="md" onPress={() => { nutri.add(meal, { recipeId: r.id, grams: 0, servings: serv }, day ?? dayKey()); router.back(); }} /></View>
        </View>
      </View>
    </Page>
  );
}
