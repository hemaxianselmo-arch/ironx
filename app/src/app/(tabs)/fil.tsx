import React, { useRef, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostFull, Circ } from "../../ui";
import { C, inter} from "../../theme/tokens";
import { useFeed, Post } from "../../store/feed";
import { useProfile } from "../../store/profile";

const TABS: [string, Post["scope"] | "all"][] = [["Ma salle", "salle"], ["Pour toi", "all"], ["Abonnements", "abonnements"]];
/** F01/F02 · Fil plein écran, défilement vertical par page */
export default function Fil() {
  const { posts } = useFeed(); const p = useProfile(); const insets = useSafeAreaInsets(); const [tab, setTab] = useState(1); const [h, setH] = useState(0);
  const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const list = posts.filter((x) => TABS[tab][1] === "all" || x.scope === TABS[tab][1] || x.me);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }} onLayout={(e) => setH(Math.round(e.nativeEvent.layout.height))}>
      {h > 0 ? <FlatList data={list} keyExtractor={(x) => x.id} pagingEnabled showsVerticalScrollIndicator={false} snapToInterval={h} decelerationRate="fast" getItemLayout={(_, i) => ({ length: h, offset: h * i, index: i })}
        renderItem={({ item }) => <PostFull p={item} h={h} topInset={insets.top} ini={ini} onComments={() => router.push({ pathname: "/fil/commentaires", params: { id: item.id } })} onShare={() => router.push({ pathname: "/fil/partager", params: { id: item.id } })} onProfile={() => router.push({ pathname: "/fil/profil", params: { user: item.user } })} onOptions={() => router.push({ pathname: "/fil/options", params: { id: item.id } })} />}
        ListEmptyComponent={<View style={{ height: h, alignItems: "center", justifyContent: "center", padding: 32 }}><Text style={{ fontFamily: inter(400), fontSize: 14, color: C.mut, textAlign: "center" }}>Rien ici pour l'instant. Suis des membres de ta salle ou publie ta séance.</Text></View>} /> : null}
      <View style={{ position: "absolute", top: insets.top + 14, left: 16, right: 100, flexDirection: "row", justifyContent: "center", gap: 18, alignItems: "center" }}>
        {TABS.map(([t], i) => <Pressable key={t} onPress={() => setTab(i)}><Text style={{ fontFamily: inter(i === tab ? 700 : 500), fontSize: 15, color: i === tab ? "#fff" : "rgba(255,255,255,0.65)", borderBottomWidth: i === tab ? 2 : 0, borderBottomColor: "#fff", paddingBottom: 4, textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 4 }}>{t}</Text></Pressable>)}
      </View>
      <View style={{ position: "absolute", top: insets.top + 12, right: 12, flexDirection: "row", gap: 8 }}><Circ icon="cam" size={34} kind="glass" onPress={() => router.push("/fil/creer")} /><Circ icon="search" size={34} kind="glass" onPress={() => router.push("/seance/bibliotheque")} /></View>
      <View style={{ position: "absolute", left: 16, top: insets.top + 60 }}><Pressable onPress={() => router.push("/fil/story")} style={{ alignItems: "center", gap: 4 }}><View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, borderColor: C.accent, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" }}><Text style={{ fontFamily: inter(700), fontSize: 13, color: "#fff" }}>{ini}</Text></View><Text style={{ fontFamily: inter(500), fontSize: 10.5, color: "#fff" }}>Stories</Text></Pressable></View>
    </View>
  );
}
