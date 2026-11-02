import React, { useRef, useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, ViewStyle, ScrollView, PanResponder, LayoutChangeEvent } from "react-native";
import { SvgXml } from "react-native-svg";
import { C, PAD, inter, man } from "../theme/tokens";
import { Icon } from "./Icon";
import { Btn, Circ } from "./Controls";
import { Big, H1, Sub } from "./Text";

/** Barre de progression d'onboarding (progress_top) */
export function ProgressTop({ step, total, skip = true, onBack, onSkip }: { step: number; total: number; skip?: boolean; onBack?: () => void; onSkip?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Circ icon="back" size={38} onPress={onBack} />
      <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <View style={{ width: `${Math.round((step / total) * 100)}%`, height: 3, backgroundColor: C.txt }} />
      </View>
      <Text onPress={onSkip} style={{ fontFamily: inter(400), fontSize: 13, color: C.mut, width: 44, textAlign: "right" }}>{skip ? "Passer" : ""}</Text>
    </View>
  );
}
export const Headline = ({ q, s }: { q: string; s?: string }) => (
  <View style={{ gap: 8, paddingTop: 6, paddingBottom: 2 }}>
    <H1 size={28}>{q}</H1>
    {s ? <Sub>{s}</Sub> : null}
  </View>
);
/** Bouton d'action en bas (cta) : poussé en bas de la colonne */
export function CTA({ label, icon, secondary, kind = "primary", onPress, onSecondary }: { label: string; icon?: any; secondary?: React.ReactNode; kind?: "primary" | "white" | "secondary"; onPress?: () => void; onSecondary?: () => void }) {
  return (
    <View style={{ marginTop: "auto", gap: 12, paddingBottom: 8, paddingTop: 16 }}>
      <Btn label={label} kind={kind} icon={icon} onPress={onPress} />
      {secondary ? <Text onPress={onSecondary} style={{ fontFamily: inter(400), fontSize: 13, color: C.mut, textAlign: "center" }}>{secondary}</Text> : null}
    </View>
  );
}
export const CheckCircle = ({ on }: { on: boolean }) => (
  <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: on ? C.accent : "transparent", borderWidth: on ? 0 : 2, borderColor: "rgba(255,255,255,0.25)" }}>
    {on ? <Icon name="check" size={15} color="#fff" w={2.8} /> : null}
  </View>
);
/** Ligne de sélection (sel_row) */
export function SelRow({ visual, title, s, on = false, right, onPress }: { visual?: React.ReactNode; title: string; s?: string; on?: boolean; right?: React.ReactNode | null; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 }}>
      {visual}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: inter(on ? 700 : 500), fontSize: 15, color: C.txt }}>{title}</Text>
        {s ? <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut, lineHeight: 17 }}>{s}</Text> : null}
      </View>
      {right === undefined ? <CheckCircle on={on} /> : right}
    </Pressable>
  );
}
/** Carte de sélection (sel_card) */
export function SelCard({ title, s, on, visual, onPress }: { title: string; s: string; on: boolean; visual?: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, backgroundColor: C.surf, borderWidth: 1.5, borderColor: on ? C.txt : C.surf }}>
      {visual}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: man(700), fontSize: 16, color: C.txt }}>{title}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut, lineHeight: 17.5 }}>{s}</Text>
      </View>
      <CheckCircle on={on} />
    </Pressable>
  );
}
/** Champ de saisie plat (field) */
export function Field({ label, value, right, onChange, secure, placeholder, keyboard }: { label: string; value: string; right?: string; onChange?: (v: string) => void; secure?: boolean; placeholder?: string; keyboard?: any }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{label}</Text>
      <View style={{ height: 52, borderRadius: 14, backgroundColor: C.surf, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
        <TextInput value={value} onChangeText={onChange} secureTextEntry={secure} placeholder={placeholder} placeholderTextColor={C.mut} keyboardType={keyboard}
          style={{ flex: 1, fontFamily: inter(400), fontSize: 15, color: C.txt, outlineStyle: "none" } as any} />
        {right ? <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{right}</Text> : null}
      </View>
    </View>
  );
}
export const Search = ({ ph = "Rechercher", value, onChange }: { ph?: string; value?: string; onChange?: (v: string) => void }) => (
  <View style={{ height: 44, borderRadius: 22, backgroundColor: C.surf, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 }}>
    <Icon name="search" size={18} color={C.mut} />
    <TextInput value={value} onChangeText={onChange} placeholder={ph} placeholderTextColor={C.mut} style={{ flex: 1, fontFamily: inter(400), fontSize: 14, color: C.txt, outlineStyle: "none" } as any} />
  </View>
);
export const Days = ({ on, onToggle }: { on: number[]; onToggle?: (i: number) => void }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    {"LMMJVSD".split("").map((d, i) => {
      const a = on.includes(i);
      return (
        <Pressable key={i} onPress={() => onToggle?.(i)} style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: a ? C.txt : C.surf }}>
          <Text style={{ fontFamily: man(700), fontSize: 14, color: a ? C.bg : C.txt }}>{d}</Text>
        </Pressable>
      );
    })}
  </View>
);
export const FieldLabel = ({ children }: { children: React.ReactNode }) => <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{children}</Text>;
export const OrLine = ({ text = "ou" }: { text?: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
    <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
    <Text style={{ fontFamily: inter(400), fontSize: 12, color: C.mut }}>{text}</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
  </View>
);

const APPLE = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#0C0E1A"><path d="M16.5 12.7c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.9-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.4 1.3 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-3.8zM14.1 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z"/></svg>';
const GOOGLE = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z"/></svg>';
export function SocialBtn({ provider, onPress }: { provider: "apple" | "google"; onPress?: () => void }) {
  const apple = provider === "apple";
  return (
    <Pressable onPress={onPress} style={{ height: 52, borderRadius: 26, backgroundColor: apple ? C.txt : C.surf, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <SvgXml xml={apple ? APPLE : GOOGLE} width={18} height={18} />
      <Text style={{ fontFamily: man(700), fontSize: 15, color: apple ? C.bg : C.txt }}>{apple ? "Continuer avec Apple" : "Continuer avec Google"}</Text>
    </Pressable>
  );
}

/** Règle graduée (ruler) : glisser pour changer la valeur ; `onChange` reçoit la nouvelle valeur */
export function Ruler({ value, unit, step = 1, w = 358, min = 0, max = 400, onChange }: { value: number; unit: string; step?: number; w?: number; min?: number; max?: number; onChange?: (v: number) => void }) {
  const n = 41, mid = 20;
  const gap = Math.round((w - 2 * n) / (n - 1)); const pitch = gap + 2;
  const fmt = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");
  const startVal = useRef(value); const [drag, setDrag] = useState(0);
  const cur = useRef(value); cur.current = value;
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true, onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2,
    onPanResponderGrant: () => { startVal.current = cur.current; },
    onPanResponderMove: (_, g) => { const v = Math.min(max, Math.max(min, startVal.current - Math.round(g.dx / pitch) * step)); setDrag(g.dx - Math.round(g.dx / pitch) * pitch); if (v !== cur.current) onChange?.(Math.round(v * 100) / 100); },
    onPanResponderRelease: () => setDrag(0), onPanResponderTerminate: () => setDrag(0),
  })).current;
  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <Big v={fmt(value)} unit={unit} size={64} />
      <View style={{ width: w, height: 50, overflow: "hidden" }} {...pan.panHandlers}>
        <View style={{ position: "absolute", left: drag, top: 0, flexDirection: "row", gap }}>
          {Array.from({ length: n }).map((_, i) => {
            const v = value + (i - mid) * step; const big = Math.abs(Math.round(v / step) % 5) === 0;
            return (
              <View key={i} style={{ width: 2, height: big ? 24 : 10, borderRadius: 1, backgroundColor: big ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
                {big ? <Text style={{ position: "absolute", top: 30, left: -20, width: 42, textAlign: "center", fontFamily: inter(400), fontSize: 10, color: C.mut }}>{fmt(v)}</Text> : null}
              </View>
            );
          })}
        </View>
        <View style={{ position: "absolute", left: w / 2 - 1.5, top: -4, width: 3, height: 32, borderRadius: 2, backgroundColor: C.accent }} />
      </View>
    </View>
  );
}
/** Curseur horizontal (slider) : glisser ou toucher ; `onChange` reçoit 0..1 */
export function Slider({ pct, onChange }: { pct: number; onChange?: (p: number) => void }) {
  const width = useRef(1); const x0 = useRef(0);
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true, onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { onChange?.(Math.min(1, Math.max(0, e.nativeEvent.locationX / width.current))); x0.current = e.nativeEvent.locationX; },
    onPanResponderMove: (_, g) => onChange?.(Math.min(1, Math.max(0, (x0.current + g.dx) / width.current))),
  })).current;
  return (
    <View style={{ flex: 1, height: 36, justifyContent: "center" }} onLayout={(e: LayoutChangeEvent) => { width.current = e.nativeEvent.layout.width; }} {...pan.panHandlers}>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.12)" }} />
      <View style={{ position: "absolute", left: 0, width: `${pct}%`, height: 4, borderRadius: 2, backgroundColor: C.txt }} />
      <View pointerEvents="none" style={{ position: "absolute", left: `${pct}%`, marginLeft: -14, width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", boxShadow: "0 3px 10px rgba(0,0,0,0.5)" } as any} />
    </View>
  );
}
