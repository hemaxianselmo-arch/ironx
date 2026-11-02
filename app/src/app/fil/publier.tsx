import React, { useState } from "react";
import { View, Text, TextInput, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Top, Btn, Pills, SelRow, Toggle, Media, Icon } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useFeed, feed } from "../../store/feed";
import { useWorkout, volume, fmtT, fmtVol } from "../../store/workout";
import { useProfile } from "../../store/profile";
import { useGym } from "../../store/gym";

/** F09 · Publier : légende, hashtags, séance liée, visibilité */
export default function Publier() {
  const { edit } = useLocalSearchParams<{ edit?: string }>(); const { drafts, posts } = useFeed(); const { history } = useWorkout(); const p = useProfile(); const g = useGym();
  const existing = edit ? posts.find((x) => x.id === edit) : undefined;
  const [caption, setCaption] = useState(existing?.caption ?? drafts?.caption ?? ""); const [scope, setScope] = useState(0); const [link, setLink] = useState(true); const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const last = history[0]; const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const SUGG = ["ironx", "musculation", "record", "hyrox", "powerlifting", "street", "course", "push", "legs"];
  const publish = () => {
    if (existing) { feed.remove(existing.id); feed.publish({ ...existing, caption, tags }); router.dismissAll?.(); router.replace("/(tabs)/fil"); return; }
    if (!drafts) return;
    feed.publish({ ini, user: (p.pseudo || "@" + (p.prenom || "moi").toLowerCase()).replace("@", ""), gym: g.gymName, caption, tags, seance: link && last ? `${last.name} · ${fmtT((last.endedAt ?? last.startedAt) - last.startedAt)} · ${fmtVol(volume(last))}` : "Séance libre", photo: drafts.photo ?? "photo-gym", uri: drafts.uri, sound: drafts.sound, scope: (["salle", "pourtoi", "abonnements"] as const)[scope] });
    router.dismissAll?.(); router.replace("/(tabs)/fil");
  };
  const src = existing ? (existing.uri ? { uri: existing.uri } : IMG[existing.photo as keyof typeof IMG]) : drafts?.uri ? { uri: drafts.uri } : IMG[(drafts?.photo ?? "photo-gym") as keyof typeof IMG];
  return (
    <Page>
      <Top title={existing ? "Modifier" : "Publier"} onBack={() => router.back()} right={<Btn label={existing ? "Enregistrer" : "Publier"} size="sm" full={false} onPress={publish} />} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ width: 96, height: 128, borderRadius: 14, overflow: "hidden" }}><Image source={src as any} style={{ width: "100%", height: "100%" }} resizeMode="cover" /></View>
        <TextInput value={caption} onChangeText={setCaption} multiline placeholder="Raconte ta séance…" placeholderTextColor={C.mut} style={{ flex: 1, minHeight: 128, borderRadius: 14, backgroundColor: C.surf, padding: 12, color: C.txt, fontFamily: inter(400), fontSize: 14, textAlignVertical: "top", outlineStyle: "none" } as any} />
      </View>
      <View style={{ gap: 8 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Hashtags</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{SUGG.map((t) => { const on = tags.includes(t); return <Text key={t} onPress={() => setTags((v) => (on ? v.filter((x) => x !== t) : [...v, t]))} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, fontFamily: inter(on ? 700 : 500), fontSize: 13, backgroundColor: on ? C.txt : "rgba(255,255,255,0.08)", color: on ? C.bg : C.txt }}>#{t}</Text>; })}</View></View>
      {!existing ? (<>
        <SelRow visual={<Icon name="Séance" size={24} color={C.txt} />} title="Lier ma dernière séance" s={last ? `${last.name} · ${fmtVol(volume(last))} · les chiffres s'affichent sous la vidéo` : "aucune séance enregistrée"} right={<Toggle on={link && !!last} onChange={setLink} />} />
        <View style={{ gap: 8 }}><Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>Visible par</Text><Pills items={["Ma salle", "Tout le monde", "Abonnés"]} on={scope} onChange={setScope} /></View>
        <SelRow visual={<Icon name="bell" size={24} color={C.txt} />} title="Son" s={drafts?.sound ?? "son original"} right={<Btn label="Changer" kind="secondary" size="sm" full={false} onPress={() => router.back()} />} />
      </>) : null}
    </Page>
  );
}
