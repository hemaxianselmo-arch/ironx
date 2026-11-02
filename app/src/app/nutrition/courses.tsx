import React, { useState } from "react";
import { View, Text, Pressable, TextInput, Share } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Media, Shade, Ov, OvText, Pills, CheckCircle, Btn, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useNutrition, nutri } from "../../store/nutrition";

const CATS = ["Tout", "Protéines", "Féculents", "Légumes", "Épicerie"];
/** N12 · Liste de courses */
export default function Courses() {
  const n = useNutrition(); const [f, setF] = useState(0); const [newItem, setNewItem] = useState("");
  const list = n.shopping.filter((x) => f === 0 || x.cat === CATS[f]).sort((a, b) => Number(a.done) - Number(b.done));
  const planned = Object.keys(n.planner).length;
  const send = () => Share.share({ message: "Courses IRONX :\n" + n.shopping.filter((x) => !x.done).map((x) => `- ${x.name} · ${x.qty}`).join("\n") }).catch(() => {});
  return (
    <Page>
      <Top title="Courses" sub={`${n.shopping.filter((x) => !x.done).length} article${n.shopping.length > 1 ? "s" : ""} · depuis tes recettes et ton planning`} right={<Circ icon="share" size={38} onPress={send} />} onBack={() => router.back()} />
      <Media photo="photo-fridge" h={110} r={18}><Shade /><Ov x={14} y={10} anchor="lb"><Text style={{ fontFamily: man(700), fontSize: 16, color: "#fff" }}>Meal prep</Text><OvText>{planned ? `${planned} jour${planned > 1 ? "s" : ""} planifié${planned > 1 ? "s" : ""} · ajoute les recettes aux courses depuis le planning` : "Planifie ta semaine pour générer la liste"}</OvText></Ov></Media>
      <Pills items={CATS} on={f} onChange={setF} />
      {list.map((x) => (
        <Pressable key={x.id} onPress={() => nutri.shopToggle(x.id)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <CheckCircle on={x.done} /><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 15, color: x.done ? C.mut : C.txt, textDecorationLine: x.done ? "line-through" : "none" }}>{x.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{x.qty}</Text>
        </Pressable>))}
      {!list.length ? <Sub>Liste vide. Ouvre une recette et touche « Aux courses », ou ajoute un article ci-dessous.</Sub> : null}
      <View style={{ flexDirection: "row", gap: 8, paddingTop: 6 }}>
        <TextInput value={newItem} onChangeText={setNewItem} placeholder="Ajouter un article" placeholderTextColor={C.mut} onSubmitEditing={() => { if (newItem.trim()) { nutri.shopAdd([{ name: newItem.trim(), qty: "", cat: "Épicerie" }]); setNewItem(""); } }} style={{ flex: 1, height: 46, borderRadius: 23, backgroundColor: C.surf, paddingHorizontal: 16, color: C.txt, fontFamily: inter(400), fontSize: 14, outlineStyle: "none" } as any} />
        <Btn label="Ajouter" kind="secondary" size="md" full={false} onPress={() => { if (newItem.trim()) { nutri.shopAdd([{ name: newItem.trim(), qty: "", cat: "Épicerie" }]); setNewItem(""); } }} />
      </View>
      {n.shopping.some((x) => x.done) ? <Btn label="Retirer les articles cochés" kind="secondary" size="sm" onPress={nutri.shopClearDone} /> : null}
    </Page>
  );
}
