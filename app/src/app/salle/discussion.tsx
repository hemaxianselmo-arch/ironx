import React, { useRef, useState } from "react";
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Page, Top, Circ, Avatar, Icon } from "../../ui";
import { C, inter, PAD } from "../../theme/tokens";
import { useGym, gym } from "../../store/gym";
import { useProfile } from "../../store/profile";

const hm = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
/** G08 · Discussion de salle (locale jusqu'au serveur) */
export default function Discussion() {
  const g = useGym(); const p = useProfile(); const insets = useSafeAreaInsets(); const [txt, setTxt] = useState(""); const sv = useRef<any>(null);
  const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ paddingHorizontal: PAD, paddingTop: PAD + insets.top, gap: 10 }}>
        <Top title={g.gymName} sub="86 membres · 4 en ligne" right={<Circ icon="more" size={38} />} onBack={() => router.back()} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: C.surf }}><Icon name="bell" size={16} color={C.accent} /><Text style={{ flex: 1, fontFamily: inter(400), fontSize: 12.5, color: C.txt }}><Text style={{ fontFamily: inter(700) }}>Épinglé</Text> · Challenge couché samedi 8 nov, inscriptions ouvertes</Text><Icon name="chev" size={16} color={C.mut} /></View>
      </View>
      <ScrollView ref={sv} onContentSizeChange={() => sv.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ padding: PAD, gap: 10 }}>
        <Text style={{ fontFamily: inter(400), fontSize: 11, color: C.mut, textAlign: "center" }}>Aujourd'hui</Text>
        {g.messages.map((m) => (
          <View key={m.id} style={{ flexDirection: m.me ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
            {!m.me ? <Avatar ini={m.ini} size={28} /> : null}
            <View style={{ maxWidth: "74%", paddingVertical: 9, paddingHorizontal: 12, borderRadius: 18, borderBottomRightRadius: m.me ? 4 : 18, borderBottomLeftRadius: m.me ? 18 : 4, backgroundColor: m.me ? C.accent : C.surf }}>
              {!m.me ? <Text style={{ fontFamily: inter(700), fontSize: 11, color: C.mut, marginBottom: 2 }}>{m.from} · {hm(m.at)}</Text> : null}
              <Text style={{ fontFamily: inter(400), fontSize: 14, lineHeight: 20, color: m.me ? "#fff" : C.txt }}>{m.text}</Text>
              {m.me ? <Text style={{ fontFamily: inter(400), fontSize: 10, color: "rgba(255,255,255,0.7)", textAlign: "right", marginTop: 2 }}>{hm(m.at)}</Text> : null}
            </View>
          </View>))}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: PAD, paddingBottom: Math.max(insets.bottom, 12) + 8, paddingTop: 6 }}>
        <Circ icon="cam" size={40} />
        <TextInput value={txt} onChangeText={setTxt} placeholder="Écrire à la salle…" placeholderTextColor={C.mut} onSubmitEditing={() => { gym.send(txt, ini); setTxt(""); }} style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: C.surf, paddingHorizontal: 16, color: C.txt, fontFamily: inter(400), fontSize: 14, outlineStyle: "none" } as any} />
        <Circ icon="share" size={40} kind="primary" onPress={() => { gym.send(txt, ini); setTxt(""); }} />
      </View>
    </KeyboardAvoidingView>
  );
}
