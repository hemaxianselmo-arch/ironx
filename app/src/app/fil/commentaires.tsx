import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Circ, Icon } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { useFeed, feed, ago } from "../../store/feed";
import { useProfile } from "../../store/profile";

/** F03 · Commentaires (feuille) */
export default function Commentaires() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { posts } = useFeed(); const p = useProfile(); const insets = useSafeAreaInsets(); const [txt, setTxt] = useState("");
  const post = posts.find((x) => x.id === id); const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  if (!post) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable style={{ flex: 1 }} onPress={() => router.back()} />
      <View style={{ height: "68%", borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: C.bg, paddingTop: 10, paddingHorizontal: 16 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 6 }} />
        <Text style={{ fontFamily: inter(700), fontSize: 15, color: C.txt, textAlign: "center", paddingBottom: 8 }}>{post.comments.length} commentaire{post.comments.length > 1 ? "s" : ""}</Text>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 2 }}>
          {post.comments.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 8, paddingLeft: c.reply ? 40 : 0 }}>
              <Avatar ini={c.ini} size={c.reply ? 26 : 32} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}><Text style={{ fontFamily: inter(700), color: C.txt }}>{c.user}</Text> · {ago(c.at)}</Text>
                <Text style={{ fontFamily: inter(400), fontSize: 14, lineHeight: 20, color: C.txt }}>{c.text}</Text>
                <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Répondre</Text>
              </View>
              <View style={{ alignItems: "center", gap: 2 }}><Icon name="star" size={16} color={C.mut} /><Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut }}>{c.likes}</Text></View>
            </View>))}
          {!post.comments.length ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut, textAlign: "center", paddingTop: 20 }}>Sois le premier à commenter.</Text> : null}
        </ScrollView>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingBottom: Math.max(insets.bottom, 12) + 6, borderTopWidth: 1, borderTopColor: C.line }}>
          <Avatar ini={ini} size={34} ring />
          <TextInput value={txt} onChangeText={setTxt} placeholder="Ajouter un commentaire…" placeholderTextColor={C.mut} onSubmitEditing={() => { feed.comment(post.id, txt, ini); setTxt(""); }} style={{ flex: 1, height: 42, borderRadius: 21, backgroundColor: C.surf, paddingHorizontal: 14, color: C.txt, fontFamily: inter(400), fontSize: 14, outlineStyle: "none" } as any} />
          <Circ icon="share" size={38} kind="primary" onPress={() => { feed.comment(post.id, txt, ini); setTxt(""); }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
