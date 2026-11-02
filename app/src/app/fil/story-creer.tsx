import React, { useState } from "react";
import { View, Text, Image, TextInput } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Btn } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useFeed, feed } from "../../store/feed";
import { useProfile } from "../../store/profile";
import { useWorkout, volume, fmtVol } from "../../store/workout";

/** F11 · Créer une story : texte sur la photo, sticker séance, publication */
export default function StoryCreer() {
  const { drafts } = useFeed(); const p = useProfile(); const { history } = useWorkout(); const insets = useSafeAreaInsets(); const [txt, setTxt] = useState(""); const [uri, setUri] = useState<string | undefined>(drafts?.uri);
  const photo = drafts?.photo ?? "photo-deadlift"; const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase(); const last = history[0];
  const cam = async () => { const r = await ImagePicker.launchCameraAsync({ quality: 0.8 }); if (!r.canceled) setUri(r.assets[0].uri); };
  const publish = () => { feed.addStory({ ini, user: p.pseudo?.replace("@", "") || "toi", photo, uri, caption: txt || undefined }); router.dismissAll?.(); router.replace("/(tabs)/fil"); };
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image source={uri ? { uri } : IMG[photo as keyof typeof IMG]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      <View style={{ position: "absolute", top: insets.top + 14, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}><Circ icon="x" size={38} kind="glass" onPress={() => router.back()} /><View style={{ flexDirection: "row", gap: 8 }}><Circ icon="cam" size={38} kind="glass" onPress={cam} /><Circ icon="edit" size={38} kind="glass" /></View></View>
      <TextInput value={txt} onChangeText={setTxt} placeholder="Ajoute un texte" placeholderTextColor="rgba(255,255,255,0.7)" style={{ position: "absolute", left: 20, right: 20, top: "40%", fontFamily: inter(700), fontSize: 26, color: "#fff", textAlign: "center", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 6, outlineStyle: "none" } as any} />
      {last ? <View style={{ position: "absolute", left: 20, bottom: 150, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.6)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}><Text style={{ fontFamily: inter(700), fontSize: 13, color: "#fff" }}>{last.name} · {fmtVol(volume(last))}</Text><Text style={{ fontFamily: inter(400), fontSize: 11, color: "rgba(255,255,255,0.8)" }}>sticker séance IRONX</Text></View> : null}
      <View style={{ position: "absolute", left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 10, flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><Btn label="Ma salle" kind="secondary" size="md" onPress={publish} /></View><View style={{ flex: 1 }}><Btn label="Publier la story" kind="white" size="md" icon="share" onPress={publish} /></View></View>
    </View>
  );
}
