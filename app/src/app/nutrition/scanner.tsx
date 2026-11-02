import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Btn, Media, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { Food } from "../../data/foods";
import { nutri, foodOf, MealKey, dayKey, allFoods } from "../../store/nutrition";

/** Recherche Open Food Facts par code-barres (réseau requis) */
async function lookup(code: string): Promise<Food | null> {
  const local = allFoods().find((f) => f.barcode === code); if (local) return local;
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_quantity,image_front_small_url,nutriscore_grade`);
    const j = await r.json(); if (j.status !== 1) return null; const p = j.product; const nu = p.nutriments ?? {};
    const kcal = nu["energy-kcal_100g"] ?? (nu["energy_100g"] ? Math.round(nu["energy_100g"] / 4.184) : 0);
    return { id: "off-" + code, name: p.product_name || "Produit", brand: p.brands?.split(",")[0], cat: "Épicerie", kcal: Math.round(kcal), p: +(nu.proteins_100g ?? 0), g: +(nu.carbohydrates_100g ?? 0), l: +(nu.fat_100g ?? 0), fib: nu.fiber_100g ? +nu.fiber_100g : undefined, portion: Math.round(+(p.serving_quantity ?? 100)) || 100, photo: "photo-meal-oats", barcode: code, custom: true };
  } catch { return null; }
}
/** N04 · Scanner un code-barres */
export default function Scanner() {
  const { meal, day } = useLocalSearchParams<{ meal?: MealKey; day?: string }>(); const insets = useSafeAreaInsets();
  const [perm, ask] = useCameraPermissions(); const [code, setCode] = useState(""); const [found, setFound] = useState<Food | null | "none">(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (perm && !perm.granted && perm.canAskAgain) ask(); }, [perm]);
  const search = async (c: string) => { if (!c || busy) return; setBusy(true); setCode(c); const f = await lookup(c); setFound(f ?? "none"); setBusy(false); };
  const add = () => { if (!found || found === "none") return; if (!foodOf(found.id)) nutri.addFood(found); nutri.add(meal ?? "dejeuner", { foodId: found.id, grams: found.portion }, day ?? dayKey()); router.back(); };
  const cam = perm?.granted && Platform.OS !== "web";
  return (
    <View style={{ flex: 1, backgroundColor: "#05060C" }}>
      {cam ? <CameraView style={{ position: "absolute", inset: 0 } as any} facing="back" barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"] }} onBarcodeScanned={(e) => !found && search(e.data)} /> : <Media photo="photo-fridge" h={900} r={0} style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: 0.35 }} />}
      <View style={{ position: "absolute", top: insets.top + 14, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="x" size={38} kind="glass" onPress={() => router.back()} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: "#fff" }}>Scanner</Text><View style={{ width: 38 }} />
      </View>
      <View style={{ position: "absolute", left: 45, top: 200, width: 300, height: 200 }}>
        {[["left", "top"], ["right", "top"], ["left", "bottom"], ["right", "bottom"]].map(([x, y]) => <View key={x + y} style={{ position: "absolute", [x]: 0, [y]: 0, width: 36, height: 36, [`border${x[0].toUpperCase() + x.slice(1)}Width`]: 3, [`border${y[0].toUpperCase() + y.slice(1)}Width`]: 3, borderColor: "#fff", [`border${y[0].toUpperCase() + y.slice(1)}${x[0].toUpperCase() + x.slice(1)}Radius`]: 10 } as any} />)}
        <View style={{ position: "absolute", left: 10, right: 10, top: 98, height: 2, backgroundColor: C.accent, opacity: 0.9 }} />
      </View>
      <Text style={{ position: "absolute", top: 430, left: 0, right: 0, textAlign: "center", fontFamily: inter(400), fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{cam ? "Vise le code-barres · Open Food Facts + base IRONX" : perm && !perm.granted ? "Autorise l'appareil photo dans les réglages, ou saisis le code ci-dessous" : "Saisis le code-barres ci-dessous"}</Text>
      <View style={{ position: "absolute", left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 8, borderRadius: 22, padding: 14, backgroundColor: C.surf, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput value={code} onChangeText={setCode} placeholder="Code-barres (ex. 3017620422003)" placeholderTextColor={C.mut} keyboardType="number-pad" onSubmitEditing={() => search(code)} style={{ flex: 1, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 14, color: C.txt, fontFamily: inter(400), fontSize: 14, outlineStyle: "none" } as any} />
          <Btn label={busy ? "…" : "Chercher"} kind="white" size="md" full={false} onPress={() => search(code)} />
        </View>
        {found && found !== "none" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Media photo={found.photo as any} h={52} w={52} r={14} />
            <View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(700), fontSize: 15, color: C.txt }} numberOfLines={1}>{found.name}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{found.brand ?? "—"} · {found.barcode} · P {found.p} · G {found.g} · L {found.l} / 100 g</Text></View>
            <Text style={{ fontFamily: man(700), fontSize: 16, color: C.txt }}>{found.kcal} <Text style={{ fontSize: 11, color: C.mut }}>kcal / 100 g</Text></Text>
          </View>
        ) : null}
        {found === "none" ? <Sub>Produit introuvable. Tu peux le créer manuellement.</Sub> : null}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Btn label="Créer l'aliment" kind="secondary" size="md" onPress={() => router.push("/nutrition/creer-aliment")} /></View>
          <View style={{ flex: 1 }}><Btn label={found && found !== "none" ? `Ajouter · ${found.portion} g` : "Ajouter"} size="md" onPress={add} /></View>
        </View>
      </View>
    </View>
  );
}
