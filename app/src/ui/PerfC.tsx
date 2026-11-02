// Composants et calculs partagés du module Performances — lot C (classements, rapport, forme, régularité, année, bloc, semaine, défis)
import React from "react";
import { View, Text, Pressable, Image, ScrollView, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, PAD, inter, man, accentA } from "../theme/tokens";
import { IMG, ImgName } from "../theme/images";
import { Icon, IconName } from "./Icon";
import { Btn } from "./Controls";
import { Session, volume } from "../store/workout";
import { getActivities } from "../store/activities";

export const PERFC_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const PERFC_MOIS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const PERFC_JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const perfcDate = (t?: number) => { if (!t) return "—"; const d = new Date(t); return `${d.getDate()} ${PERFC_MOIS[d.getMonth()]}`; };
export const perfcKg = (v: number) => String(Math.round(v * 2) / 2).replace(".", ",");
export const perfcNum = (v: number, dec = 1) => v.toFixed(dec).replace(".", ",");
export const perfcTonnes = (kg: number) => (kg >= 100000 ? String(Math.round(kg / 1000)) : perfcNum(kg / 1000, 1));
export const perfcPct = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))} %`;
/** Lundi 00:00 de la semaine contenant t */
export const perfcMonday = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
export const perfcDayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const perfcPhoto = (p?: string): ImgName => (p && p in IMG ? (p as ImgName) : "photo-gym");

/** Toutes les activités (toutes disciplines) à plat, triées par date décroissante */
export type PerfcActivity = { at: number; end?: number; kind: "musculation" | "course" | "velo" | "natation" | "hyrox" | "street" | "crossfit"; label: string; load: number };
export function perfcActivities(history: Session[]): PerfcActivity[] {
  const a = getActivities();
  const list: PerfcActivity[] = [];
  for (const s of history) list.push({ at: s.startedAt, end: s.endedAt, kind: "musculation", label: s.name, load: volume(s) / 100 });
  for (const r of a.runs) list.push({ at: r.at, end: r.at + r.duration * 1000, kind: r.sport, label: r.name ?? (r.sport === "course" ? "Sortie course" : r.sport === "velo" ? "Sortie vélo" : "Natation"), load: r.duration / 60 * 4 });
  for (const h of a.hyrox) list.push({ at: h.at, kind: "hyrox", label: h.name ?? "Simulation Hyrox", load: 400 });
  for (const t of a.street) list.push({ at: t.at, kind: "street", label: "Test street", load: 60 });
  for (const w of a.wods) list.push({ at: w.at, kind: "crossfit", label: w.name, load: 250 });
  return list.sort((x, y) => y.at - x.at);
}
export const PERFC_KIND_LABEL: Record<PerfcActivity["kind"], string> = { musculation: "Musculation", course: "Course", velo: "Vélo", natation: "Natation", hyrox: "Hyrox", street: "Street", crossfit: "CrossFit" };
export const PERFC_KIND_LOGO: Record<PerfcActivity["kind"], ImgName> = { musculation: "logo-bodybuilding", course: "logo-course", velo: "logo-velo", natation: "logo-natation", hyrox: "logo-hyrox", street: "logo-street", crossfit: "logo-crossfit" };

/** État vide élégant avec bouton d'action */
export function PerfC_Empty({ icon = "stats", title, text, cta, onPress }: { icon?: IconName; title: string; text: string; cta?: string; onPress?: () => void }) {
  return (
    <View style={{ borderRadius: 22, padding: 22, backgroundColor: C.surf, alignItems: "center", gap: 10, marginTop: 4 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: accentA(0.14), alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={26} color={C.accent} w={2} />
      </View>
      <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt, textAlign: "center", letterSpacing: -0.3 }}>{title}</Text>
      <Text style={{ fontFamily: inter(400), fontSize: 13, lineHeight: 19, color: C.mut, textAlign: "center" }}>{text}</Text>
      {cta ? <Btn label={cta} size="md" full={false} onPress={onPress} style={{ marginTop: 4 }} /> : null}
    </View>
  );
}

/** En-tête « hero » rouge pleine largeur (R09, R15) : à utiliser dans <Page pad={false}> */
export function PerfC_Hero({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={["#C4163A", "#7E1025", C.bg]} locations={[0, 0.5, 1]} style={[{ paddingTop: PAD + insets.top, paddingHorizontal: PAD, paddingBottom: 20, gap: 14, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }, style]}>
      {children}
    </LinearGradient>
  );
}
export const PerfC_Body = ({ children }: { children: React.ReactNode }) => <View style={{ paddingHorizontal: PAD, gap: 14 }}>{children}</View>;
/** Ligne de titre du hero : bouton rond à gauche, titre centré blanc, bouton rond à droite */
export const PerfC_HeroTop = ({ title, left, right }: { title: string; left: React.ReactNode; right?: React.ReactNode }) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
    {left}
    <Text style={{ flex: 1, textAlign: "center", fontFamily: inter(600), fontSize: 15, color: "#fff" }} numberOfLines={1}>{title}</Text>
    {right ?? <View style={{ width: 38 }} />}
  </View>
);

/** Écart coloré (vert = mieux) : text déjà formaté, good indique le sens */
export const PerfC_Delta = ({ text, good, size = 12 }: { text: string; good: boolean | null; size?: number }) => (
  <Text style={{ fontFamily: inter(700), fontSize: size, color: good === null ? C.mut : good ? C.green : C.red }}>{text}</Text>
);

/** Vignette photo ronde */
export const PerfC_Thumb = ({ photo, size = 40, r }: { photo: ImgName; size?: number; r?: number }) => (
  <Image source={IMG[photo]} style={{ width: size, height: size, borderRadius: r ?? size / 2, backgroundColor: "#1B1E31" }} resizeMode="cover" />
);
/** Petite tuile logo discipline (fond sombre) */
export const PerfC_Logo = ({ name, size = 34 }: { name: ImgName; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundColor: C.surf2, alignItems: "center", justifyContent: "center" }}>
    <Image source={IMG[name]} style={{ width: size * 0.72, height: size * 0.72 }} resizeMode="contain" />
  </View>
);

/** Échelle 1–5 (ressenti du matin) */
export function PerfC_Scale({ label, v, onChange }: { label: string; v?: number; onChange: (n: 1 | 2 | 3 | 4 | 5) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
      <Text style={{ fontFamily: inter(400), fontSize: 14, color: C.txt, width: 100 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n as 1 | 2 | 3 | 4 | 5)} style={{ width: 38, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: v === n ? C.txt : "rgba(255,255,255,0.08)" }}>
            <Text style={{ fontFamily: man(700), fontSize: 14, color: v === n ? C.bg : C.soft }}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Barre horizontale étiquette + valeur (par discipline) */
export function PerfC_BarRow({ left, label, pct, value, color = C.accent }: { left?: React.ReactNode; label: string; pct: number; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      {left}
      <Text style={{ fontFamily: inter(500), fontSize: 14, color: C.txt, width: 96 }} numberOfLines={1}>{label}</Text>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <View style={{ width: `${Math.max(2, Math.min(100, pct))}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
      </View>
      <Text style={{ fontFamily: man(700), fontSize: 14, color: C.txt, minWidth: 36, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

/** Ligne « icône + titre + sous-titre + action » (conseils, défis proposés, prochain bloc) */
export function PerfC_Advice({ icon = "bolt", color = C.accent, title, text, action, onAction, actionKind = "white" }: { icon?: IconName; color?: string; title: string; text: string; action?: string; onAction?: () => void; actionKind?: "white" | "secondary" | "primary" }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <Icon name={icon} size={22} color={color} w={2} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(600), fontSize: 14.5, color: C.txt }}>{title}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, lineHeight: 16, color: C.mut }}>{text}</Text>
      </View>
      {action ? <Btn label={action} kind={actionKind} size="sm" full={false} onPress={onAction} /> : null}
    </View>
  );
}

