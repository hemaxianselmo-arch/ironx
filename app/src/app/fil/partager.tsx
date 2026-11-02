import React from "react";
import { View, Text, Pressable, ScrollView, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Avatar, Circ, Media } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useFeed } from "../../store/feed";
import { MEMBERS } from "../../store/gym";

/** F04 · Partager (feuille) */
export default function Partager() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { posts } = useFeed(); const insets = useSafeAreaInsets(); const post = posts.find((x) => x.id === id);
  if (!post) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  const link = `ironx.app/p/${post.id.slice(-4)}`;
  const ext = () => Share.share({ message: `${post.user} · ${post.seance}\n${post.caption}\nhttps://${link}` }).catch(() => {});
  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <Pressable style={{ flex: 1 }} onPress={() => router.back()} />
      <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: C.bg, paddingTop: 10, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16) + 8, gap: 14 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center" }} />
        <Search ph="Envoyer à…" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }} style={{ flexGrow: 0 }}>{MEMBERS.map((m) => <Pressable key={m.id} onPress={() => router.back()} style={{ alignItems: "center", gap: 6, width: 64 }}><Avatar ini={m.ini} size={56} ring={m.weekSessions >= 3} /><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.soft }} numberOfLines={1}>{m.name}</Text></Pressable>)}</ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }} style={{ flexGrow: 0 }}>
          {([["cam", "Story", () => router.replace("/fil/story-creer")], ["Salle", "Ma salle", () => router.replace("/salle/discussion")], ["copy", "Copier", () => router.back()], ["share", "Autres", ext], ["x", "Signaler", () => router.back()]] as [any, string, () => void][]).map(([i, n, f]) => <Pressable key={n} onPress={f} style={{ alignItems: "center", gap: 6, width: 64 }}><Circ icon={i} size={56} /><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.soft }}>{n}</Text></Pressable>)}
        </ScrollView>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, backgroundColor: C.surf }}><Media photo={post.photo as any} h={44} w={44} r={10} /><View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(600), fontSize: 13.5, color: C.txt }}>{post.user} · {post.seance.split(" · ")[0]}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{link}</Text></View></View>
      </View>
    </View>
  );
}
