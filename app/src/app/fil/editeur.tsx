import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Btn, Avatar } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useFeed, feed } from "../../store/feed";

export const FILTERS: [string, string][] = [["Normal", "transparent"], ["Iron", "rgba(235,27,63,0.25)"], ["Noir", "rgba(0,0,0,0.35)"], ["Chrome", "rgba(120,160,255,0.2)"], ["Film", "rgba(255,180,80,0.2)"]];
export const SOUNDS: [string, string][] = [["son original", ""], ["Night Drive", "Kaelo"], ["Iron Mind", "Rvge"], ["Heavy Steps", "Mordan"], ["Last Rep", "Nova K"]];
/** F06/F07/F08 · Éditeur : filtre, musique (catalogue libre de droits), aperçu */
export default function Editeur() {
  const { drafts } = useFeed(); const insets = useSafeAreaInsets(); const [tab, setTab] = useState<"filtre" | "son">("filtre");
  useEffect(() => { if (!drafts) router.back(); }, [drafts]);
  if (!drafts) return <View style={{ flex: 1, backgroundColor: "#05060C" }} />;
  const src = drafts.uri ? { uri: drafts.uri } : IMG[(drafts.photo ?? "photo-gym") as keyof typeof IMG];
  return (
    <View style={{ flex: 1, backgroundColor: "#05060C" }}>
      <Image source={src as any} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      <View style={{ position: "absolute", inset: 0, backgroundColor: FILTERS[drafts.filter][1] } as any} />
      <View style={{ position: "absolute", top: insets.top + 14, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Circ icon="back" size={38} kind="glass" onPress={() => router.back()} /><Text style={{ fontFamily: inter(600), fontSize: 15, color: "#fff" }}>Éditeur</Text><Btn label="Suivant" kind="white" size="sm" full={false} onPress={() => router.push("/fil/publier")} /></View>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: Math.max(insets.bottom, 16) + 8, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>{(["filtre", "son"] as const).map((t) => <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: tab === t ? "#fff" : "rgba(255,255,255,0.14)" }}><Text style={{ fontFamily: inter(700), fontSize: 13, color: tab === t ? C.bg : "#fff" }}>{t === "filtre" ? "Filtres" : "Musique"}</Text></Pressable>)}</View>
        {tab === "filtre" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
            {FILTERS.map(([n, c], i) => <Pressable key={n} onPress={() => feed.setDraft({ ...drafts, filter: i })} style={{ alignItems: "center", gap: 5 }}><View style={{ width: 58, height: 58, borderRadius: 29, overflow: "hidden", borderWidth: drafts.filter === i ? 2 : 0, borderColor: "#fff", opacity: drafts.filter === i ? 1 : 0.8 }}><Image source={src as any} style={{ width: 58, height: 58 }} resizeMode="cover" /><View style={{ position: "absolute", inset: 0, backgroundColor: c } as any} /></View><Text style={{ fontFamily: inter(400), fontSize: 11, color: "#fff" }}>{n}</Text></Pressable>)}
          </ScrollView>
        ) : (
          <View style={{ marginHorizontal: 16, borderRadius: 20, backgroundColor: "rgba(12,14,26,0.9)", padding: 10 }}>
            {SOUNDS.map(([n, a]) => { const on = drafts.sound === n; return (
              <Pressable key={n} onPress={() => feed.setDraft({ ...drafts, sound: n })} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, paddingHorizontal: 6 }}>
                <Avatar ini={n.slice(0, 2).toUpperCase()} size={40} ring={on} /><View style={{ flex: 1 }}><Text style={{ fontFamily: inter(on ? 700 : 500), fontSize: 14, color: "#fff" }}>{n}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{a || "ta vidéo"} · libre de droits</Text></View>
                {on ? <Text style={{ fontFamily: inter(700), fontSize: 12, color: C.accent }}>choisi</Text> : null}
              </Pressable>); })}
          </View>
        )}
      </View>
    </View>
  );
}
