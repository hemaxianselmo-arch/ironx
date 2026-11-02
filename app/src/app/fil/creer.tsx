import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Btn, Pills, Media, Seg } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter, man } from "../../theme/tokens";
import { feed } from "../../store/feed";

const PHOTOS = ["photo-sled", "photo-w-squat", "photo-chalk", "photo-burpees", "photo-w-pullup", "photo-run-rain", "photo-wallball", "photo-w-rower", "photo-class", "photo-box", "photo-meal-salmon", "photo-smoothie"];
/** F05 · Créer : choisir un média (galerie du téléphone, caméra, ou visuels de démonstration) */
export default function Creer() {
  const insets = useSafeAreaInsets(); const [sel, setSel] = useState<{ uri?: string; photo?: string } | null>(null); const [mode, setMode] = useState(0);
  const pick = async () => { const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ["images", "videos"] as any }); if (!r.canceled) setSel({ uri: r.assets[0].uri }); };
  const cam = async () => { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ quality: 0.8 }); if (!r.canceled) setSel({ uri: r.assets[0].uri }); };
  const next = () => { if (!sel) return; feed.setDraft({ ...sel, caption: "", sound: "son original", filter: 0 }); router.push(mode === 1 ? "/fil/story-creer" : "/fil/editeur"); };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 }}><Circ icon="x" size={38} onPress={() => router.back()} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: C.txt }}>Nouveau</Text><Btn label="Suivant" kind={sel ? "white" : "secondary"} size="sm" full={false} onPress={next} /></View>
      <View style={{ margin: 16, marginBottom: 8, height: 300, borderRadius: 22, overflow: "hidden", backgroundColor: C.surf, alignItems: "center", justifyContent: "center" }}>
        {sel?.uri ? <Image source={{ uri: sel.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : sel?.photo ? <Image source={IMG[sel.photo as keyof typeof IMG]} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>Choisis une photo ou une vidéo</Text>}
      </View>
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <Seg items={["Post", "Story"]} on={mode} onChange={setMode} />
        <View style={{ flexDirection: "row", gap: 8 }}><View style={{ flex: 1 }}><Btn label="Galerie" kind="secondary" icon="copy" size="md" onPress={pick} /></View><View style={{ flex: 1 }}><Btn label="Caméra" kind="secondary" icon="cam" size="md" onPress={cam} /></View></View>
        <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Ou un visuel IRONX :</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, paddingHorizontal: 16, paddingTop: 8 }}>
        {PHOTOS.map((ph) => <Pressable key={ph} onPress={() => setSel({ photo: ph })} style={{ width: "23.5%", aspectRatio: 1, borderRadius: 8, overflow: "hidden", borderWidth: sel?.photo === ph ? 2 : 0, borderColor: "#fff" }}><Image source={IMG[ph as keyof typeof IMG]} style={{ width: "100%", height: "100%" }} resizeMode="cover" /></Pressable>)}
      </View>
    </View>
  );
}
