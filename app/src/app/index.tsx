import React from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Btn } from "../ui";
import { IMG } from "../theme/images";
import { C, inter, man } from "../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** D01 · Bienvenue — photo plein écran, logo, tagline, deux boutons */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 16) + 20;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Image source={IMG["photo-portrait"]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" } as any} resizeMode="cover" />
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" }} />
      <LinearGradient colors={["rgba(12,14,26,0.1)", "rgba(12,14,26,0.2)", "rgba(12,14,26,0.95)"]} locations={[0, 0.4, 0.75]} style={{ position: "absolute", inset: 0 } as any} />

      <View style={{ position: "absolute", top: 150, left: 0, right: 0, alignItems: "center" }}>
        <Image source={IMG["ironx-full"]} style={{ width: 210, height: 209 }} resizeMode="contain" />
      </View>

      <View style={{ position: "absolute", left: 24, right: 24, bottom: bottom + 200, alignItems: "center" }}>
        <Text style={{ fontFamily: man(500), fontSize: 19, letterSpacing: -0.3, lineHeight: 24, color: C.txt, textAlign: "center" }}>
          Le progrès, c'est maintenant<Text style={{ color: C.accent }}>.</Text>
        </Text>
      </View>

      <View style={{ position: "absolute", left: 24, right: 24, bottom, gap: 10 }}>
        <Btn label="Créer un compte" kind="white" onPress={() => router.push("/onboarding/compte")} />
        <Btn label="Se connecter" kind="secondary" onPress={() => router.replace("/(tabs)")} />
        <Text style={{ fontFamily: inter(400), fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 15 }}>
          En continuant, tu acceptes les conditions d'utilisation et la politique de confidentialité.
        </Text>
      </View>
    </View>
  );
}
