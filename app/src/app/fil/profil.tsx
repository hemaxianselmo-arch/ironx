import React from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Avatar, Btn, Tabs, Media, Shade, Ov, OvText, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useFeed, fmtN } from "../../store/feed";
import { MEMBERS, gym, useGym } from "../../store/gym";

/** F13 · Profil d'un membre vu depuis le fil */
export default function ProfilMembre() {
  const { user } = useLocalSearchParams<{ user: string }>(); const { posts } = useFeed(); const g = useGym();
  const mine = posts.filter((p) => p.user === user); const m = MEMBERS.find((x) => x.name === user); const on = m ? g.following.includes(m.id) : false;
  const likes = mine.reduce((a, p) => a + p.likes, 0);
  return (
    <Page>
      <Top title={user ?? ""} onBack={() => router.back()} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <Avatar ini={mine[0]?.ini ?? (user ?? "IX").slice(0, 2).toUpperCase()} size={86} ring />
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>{[[String(mine.length), "posts"], [fmtN(40 + likes / 10), "abonnés"], [fmtN(likes), "j'aime"]].map(([v, k]) => <View key={k} style={{ alignItems: "center" }}><Text style={{ fontFamily: man(700), fontSize: 20, color: C.txt }}>{v}</Text><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{k}</Text></View>)}</View>
      </View>
      <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.soft }}>{m ? `${m.discipline} · ${m.bw} kg · couché ${m.bench} kg` : "Membre IRONX"}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}><View style={{ flex: 1 }}><Btn label={on ? "Suivi" : "Suivre"} kind={on ? "secondary" : "primary"} size="sm" onPress={() => m && gym.follow(m.id)} /></View><View style={{ flex: 1 }}><Btn label="Message" kind="secondary" size="sm" onPress={() => router.push("/salle/discussion")} /></View></View>
      <Tabs items={["Posts", "Séances", "Records"]} on={0} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{mine.map((p) => <View key={p.id} style={{ width: "32%", aspectRatio: 0.75 }}><Media photo={p.photo as any} h={160} r={10}><Shade /><Ov x={8} y={6} anchor="lb"><OvText size={11}>♥ {fmtN(p.likes)}</OvText></Ov></Media></View>)}</View>
      {!mine.length ? <Sub>Pas encore de post.</Sub> : null}
    </Page>
  );
}