/** Pastilles de semaines S1..Sn : passées en accent, courante en blanc, à venir en gris */
export function PerfC_WeekPills({ n, cur, labels, onPress }: { n: number; cur: number; labels?: string[]; onPress?: (i: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 8, paddingRight: 16 }} style={{ flexGrow: 0, marginRight: -16 }}>
      {Array.from({ length: n }, (_, i) => {
        const bg = i < cur ? C.accent : i === cur ? C.txt : C.surf; const fg = i < cur ? "#fff" : i === cur ? C.bg : C.mut;
        return (
          <Pressable key={i} onPress={() => onPress?.(i)} style={{ alignItems: "center", gap: 6 }}>
            <View style={{ width: 54, height: 44, borderRadius: 14, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: man(700), fontSize: 15, color: fg }}>S{i + 1}</Text></View>
            {labels ? <Text style={{ fontFamily: inter(400), fontSize: 10.5, color: C.mut }}>{labels[i]}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Ligne de tableau 3 colonnes : libellé, S courante (gras), S précédente, écart */
export function PerfC_TableRow({ left, label, a, b, delta, good }: { left?: React.ReactNode; label: string; a: string; b: string; delta: string; good: boolean | null }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.line }}>
      {left}
      <Text style={{ flex: 1, fontFamily: inter(400), fontSize: 14, color: C.txt }} numberOfLines={1}>{label}</Text>
      <Text style={{ width: 58, textAlign: "right", fontFamily: man(700), fontSize: 14, color: C.txt }}>{a}</Text>
      <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 13, color: C.mut }}>{b}</Text>
      <View style={{ width: 54, alignItems: "flex-end" }}><PerfC_Delta text={delta} good={good} /></View>
    </View>
  );
}
export const PerfC_TableHead = ({ a, b, c = "écart" }: { a: string; b: string; c?: string }) => (
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, paddingBottom: 2 }}>
    <Text style={{ width: 58, textAlign: "right", fontFamily: inter(700), fontSize: 11, color: C.txt }}>{a}</Text>
    <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 11, color: C.mut }}>{b}</Text>
    <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 11, color: C.mut }}>{c}</Text>
  </View>
);

/** Étiquette « démo » discrète */
export const PerfC_Demo = ({ text = "démo" }: { text?: string }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", alignSelf: "flex-start" }}>
    <Text style={{ fontFamily: inter(600), fontSize: 10.5, color: C.mut }}>{text}</Text>
  </View>
);
