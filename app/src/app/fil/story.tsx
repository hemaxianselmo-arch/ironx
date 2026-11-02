import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Circ } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useFeed, feed, ago } from "../../store/feed";

/** F10 · Story : barres de progression, avance automatique, toucher pour passer */
export default function StoryView() {
  const { stories } = useFeed(); const insets = useSafeAreaInsets(); const [i, setI] = useState(0); const [pct, setPct] = useState(0);
  const s = stories[i];
  useEffect(() => { if (!s) return; feed.seen(s.id); setPct(0); const t = setInterval(() => setPct((v) => { if (v >= 100) { clearInterval(t); setTimeout(() => (i < stories.length - 1 ? setI(i + 1) : router.back()), 0); return 100; } return v + 2; }), 100); return () => clearInterval(t); }, [i]);
  useEffect(() => { if (!s) router.back(); }, [s]);
  if (!s) return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image source={s.uri ? { uri: s.uri } : IMG[s.photo as keyof typeof IMG]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      <Pressable style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "35%" }} onPress={() => setI(Math.max(0, i - 1))} />
      <Pressable style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "65%" }} onPress={() => (i < stories.length - 1 ? setI(i + 1) : router.back())} />
      <View style={{ position: "absolute", top: insets.top + 8, left: 10, right: 10, flexDirection: "row", gap: 4 }}>{stories.map((x, k) => <View key={x.id} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" }}><View style={{ width: k < i ? "100%" : k === i ? `${pct}%` : "0%", height: 3, backgroundColor: "#fff" }} /></View>)}</View>
      <View style={{ position: "absolute", top: insets.top + 20, left: 14, right: 14, flexDirection: "row", alignItems: "center", gap: 10 }}><Avatar ini={s.ini} size={36} ring /><Text style={{ flex: 1, fontFamily: inter(700), fontSize: 14, color: "#fff" }}>{s.user} <Text style={{ fontFamily: inter(400), color: "rgba(255,255,255,0.7)" }}>· {ago(s.at)}</Text></Text><Circ icon="x" size={34} kind="glass" onPress={() => router.back()} /></View>
      {s.caption ? <Text style={{ position: "absolute", left: 20, right: 20, bottom: 160, fontFamily: inter(700), fontSize: 22, color: "#fff", textAlign: "center", textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 6 }}>{s.caption}</Text> : null}
      <View style={{ position: "absolute", left: 14, right: 14, bottom: Math.max(insets.bottom, 16) + 10, flexDirection: "row", alignItems: "center", gap: 8 }}><View style={{ flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", justifyContent: "center", paddingHorizontal: 16 }}><Text style={{ fontFamily: inter(400), fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Répondre à {s.user}…</Text></View><Circ icon="star" size={40} kind="glass" /><Circ icon="share" size={40} kind="glass" /></View>
    </View>
  );
}
