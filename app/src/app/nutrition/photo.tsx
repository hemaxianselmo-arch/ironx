import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Btn, Icon, Media, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { MealKey } from "../../store/nutrition";

/** N05 · Photo de l'assiette — prise de photo réelle ; l'analyse IA (Pro) sera branchée sur le serveur */
export default function Photo() {
  const { meal, day } = useLocalSearchParams<{ meal?: MealKey; day?: string }>(); const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const take = async () => { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ quality: 0.7 }); if (!r.canceled) setUri(r.assets[0].uri); };
  const pick = async () => { const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 }); if (!r.canceled) setUri(r.assets[0].uri); };
  return (
    <View style={{ flex: 1, backgroundColor: "#05060C" }}>
      {uri ? <Image source={{ uri }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" /> : <Media photo="photo-meal-chicken" h={900} r={0} style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: 0.5 }} />}
      <View style={{ position: "absolute", top: insets.top + 14, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Circ icon="x" size={38} kind="glass" onPress={() => router.back()} /><View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="bolt" size={14} color={C.accent} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: "#fff" }}>Analyse IA · Pro</Text></View><View style={{ width: 38 }} />
      </View>
      <View style={{ position: "absolute", left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 8, borderRadius: 22, padding: 16, backgroundColor: C.surf, gap: 12 }}>
        <Text style={{ fontFamily: man(700), fontSize: 20, color: C.txt }}>{uri ? "Photo prise" : "Photographie ton assiette"}</Text>
        <Sub>{uri ? "L'analyse automatique des aliments et des quantités arrive avec l'abonnement Pro (serveur en préparation). En attendant, ajoute les aliments à la main." : "L'IA reconnaîtra les aliments et estimera les quantités (± 10 %). Fonction Pro, branchée à la prochaine étape serveur."}</Sub>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Btn label={uri ? "Reprendre" : "Prendre la photo"} kind="secondary" icon="cam" size="md" onPress={take} /></View>
          <View style={{ flex: 1 }}><Btn label={uri ? "Ajouter à la main" : "Galerie"} kind="white" size="md" onPress={() => (uri ? router.replace({ pathname: "/nutrition/ajouter", params: { meal: meal ?? "dejeuner", day } }) : pick())} /></View>
        </View>
      </View>
    </View>
  );
}
