import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, H2, FoodRow, KV, Btn, Sub } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { RECIPES, RECIPE_BY_ID, recipeNut } from "../../data/foods";
import { useNutrition, nutri, dayKey, MEALS, MealKey, foodsMap, recipeToShop } from "../../store/nutrition";
import { useProfile, macros } from "../../store/profile";

const JOURS = "LMMJVSD";
/** N13 · Planificateur de repas : une recette par repas et par jour, génération automatique, envoi aux courses */
export default function Planning() {
  const n = useNutrition(); const p = useProfile(); const m = macros(p); const kcal = m.kcal + n.kcalAdjust;
  const now = new Date(); const dow = (now.getDay() + 6) % 7; const monday = new Date(now); monday.setDate(now.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const [sel, setSel] = useState(dow); const k = dayKey(days[sel]); const plan = n.planner[k] ?? {};
  const tot = MEALS.reduce((a, me) => { const r = plan[me.key]?.recipeId ? RECIPE_BY_ID[plan[me.key]!.recipeId!] : null; const t = r ? recipeNut(r, 1, foodsMap()) : { kcal: 0, p: 0 }; return { kcal: a.kcal + t.kcal, p: a.p + t.p }; }, { kcal: 0, p: 0 });
  const generate = () => {
    const goalTag = p.goal === "fat" ? "Sèche" : p.goal === "muscle" ? "Prise de masse" : "Riches en protéines";
    const pool = (tag: string) => RECIPES.filter((r) => r.tags.includes(tag)); let i = 0;
    for (const d of days) { const kk = dayKey(d); const b = pool("Rapides"); const l = pool(goalTag).length ? pool(goalTag) : RECIPES; const c = pool("Riches en protéines");
      nutri.plan(kk, "petitdej", { recipeId: b[i % b.length].id }); nutri.plan(kk, "dejeuner", { recipeId: l[i % l.length].id }); nutri.plan(kk, "collation", { recipeId: c[(i + 1) % c.length].id }); nutri.plan(kk, "diner", { recipeId: l[(i + 2) % l.length].id }); i++; }
  };
  const toShop = () => { for (const d of days) { const pl = n.planner[dayKey(d)] ?? {}; for (const v of Object.values(pl)) if (v?.recipeId) nutri.shopAdd(recipeToShop(RECIPE_BY_ID[v.recipeId], 1)); } router.push("/nutrition/courses"); };
  const apply = () => { for (const me of MEALS) { const v = plan[me.key]; if (v?.recipeId) nutri.add(me.key, { recipeId: v.recipeId, grams: 0, servings: 1 }, k); } router.back(); };
  return (
    <Page>
      <Top title="Planning repas" sub={`semaine · ${kcal.toLocaleString("fr-FR")} kcal / jour`} right={<Circ icon="bolt" size={38} kind="primary" onPress={generate} />} onBack={() => router.back()} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {days.map((d, i) => (
          <Pressable key={i} onPress={() => setSel(i)} style={{ alignItems: "center", gap: 6 }}><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{JOURS[i]}</Text><View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: sel === i ? C.txt : n.planner[dayKey(d)] ? "rgba(255,255,255,0.1)" : "transparent" }}><Text style={{ fontFamily: inter(700), fontSize: 13, color: sel === i ? C.bg : C.txt }}>{d.getDate()}</Text></View></Pressable>))}
      </View>
      <H2 action="Appliquer au journal" onAction={apply}>{days[sel].toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })}</H2>
      {MEALS.map((me) => { const v = plan[me.key]; const r = v?.recipeId ? RECIPE_BY_ID[v.recipeId] : null; const t = r ? recipeNut(r, 1, foodsMap()) : null; return (
        <FoodRow key={me.key} name={me.label} s={r ? `${r.name} · ${t!.kcal} kcal · P ${t!.p} g` : "rien de prévu · touche pour choisir une recette"} photo={r?.photo ?? me.photo}
          right={r ? <Circ icon="x" size={30} onPress={() => nutri.plan(k, me.key, null)} /> : <Circ icon="plus" size={30} />}
          onPress={() => { const list = RECIPES; const idx = r ? (list.findIndex((x) => x.id === r.id) + 1) % list.length : 0; nutri.plan(k, me.key, { recipeId: list[idx].id }); }} />); })}
      <Sub>Touche un repas pour faire défiler les recettes ; l'éclair en haut génère la semaine complète selon ton objectif.</Sub>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}><KV k="Total" v={`${tot.kcal.toLocaleString("fr-FR")} kcal`} /><KV k="Protéines" v={`${tot.p} g`} /><KV k="Reste" v={`${(kcal - tot.kcal).toLocaleString("fr-FR")} kcal`} /></View>
      <Btn label="Envoyer la semaine aux courses" kind="secondary" icon="copy" onPress={toShop} />
      <Btn label="Générer la semaine avec l'assistant" icon="bolt" onPress={generate} />
    </Page>
  );
}
