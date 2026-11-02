import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Search, FoodRow, Btn, H2, SelRow, Sub, Pills } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useNutrition, nutri, getDay, dayKey, mealTotals, entryName, MEALS, MealKey, foodOf } from "../../store/nutrition";
import { nut } from "../../data/foods";

/** N09 · Repas composés : enregistrer un repas du jour, l'ajouter en un geste, copier une journée */
export default function Repas() {
  const n = useNutrition(); const [q, setQ] = useState(""); const [target, setTarget] = useState<MealKey>("dejeuner");
  const today = getDay(); const yk = dayKey(new Date(Date.now() - 86400e3)); const y = n.days[yk];
  const list = n.savedMeals.filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()));
  const save = (key: MealKey) => { const es = today.meals[key].filter((e) => e.foodId); if (!es.length) return; const m = MEALS.find((x) => x.key === key)!; nutri.saveMeal({ id: "meal-" + Date.now(), name: `${m.short} du ${new Date().getDate()}`, photo: m.photo, entries: es.map((e) => ({ foodId: e.foodId!, grams: e.grams })) }); };
  return (
    <Page>
      <Top title="Mes repas" sub="Tes combinaisons enregistrées, ajout en un geste" right={<Circ icon="plus" size={38} kind="primary" onPress={() => save("dejeuner")} />} onBack={() => router.back()} />
      <Search ph="Rechercher un repas" value={q} onChange={setQ} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Ajouter au</Text><View style={{ flex: 1 }}><Pills items={MEALS.map((x) => x.short)} on={MEALS.findIndex((x) => x.key === target)} onChange={(i) => setTarget(MEALS[i].key)} /></View></View>
      {list.map((m) => { const t = mealTotals(m.entries.map((e, i) => ({ id: String(i), foodId: e.foodId, grams: e.grams, at: 0 }))); return (
        <FoodRow key={m.id} name={m.name} s={`${m.entries.map((e) => `${foodOf(e.foodId)?.name.split(" ")[0]} ${e.grams} g`).join(" · ")} · ${t.kcal} kcal`} photo={m.photo} right={<Btn label="Ajouter" kind="secondary" size="sm" full={false} onPress={() => { nutri.addSavedMeal(m, target); router.back(); }} />} onPress={() => nutri.deleteMeal(m.id)} />); })}
      {!list.length ? <Sub>Aucun repas enregistré. Enregistre un repas d'aujourd'hui ci-dessous : il sera réutilisable en un geste.</Sub> : null}
      <H2>Enregistrer un repas d'aujourd'hui</H2>
      {MEALS.map((m) => { const es = today.meals[m.key]; const t = mealTotals(es); return es.length ? <SelRow key={m.key} title={`${m.label} · ${t.kcal} kcal`} s={es.map(entryName).join(", ")} right={<Btn label="Enregistrer" kind="secondary" size="sm" full={false} onPress={() => save(m.key)} />} /> : null; })}
      {!Object.values(today.meals).flat().length ? <Sub>Rien de saisi aujourd'hui.</Sub> : null}
      <H2>Copier une journée</H2>
      {y ? <SelRow title={`Hier · ${mealTotals(Object.values(y.meals).flat()).kcal} kcal · P ${mealTotals(Object.values(y.meals).flat()).p} g`} s={MEALS.filter((m) => y.meals[m.key].length).map((m) => m.short.toLowerCase()).join(", ")} right={<Btn label="Copier" kind="secondary" size="sm" full={false} onPress={() => { nutri.copyDay(yk); router.back(); }} />} /> : <Sub>Rien d'enregistré hier.</Sub>}
    </Page>
  );
}
