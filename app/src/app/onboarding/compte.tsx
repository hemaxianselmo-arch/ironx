import React from "react";
import { router } from "expo-router";
import { Page, Top, H1, Sub, Btn } from "../../ui";
import { View } from "react-native";
export default function Compte() {
  return (
    <Page>
      <Top onBack={() => router.back()} />
      <View style={{ gap: 8, paddingTop: 6 }}><H1 size={28}>Crée ton compte</H1><Sub>30 secondes. Gratuit, sans publicité, tes données restent à toi.</Sub></View>
      <Btn label="Continuer" onPress={() => router.replace("/(tabs)")} />
    </Page>
  );
}
