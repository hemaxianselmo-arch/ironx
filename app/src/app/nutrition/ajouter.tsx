import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Search, Pills, Btn, Tabs, FoodRow, Circ, Sub } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { normalize } from "../../data/exercises";
import { RECIPES, nut, recipeNut } from "../../data/foods";
import { useNutrition, nutri, allFoods, foodOf, MEALS, MealKey, dayKey, foodsMap } from "../../store/nutrition";

/** N02 · Ajouter un aliment */
export default function Ajouter() {
  const { meal: m0, day } = useLocalSearchParams<{ meal?: MealKey; day?: string }>(); const n = useNutrition();
  const [meal, setMeal] = useState<MealKey>(m0 ?? "dejeuner"); const [q, setQ] = useState(""); const [tab, setTab] = useState(0);
  const k = day ?? dayKey();
  const list = useMemo(() => {
    const nq = normalize(q); const all = allFoods();
    if (nq) return all.filter((f) => normalize(f.name + " " + (f.brand ?? "") + " " + f.cat).includes(nq)).slice(0, 40);
    if (tab === 0) { const r = n.recents.map(foodOf).filter(Boolean) as any[]; return r.length ? r : all.slice(0, 12); }
    if (tab === 1) return n.favorites.map(foodOf).filter(Boolean) as any[];
    if (tab === 2) return n.foods;
    return [];
  }, [q, tab, n]);
  const add = (f: any) => { nutri.add(meal, { foodId: f.id, grams: f.portion }, k); router.back(); };
  return (
    <Page>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><View style={{ flex: 1 }}><Search ph="Rechercher un aliment" value={q} onChange={setQ} /></View><Text onPress={() => router.back()} style={{ fontFamily: inter(400), fontSize: 14, color: C.txt }}>Annuler</Text></View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Ajouter à</Text><View style={{ flex: 1 }}><Pills items={MEALS.map((x) => x.short)} on={MEALS.findIndex((x) => x.key === meal)} onChange={(i) => setMeal(MEALS[i].key)} /></View></View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}><Btn label="Scanner" kind="secondary" icon="copy" size="sm" onPress={() => router.push({ pathname: "/nutrition/scanner", params: { meal, day: k } })} /></View>
        <View style={{ flex: 1 }}><Btn label="Photo IA" kind="secondary" icon="cam" size="sm" onPress={() => router.push({ pathname: "/nutrition/photo", params: { meal, day: k } })} /></View>
        <View style={{ flex: 1 }}><Btn label="Créer" kind="secondary" icon="plus" size="sm" onPress={() => router.push("/nutrition/creer-aliment")} /></View>
      </View>
      {!q ? <Tabs items={["Récents", "Favoris", "Mes aliments", "Recettes"]} on={tab} onChange={setTab} /> : null}
      {(!q && tab === 3) ? RECIPES.map((r) => { const t = recipeNut(r, 1, foodsMap()); return <FoodRow key={r.id} name={r.name} s={`1 portion · ${t.kcal} kcal · P ${t.p} g · ${r.minutes} min`} photo={r.photo} right={<Circ icon="plus" size={34} kind="primary" onPress={() => { nutri.add(meal, { recipeId: r.id, grams: 0, servings: 1 }, k); router.back(); }} />} onPress={() => router.push({ pathname: "/nutrition/recette", params: { id: r.id, meal, day: k } })} />; })
        : list.map((f: any) => { const t = nut(f, f.portion); return <FoodRow key={f.id} name={f.name} s={`${f.portionLabel ?? f.portion + " g"} · ${t.kcal} kcal · P ${t.p} g · G ${t.g} g`} photo={f.photo} right={<Circ icon="plus" size={34} kind="primary" onPress={() => add(f)} />} onPress={() => router.push({ pathname: "/nutrition/aliment", params: { id: f.id, meal, day: k } })} />; })}
      {!list.length && !(tab === 3 && !q) ? <Sub>{q ? "Aucun aliment trouvé. Essaie un autre mot ou crée-le." : tab === 1 ? "Touche l'étoile d'un aliment pour le mettre en favori." : "Tes aliments créés apparaîtront ici."}</Sub> : null}
    </Page>
  );
}
