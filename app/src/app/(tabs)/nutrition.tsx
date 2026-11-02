import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Circ, Big, Label, Ring, Macros3, Media, Btn, Icon, MP } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useProfile, macros } from "../../store/profile";
import { useNutrition, nutri, getDay, dayKey, mealTotals, entryName, entryQty, entryNut, MEALS, MealKey, burnedToday } from "../../store/nutrition";
import { useWorkout } from "../../store/workout";

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
/** N01 · Nutrition — journal du jour */
export default function Nutrition() {
  const p = useProfile(); const n = useNutrition(); const { history } = useWorkout();
  const [offset, setOffset] = useState(0);
  const date = new Date(); date.setDate(date.getDate() + offset); const k = dayKey(date); const day = getDay(k);
  const target = macros(p); const kcal = target.kcal + n.kcalAdjust;
  const tot = mealTotals(Object.values(day.meals).flat()); const burned = offset === 0 ? burnedToday(history) : 0;
  const left = kcal + burned - tot.kcal; const pct = Math.min(100, Math.max(0, (tot.kcal / (kcal + burned)) * 100));
  const title = offset === 0 ? "Aujourd'hui" : offset === -1 ? "Hier" : offset === 1 ? "Demain" : JOURS[date.getDay()];
  const remainingP = Math.max(0, target.prot - tot.p);
  return (
    <Page hero withNav>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="back" size={38} kind="glass" onPress={() => setOffset(offset - 1)} />
        <Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>{title} · {JOURS[date.getDay()]} {date.getDate()}</Text>
        <Circ icon="chev" size={38} kind="glass" onPress={() => offset < 0 && setOffset(offset + 1)} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 22, paddingVertical: 4 }}>
        <View style={{ alignItems: "center", gap: 2 }}><Big v={tot.kcal.toLocaleString("fr-FR")} size={30} /><Label>mangées</Label></View>
        <Ring pct={pct} size={124} thick={11} color="#fff">
          <Text style={{ fontFamily: man(700), fontSize: 32, letterSpacing: -1.5, color: left < 0 ? C.red : C.txt }}>{Math.abs(left).toLocaleString("fr-FR")}</Text>
          <Text style={{ fontFamily: inter(400), fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{left < 0 ? "kcal en trop" : "kcal restantes"}</Text>
        </Ring>
        <View style={{ alignItems: "center", gap: 2 }}><Big v={String(burned)} size={30} /><Label>brûlées</Label></View>
      </View>
      <Macros3 p={tot.p} g={tot.g} l={tot.l} pg={target.prot} gg={target.gluc} lg={target.lip} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 4 }}>
        <Circ icon="search" size={52} label="Aliment" onPress={() => router.push({ pathname: "/nutrition/ajouter", params: { meal: "dejeuner", day: k } })} />
        <Circ icon="cam" size={52} kind="primary" label="Photo IA" onPress={() => router.push("/nutrition/photo")} />
        <Circ icon="copy" size={52} label="Scanner" onPress={() => router.push({ pathname: "/nutrition/scanner", params: { day: k } })} />
        <Circ icon="star" size={52} label="Recettes" onPress={() => router.push("/nutrition/recettes")} />
      </View>
      {MEALS.map((m) => { const es = day.meals[m.key]; const t = mealTotals(es); return (
        <View key={m.key}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 10, paddingBottom: 4 }}>
            <Media photo={m.photo as any} h={40} w={40} r={10} />
            <Text style={{ flex: 1, fontFamily: man(700), fontSize: 16, color: C.txt }}>{m.label}</Text>
            <Text style={{ fontFamily: man(700), fontSize: 15, color: C.txt }}>{t.kcal}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>kcal</Text>
            <Circ icon="plus" size={30} onPress={() => router.push({ pathname: "/nutrition/ajouter", params: { meal: m.key, day: k } })} />
          </View>
          {es.map((e) => (
            <Pressable key={e.id} onLongPress={() => nutri.remove(m.key, e.id, k)} onPress={() => e.foodId ? router.push({ pathname: "/nutrition/aliment", params: { id: e.foodId, meal: m.key, day: k, entry: e.id } }) : e.recipeId && router.push({ pathname: "/nutrition/recette", params: { id: e.recipeId } })}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 7, paddingLeft: 52, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, color: C.txt }} numberOfLines={1}>{entryName(e)}</Text>
              <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut, marginRight: 12 }}>{entryQty(e)}</Text>
              <Text style={{ width: 40, textAlign: "right", fontFamily: inter(600), fontSize: 13, color: C.txt }}>{entryNut(e).kcal}</Text>
            </Pressable>
          ))}
          {!es.length && m.key === "diner" && left > 0 ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut, paddingLeft: 52, paddingVertical: 6 }}>Suggestion : {left} kcal{remainingP ? `, ${remainingP} g de protéines` : ""} — appui long sur un aliment pour le retirer</Text> : null}
        </View>); })}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 14, color: C.txt, flexShrink: 0 }}>Eau  <Text style={{ fontFamily: man(700) }}>{day.water.toFixed(2).replace(".", ",").replace(/,?0+$/, "")} L</Text>  <Text style={{ fontSize: 12, color: C.mut }}>/ {String(n.waterGoal).replace(".", ",")} L</Text></Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => nutri.water(-0.25, k)} style={{ padding: 4 }}><Icon name="x" size={14} color={C.mut} /></Pressable>
        {Array.from({ length: 10 }).map((_, i) => <Pressable key={i} onPress={() => nutri.water((i + 1) * 0.25 - day.water, k)} style={{ width: 14, height: 20, borderRadius: 4, backgroundColor: i < day.water / 0.25 ? MP : "rgba(255,255,255,0.1)" }} />)}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}><Btn label="Objectifs" kind="secondary" size="sm" onPress={() => router.push("/nutrition/objectifs")} /></View>
        <View style={{ flex: 1 }}><Btn label="Analyse" kind="secondary" size="sm" onPress={() => router.push("/nutrition/analyse")} /></View>
        <View style={{ flex: 1 }}><Btn label="Planning" kind="secondary" size="sm" onPress={() => router.push("/nutrition/planning")} /></View>
        <View style={{ flex: 1 }}><Btn label="Courses" kind="secondary" size="sm" onPress={() => router.push("/nutrition/courses")} /></View>
      </View>
    </Page>
  );
}
