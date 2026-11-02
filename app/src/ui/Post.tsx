import React from "react";
import { View, Text, Image, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Circ } from "./Controls";
import { Icon, IconName } from "./Icon";
import { IMG } from "../theme/images";
import { C, inter, man } from "../theme/tokens";
import { Post, feed, fmtN } from "../store/feed";

const SH = { textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } } as const;
function Rail({ icon, label, on, onPress }: { icon: IconName; label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", gap: 3, marginBottom: 10 }}>
      <View style={{ width: 46, height: 46, alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={30} color={on ? C.accent : "#fff"} w={2} /></View>
      <Text style={[{ fontFamily: inter(600), fontSize: 11.5, color: "#fff" }, SH]}>{label}</Text>
    </Pressable>
  );
}
/** Post plein écran façon TikTok (post_full) */
export function PostFull({ p, h, topInset, onComments, onShare, onProfile, onOptions, ini }: { p: Post; h: number; topInset: number; onComments: () => void; onShare: () => void; onProfile: () => void; onOptions: () => void; ini: string }) {
  return (
    <View style={{ height: h, width: "100%", backgroundColor: "#0C0E1A" }}>
      {p.uri ? <Image source={{ uri: p.uri }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" /> : <Image source={IMG[p.photo as keyof typeof IMG]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />}
      <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, height: "40%" }} />
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" }} />
      <View style={{ position: "absolute", right: 10, bottom: 150, alignItems: "center" }}>
        <Pressable onPress={onProfile} style={{ marginBottom: 14 }}><Avatar ini={p.ini} size={44} ring /><View style={{ position: "absolute", left: 13, bottom: -8 }}><Circ icon="plus" size={18} kind="primary" /></View></Pressable>
        <Rail icon="star" label={fmtN(p.likes)} on={p.liked} onPress={() => feed.like(p.id)} />
        <Rail icon="Fil" label={String(p.comments.length)} onPress={onComments} />
        <Rail icon="trophy" label={p.bravoed ? "Bravo !" : "Bravo"} on={p.bravoed} onPress={() => feed.bravo(p.id)} />
        <Rail icon="share" label="Partager" onPress={onShare} />
        <Rail icon="more" label="" onPress={onOptions} />
      </View>
      <View style={{ position: "absolute", left: 14, right: 80, bottom: 104, gap: 6 }}>
        <Pressable onPress={onProfile} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ gap: 2 }}><Text style={[{ fontFamily: inter(700), fontSize: 15, color: "#fff" }, SH]}>{p.user}</Text><Text style={[{ fontFamily: inter(400), fontSize: 12, color: "rgba(255,255,255,0.8)" }, SH]}>{p.gym}</Text></View>
        </Pressable>
        <Text style={[{ fontFamily: inter(400), fontSize: 14, lineHeight: 20, color: "#fff", maxWidth: 270 }, SH]}>{p.caption} <Text style={{ fontFamily: inter(700) }}>{p.tags.map((t) => "#" + t).join(" ")}</Text></Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="Séance" size={14} color="#fff" /><Text style={[{ fontFamily: inter(400), fontSize: 12, color: "rgba(255,255,255,0.85)" }, SH]}>{p.seance}</Text></View>
        <Text style={{ fontFamily: inter(400), fontSize: 11, color: "rgba(255,255,255,0.6)" }}>♪ {p.sound} · {p.user}</Text>
      </View>
    </View>
  );
}
