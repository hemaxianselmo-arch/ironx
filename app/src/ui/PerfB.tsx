// Composants partagés du lot B (Hyrox / course / street / CrossFit + saisie)
import React from "react";
import { View, Text, Image, Pressable, TextInput } from "react-native";
import { C, inter, man } from "../theme/tokens";
import { IMG, ImgName } from "../theme/images";
import { Btn } from "./Controls";
import { Icon, IconName } from "./Icon";
import { fmtTime } from "../store/activities";

/** État vide élégant avec bouton d'action vers la saisie */
export function PerfB_Empty({ title, text, action, onPress, icon = "plus" }: { title: string; text: string; action?: string; onPress?: () => void; icon?: IconName }) {
  return (
    <View style={{ alignItems: "center", gap: 10, paddingVertical: 28, paddingHorizontal: 20, borderRadius: 22, backgroundColor: C.surf }}>
      <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(235,27,63,0.16)", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={24} color={C.accent} w={2.2} />
      </View>
      <Text style={{ fontFamily: man(700), fontSize: 17, color: C.txt, textAlign: "center", letterSpacing: -0.3 }}>{title}</Text>
      <Text style={{ fontFamily: inter(400), fontSize: 13, lineHeight: 19, color: C.mut, textAlign: "center" }}>{text}</Text>
      {action ? <Btn label={action} size="md" full={false} icon="plus" onPress={onPress} style={{ marginTop: 6 }} /> : null}
    </View>
  );
}

/** Vignette photo ronde (listes « par station », records…) */
export const PerfB_Thumb = ({ photo, size = 40 }: { photo: ImgName; size?: number }) => (
  <Image source={IMG[photo]} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#1B1E31" }} resizeMode="cover" />
);

/** Écart coloré : vert si meilleur, rouge si moins bon. lower = « plus petit = mieux » (temps) */
export function PerfB_Delta({ d, lower = true, fmt, size = 12 }: { d: number; lower?: boolean; fmt?: (n: number) => string; size?: number }) {
  const good = lower ? d < 0 : d > 0; const same = d === 0;
  const f = fmt ?? ((n: number) => fmtTime(Math.abs(n)));
  return <Text style={{ fontFamily: inter(700), fontSize: size, color: same ? C.mut : good ? C.green : C.red }}>{same ? "=" : (d < 0 ? "−" : "+") + f(Math.abs(d))}</Text>;
}

/** En-tête de tableau 3 colonnes à droite (préc. / dernier / écart) */
export const PerfB_TableHead = ({ a, b, c = "écart" }: { a: string; b: string; c?: string }) => (
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 4, paddingBottom: 2 }}>
    <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 11, color: C.mut }}>{a}</Text>
    <Text style={{ width: 54, textAlign: "right", fontFamily: inter(700), fontSize: 11, color: C.accent }}>{b}</Text>
    <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 11, color: C.mut }}>{c}</Text>
  </View>
);

/** Ligne de comparaison : vignette + nom · valeur A (gris) · valeur B (fort) · écart coloré */
export function PerfB_CmpRow({ photo, name, sub, a, b, d, lower = true, fmt, left }: { photo?: ImgName; name: string; sub?: string; a?: string; b: string; d?: number; lower?: boolean; fmt?: (n: number) => string; left?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
      {left ?? (photo ? <PerfB_Thumb photo={photo} /> : null)}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ fontFamily: inter(500), fontSize: 14, color: C.txt }}>{name}</Text>
        {sub ? <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut }}>{sub}</Text> : null}
      </View>
      <Text style={{ width: 54, textAlign: "right", fontFamily: inter(400), fontSize: 13, color: C.mut }}>{a ?? ""}</Text>
      <Text style={{ width: 54, textAlign: "right", fontFamily: man(700), fontSize: 15, color: C.txt }}>{b}</Text>
      <View style={{ width: 54, alignItems: "flex-end" }}>{d != null ? <PerfB_Delta d={d} lower={lower} fmt={fmt} /> : <Text style={{ color: C.mut }}>—</Text>}</View>
    </View>
  );
}

