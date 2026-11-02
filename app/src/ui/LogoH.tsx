import React from "react";
import { View, Image } from "react-native";
import { IMG } from "../theme/images";
/** Logo horizontal : emblème + mot-symbole (logo_h) */
export const LogoH = ({ h = 28 }: { h?: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: Math.round(h * 0.4) }}>
    <Image source={IMG["ironx-emblem"]} style={{ height: h, width: h }} resizeMode="contain" />
    <Image source={IMG["ironx-wordmark"]} style={{ height: Math.round(h * 0.5), width: Math.round(h * 0.5) * 3.9 }} resizeMode="contain" />
  </View>
);
