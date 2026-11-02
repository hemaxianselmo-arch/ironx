import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Actions, Circ, Logo, Pills, Media, Shade, Ov, OvText, OvTitle, Btn, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { RECIPES, RECIPE_TAGS, recipeNut, Recipe } from "../../data/foods";
import { useNutrition, nutri, dayTotals, foodsMap } from "../../store/nutrition";
import { useProfile, macros } from "../../store/profile";

export function RecipeCard({ r, onPress }: { r: Recipe; onPress: () => void }) {
  const n = useNutrition(); const t = recipeNut(r, 1, foodsMap()); const fav = n.favorites.includes("r:" + r.id);
  return (
    <Pressable onPress={onPress} style={{ width: "48%" }}>
      <Media photo={r.photo as any} h={150} r={18}>
        <Shade />
        <Ov x={12} y={10} anchor="lb"><Text style={{ fontFamily: man(700), fontSize: 16, lineHeight: 18, color: "#fff" }}>{r.name}</Text><OvText size={11}>{t.kcal} kcal · {r.minutes} min</OvText></Ov>
        <Ov x={10} y={10} anchor="rt"><Circ icon="star" size={30} kind={fav ? "primary" : "glass"} onPress={() => nutri.toggleFav("r:" + r.id)} /></Ov>
      </Media>
    </Pressable>
  );
}
/** N07 · Recettes */
export default function Recettes() {
  const n = useNutrition(); const p = useProfile(); const [tag, setTag] = useState(0);
  const target = macros(p); const tot = dayTotals(); const missP = Math.max(0, target.prot - tot.p);
  const goalTag = p.goal === "fat" ? "Sèche" : p.goal === "muscle" ? "Prise de masse" : "Riches en protéines";
  const list = RECIPES.filter((r) => tag === 0 ? true : tag === 5 ? n.favorites.includes("r:" + r.id) : r.tags.includes(RECIPE_TAGS[tag]));
  const sug = RECIPES.filter((r) => r.tags.includes(goalTag)).sort((a, b) => recipeNut(b, 1).p - recipeNut(a, 1).p)[0] ?? RECIPES[0]; const st = recipeNut(sug, 1, foodsMap());
  return (
    <Page>
      <Top title="Recettes" left={<Logo name="cardio" size={38} on={false} />} right={<Actions><Circ icon="search" size={38} onPress={() => router.push("/nutrition/ajouter")} /><Circ icon="plus" size={38} kind="primary" /></Actions>} />
      <Pills items={RECIPE_TAGS} on={tag} onChange={setTag} />
      {tag === 0 ? (
        <Media photo={sug.photo as any} h={200} r={22}>
          <Shade />
          <Ov x={16} y={14} anchor="lb"><OvText>Suggestion · {missP ? `il te manque ${missP} g de protéines aujourd'hui` : `adaptée à ton objectif ${goalTag.toLowerCase()}`}</OvText><OvTitle size={24}>{sug.name}</OvTitle><OvText size={12.5} dim={0.85}>{st.kcal} kcal · P {st.p} g · {sug.minutes} min</OvText></Ov>
          <Ov x={14} y={14} anchor="rt"><Btn label="Voir" kind="white" size="sm" full={false} onPress={() => router.push({ pathname: "/nutrition/recette", params: { id: sug.id } })} /></Ov>
        </Media>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignContent: "flex-start" }}>{list.map((r) => <RecipeCard key={r.id} r={r} onPress={() => router.push({ pathname: "/nutrition/recette", params: { id: r.id } })} />)}</View>
      {!list.length ? <Sub>Touche l'étoile d'une recette pour la retrouver ici.</Sub> : null}
    </Page>
  );
}
