import React from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useFeed, feed } from "../../store/feed";
import { gym, MEMBERS } from "../../store/gym";

/** F14 · Options d'un post */
export default function Options() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { posts } = useFeed(); const insets = useSafeAreaInsets(); const post = posts.find((x) => x.id === id);
  if (!post) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  const member = MEMBERS.find((m) => m.name === post.user);
  const rows: [any, string, string, () => void, boolean?][] = post.me
    ? [["edit", "Modifier la légende", "", () => router.replace({ pathname: "/fil/publier", params: { edit: post.id } })], ["copy", "Copier le lien", `ironx.app/p/${post.id.slice(-4)}`, () => router.back()], ["x", "Supprimer le post", "définitif", () => { feed.remove(post.id); router.back(); }, true]]
    : [["star", "Enregistrer", "dans tes favoris", () => router.back()], ["copy", "Copier le lien", `ironx.app/p/${post.id.slice(-4)}`, () => router.back()], ["Salle", member ? "Suivre / ne plus suivre " + post.user : "Suivre", "", () => { if (member) gym.follow(member.id); router.back(); }], ["bell", "Moins de contenu comme ça", "", () => router.back()], ["x", "Signaler", "contenu inapproprié, spam", () => router.back(), true]];
  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <Pressable style={{ flex: 1 }} onPress={() => router.back()} />
      <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: C.bg, paddingTop: 10, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 6 }} />
        {rows.map(([i, t, s, f, danger]) => (
          <Pressable key={t} onPress={f} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Icon name={i} size={22} color={danger ? C.red : C.txt} w={1.8} /><View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(400), fontSize: 15, color: danger ? C.red : C.txt }}>{t}</Text>{s ? <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>{s}</Text> : null}</View>
          </Pressable>))}
      </View>
    </View>
  );
}
