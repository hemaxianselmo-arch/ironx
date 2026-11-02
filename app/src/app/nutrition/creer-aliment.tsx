import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { Page, Top, Btn, Field, Pills, SelRow, Toggle } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { CATS } from "../../data/foods";
import { nutri } from "../../store/nutrition";

/** N06 · Créer un aliment (valeurs pour 100 g) */
export default function CreerAliment() {
  const [name, setName] = useState(""); const [brand, setBrand] = useState(""); const [portion, setPortion] = useState("100"); const [cat, setCat] = useState(0); const [share, setShare] = useState(true);
  const [v, setV] = useState({ kcal: "", p: "", g: "", l: "", fib: "" });
  const num = (s: string) => parseFloat(s.replace(",", ".")) || 0;
  const create = () => { if (!name.trim()) return; const id = "custom-" + Date.now();
    nutri.addFood({ id, name: name.trim(), brand: brand.trim() || undefined, cat: CATS[cat], kcal: Math.round(num(v.kcal) || (num(v.p) * 4 + num(v.g) * 4 + num(v.l) * 9)), p: num(v.p), g: num(v.g), l: num(v.l), fib: num(v.fib) || undefined, portion: Math.round(num(portion)) || 100, photo: "photo-meal-oats", custom: true });
    router.replace({ pathname: "/nutrition/aliment", params: { id } }); };
  const Cell = ({ k, label, color }: { k: keyof typeof v; label: string; color: string }) => (
    <View style={{ width: "48%", height: 56, borderRadius: 14, backgroundColor: C.surf, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 8 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} /><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 13, color: C.mut }}>{label}</Text>
      <TextInput value={v[k]} onChangeText={(t) => setV((x) => ({ ...x, [k]: t }))} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={C.mut} style={{ width: 60, textAlign: "right", fontFamily: man(700), fontSize: 16, color: C.txt, outlineStyle: "none" } as any} />
    </View>);
  return (
    <Page>
      <Top title="Nouvel aliment" onBack={() => router.back()} right={<Btn label="Créer" size="sm" full={false} onPress={create} />} />
      <Field label="Nom" value={name} onChange={setName} placeholder="Granola maison" />
      <View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><Field label="Marque" value={brand} onChange={setBrand} placeholder="—" /></View><View style={{ flex: 1 }}><Field label="Portion (g)" value={portion} onChange={setPortion} keyboard="number-pad" /></View></View>
      <View style={{ gap: 8 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Catégorie</Text><Pills items={CATS} on={cat} onChange={setCat} /></View>
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Pour 100 g (calories calculées si vides)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}><Cell k="kcal" label="Calories" color={C.txt} /><Cell k="p" label="Protéines" color="#4DB8FF" /><Cell k="g" label="Glucides" color="#FFB84D" /><Cell k="l" label="Lipides" color="#FF6B9A" /><Cell k="fib" label="Fibres" color="#3DDC84" /></View>
      </View>
      <SelRow title="Partager avec la communauté" s="après vérification · bientôt" right={<Toggle on={share} onChange={setShare} />} />
    </Page>
  );
}
