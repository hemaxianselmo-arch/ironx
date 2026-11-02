import React from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circ, Big, KV, Btn } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";
import { useWorkout, actions, fmtKg, exoName } from "../../store/workout";
import { e1rm } from "../../data/seed";

/** S10 · Record battu */
export default function Record() {
  const { lastPR } = useWorkout();
  const insets = useSafeAreaInsets();
  const close = () => { actions.clearPR(); router.back(); };
  if (!lastPR) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  const delta = lastPR.prevKg != null ? e1rm(lastPR.kg, lastPR.reps) - e1rm(lastPR.prevKg, lastPR.prevReps ?? 1) : null;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Image source={IMG["photo-portrait"]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      <LinearGradient colors={["rgba(12,14,26,0.2)", "rgba(12,14,26,0.9)", "rgba(12,14,26,0.97)"]} locations={[0, 0.6, 1]} style={{ position: "absolute", inset: 0 } as any} />
      <View style={{ position: "absolute", top: insets.top + 14, right: 16 }}><Circ icon="x" size={38} kind="glass" onPress={close} /></View>
      <View style={{ position: "absolute", left: 24, right: 24, bottom: Math.max(insets.bottom, 16) + 24, alignItems: "center", gap: 10 }}>
        <Image source={IMG["record"]} style={{ width: 150, height: 150 }} resizeMode="contain" />
        <Text style={{ fontFamily: inter(400), fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Nouveau record</Text>
        <Big v={`${fmtKg(lastPR.kg)} kg × ${lastPR.reps}`} size={46} />
        <Text style={{ fontFamily: inter(400), fontSize: 15, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>
          {exoName(lastPR.exoId)}{lastPR.prevKg != null ? ` · précédent ${fmtKg(lastPR.prevKg)} × ${lastPR.prevReps}` : " · premier record"}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: 10 }}>
          <KV k="1RM estimé" v={`${fmtKg(e1rm(lastPR.kg, lastPR.reps))} kg`} />
          <KV k="Progression" v={delta != null ? `+${fmtKg(Math.round(delta * 2) / 2)} kg` : "—"} />
          <KV k="Salle" v="3e" />
        </View>
        <View style={{ width: "100%", gap: 10 }}>
          <Btn label="Partager en story" kind="white" icon="share" onPress={close} />
          <Btn label="Continuer la séance" kind="secondary" onPress={close} />
        </View>
      </View>
    </View>
  );
}
