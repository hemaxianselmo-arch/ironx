import React from "react";
import { View, Image } from "react-native";
import { IMG, ImgName } from "../theme/images";
import { C } from "../theme/tokens";

export const GROUPS: Record<"front" | "back", Record<string, string>> = {
  front: { pecs: "pectoraux", delts: "epaules", biceps: "biceps", abs: "abdos", obliques: "obliques", quads: "quadriceps", calves: "mollets", forearms: "avant-bras", adductors: "adducteurs", tibialis: "tibiaux" },
  back: { lats: "dorsaux", traps: "trapezes", rear_delts: "deltoides", triceps: "triceps", lower_back: "lombaires", glutes: "fessiers", hamstrings: "ischios", calves: "mollets" },
};
export type Highlight = Record<string, number>;

/** Figure anatomique grise + surbrillance rouge par muscle (kit.body) */
export function Figure({ view = "front", hl = {}, h = 240 }: { view?: "front" | "back"; hl?: Highlight; h?: number }) {
  const key = view === "front" ? "face" : "dos";
  const w = Math.round(h * 0.62);
  const abs = { position: "absolute", left: 0, top: 0, width: w, height: h } as const;
  return (
    <View style={{ width: w, height: h }}>
      <Image source={IMG[("figure-" + key) as ImgName]} style={abs} resizeMode="contain" />
      {Object.entries(hl).map(([g, v]) => {
        const f = GROUPS[view][g];
        if (!f || v <= 0) return null;
        return <Image key={g} source={IMG[(`figure-${key}-${f}`) as ImgName]} style={[abs, { opacity: Math.min(1, 0.4 + 0.6 * v) }]} resizeMode="contain" />;
      })}
    </View>
  );
}
/** Vignette exercice : mini-figure dans une tuile (exo_thumb) */
export const ExoThumb = ({ hl, view = "front", size = 52 }: { hl: Highlight; view?: "front" | "back"; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: 14, backgroundColor: C.surf, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <Figure view={view} hl={hl} h={size + 8} />
  </View>
);