/** Petit champ numérique compact (m / s / km) */
export function PerfB_Num({ value, onChange, ph = "0", w = 64, suffix, decimal = false, max = 4 }: { value: string; onChange: (v: string) => void; ph?: string; w?: number; suffix?: string; decimal?: boolean; max?: number }) {
  return (
    <View style={{ width: w, height: 50, borderRadius: 14, backgroundColor: C.surf, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 8, gap: 3 }}>
      <TextInput value={value} onChangeText={(t) => onChange(t.replace(decimal ? /[^0-9.,]/g : /[^0-9]/g, "").slice(0, max))} keyboardType={decimal ? "decimal-pad" : "number-pad"} placeholder={ph} placeholderTextColor={C.mut} selectTextOnFocus
        style={{ minWidth: 28, textAlign: "center", fontFamily: man(700), fontSize: 18, color: C.txt, outlineStyle: "none", padding: 0 } as any} />
      {suffix ? <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{suffix}</Text> : null}
    </View>
  );
}

/** Saisie d'un temps minutes : secondes (optionnellement heures) */
export function PerfB_TimeInput({ label, h, m, s, onChange, hours = false, right }: { label?: string; h?: string; m: string; s: string; onChange: (v: { h?: string; m: string; s: string }) => void; hours?: boolean; right?: React.ReactNode }) {
  const sep = <Text style={{ fontFamily: man(700), fontSize: 20, color: C.mut }}>:</Text>;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {label ? <Text numberOfLines={1} style={{ flex: 1, fontFamily: inter(500), fontSize: 14, color: C.txt }}>{label}</Text> : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {hours ? <><PerfB_Num value={h ?? ""} onChange={(v) => onChange({ h: v, m, s })} ph="0" w={56} suffix="h" max={2} />{sep}</> : null}
        <PerfB_Num value={m} onChange={(v) => onChange({ h, m: v, s })} ph="00" w={hours ? 64 : 70} suffix="min" max={3} />
        {sep}
        <PerfB_Num value={s} onChange={(v) => onChange({ h, m, s: v })} ph="00" w={hours ? 56 : 62} suffix="s" max={2} />
      </View>
      {right}
    </View>
  );
}
export const PERFB_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
/** « 26 oct. » */
export const perfB_date = (t: number) => { const d = new Date(t); return `${d.getDate()} ${PERFB_MOIS[d.getMonth()]}`; };
/** Photo par station Hyrox */
export const PERFB_STATION_PHOTO: Record<string, ImgName> = { skierg: "photo-gym", "sled-push": "photo-sled", "sled-pull": "photo-sled", burpee: "photo-burpees", rowing: "photo-w-rower", farmers: "photo-kettlebell", lunges: "photo-w-squat", wallballs: "photo-wallball", run: "photo-run" };
export const perfB_secs =(h: string | undefined, m: string, s: string) => (parseInt(h ?? "0") || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
export const perfB_split = (t: number) => ({ h: String(Math.floor(t / 3600)), m: String(Math.floor((t % 3600) / 60)), s: String(Math.round(t % 60)) });

/** Ligne « étiquette + toggle / contrôle » */
export const PerfB_SettingRow = ({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 }}>
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={{ fontFamily: inter(500), fontSize: 14, color: C.txt }}>{label}</Text>
      {sub ? <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{sub}</Text> : null}
    </View>
    {right}
  </View>
);

/** Carte conseil (à travailler en priorité, à améliorer) */
export function PerfB_Advice({ photo, title, text, action, onAction }: { photo: ImgName; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <PerfB_Thumb photo={photo} size={44} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(700), fontSize: 14, color: C.txt }}>{title}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12, lineHeight: 16, color: C.mut }}>{text}</Text>
      </View>
      {action ? <Btn label={action} kind="secondary" size="sm" full={false} onPress={onAction} /> : null}
    </View>
  );
}

/** Pavé numérique gros chiffres (saisie street) */
export function PerfB_NumPad({ onKey, decimal = false }: { onKey: (k: string) => void; decimal?: boolean }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", decimal ? "," : "", "0", "⌫"].map((k, i) => (
        <Pressable key={i} disabled={!k} onPress={() => k && onKey(k)} style={({ pressed }) => ({ width: "31.5%", height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: !k ? "transparent" : pressed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)" })}>
          <Text style={{ fontFamily: man(700), fontSize: 20, color: C.txt }}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
}
