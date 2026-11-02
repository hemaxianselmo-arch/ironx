import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Top, Search, SelRow, Field, Btn, Sub, Label, Big, Pill, PerfB_NumPad, PerfB_Thumb } from "../../ui";
import { C, inter } from "../../theme/tokens";
import { act, STREET_MOVES, bestStreet, fmtStreet } from "../../store/activities";

const PHOTO: Record<string, any> = { pullup: "photo-pullup", dips: "photo-chalk", pushup: "photo-burpees", muscleup: "photo-w-pullup", hspu: "photo-gym", pistol: "photo-w-squat", "pullup-w": "photo-pullup", "dips-w": "photo-chalk", frontlever: "photo-w-pullup", backlever: "photo-w-pullup", planche: "photo-gym", lsit: "photo-gym", handstand: "photo-gym", "human-flag": "photo-pullup" };
const VARIANTS: Record<string, string[]> = {
  pullup: ["strict", "kipping"], muscleup: ["strict", "kipping"], dips: ["strict", "kipping"], pushup: ["strict", "sur les genoux"], hspu: ["strict", "kipping", "au mur"], pistol: ["libre", "assisté"],
  frontlever: ["tuck", "advanced tuck", "straddle", "full"], backlever: ["tuck", "advanced tuck", "straddle", "full"], planche: ["tuck", "advanced tuck", "straddle", "full"], "human-flag": ["tuck", "advanced tuck", "straddle", "full"], lsit: ["tuck", "full"], handstand: ["au mur", "libre"],
};
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Saisie d'un test street : mouvement (recherche), valeur au pavé, variante, note */
export default function SaisieStreet() {
  const [q, setQ] = useState(""); const [move, setMove] = useState<string | null>(null);
  const [val, setVal] = useState(""); const [variant, setVariant] = useState<string | null>(null); const [note, setNote] = useState(""); const [err, setErr] = useState("");
  const m = STREET_MOVES.find((x) => x.id === move);
  const list = STREET_MOVES.filter((x) => !q || norm(x.name).includes(norm(q)));
  const key = (k: string) => { setErr(""); setVal((v) => (k === "⌫" ? v.slice(0, -1) : k === "," ? (v.includes(",") || !v ? v : v + ",") : (v + k).slice(0, 5))); };
  const save = () => {
    if (!m) return; const v = parseFloat(val.replace(",", ".")); if (!(v > 0)) { setErr("Indique une valeur."); return; }
    act.addStreet({ at: Date.now(), move: m.id, value: v, variant: variant ?? undefined, note: note.trim() || undefined }); router.back();
  };
  if (!m) {
    return (
      <Page>
        <Top title="Nouveau test" sub="choisis le mouvement" onBack={() => router.back()} />
        <Search ph="Tractions, front lever…" value={q} onChange={setQ} />
        {list.map((x) => { const b = bestStreet(x.id); return <SelRow key={x.id} visual={<PerfB_Thumb photo={PHOTO[x.id]} size={44} />} title={x.name} s={`${x.kind === "reps" ? "max reps" : x.kind === "kg" ? "charge ajoutée" : "tenue en secondes"}${b ? ` · record ${fmtStreet(x.id, b.value)}` : ""}`} right={null} onPress={() => { setMove(x.id); setVariant(VARIANTS[x.id]?.[0] ?? null); setVal(""); }} />; })}
        {!list.length ? <Sub>Aucun mouvement ne correspond.</Sub> : null}
      </Page>
    );
  }
  const unit = m.kind === "reps" ? "reps" : m.kind === "kg" ? "kg ajoutés" : "secondes"; const best = bestStreet(m.id);
  return (
    <Page>
      <Top title={m.name} sub={best ? `record ${fmtStreet(m.id, best.value)}${best.variant ? ` · ${best.variant}` : ""}` : "premier test"} onBack={() => setMove(null)} />
      <View style={{ alignItems: "center", gap: 4, paddingVertical: 10 }}>
        <Label>{unit}</Label>
        <Big v={val || "0"} size={72} />
        {best && parseFloat(val.replace(",", ".")) > best.value ? <Text style={{ fontFamily: inter(700), fontSize: 13, color: C.green }}>Nouveau record !</Text> : <Sub>{m.kind === "sec" ? "tenue propre, sans casser la position" : m.kind === "kg" ? "charge maximale sur 1 rep" : "série maximale sans pause"}</Sub>}
      </View>
      {VARIANTS[m.id] ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {VARIANTS[m.id].map((v) => <Pill key={v} label={v[0].toUpperCase() + v.slice(1)} on={variant === v} onPress={() => setVariant(v)} />)}
        </View>
      ) : null}
      <PerfB_NumPad onKey={key} decimal={m.kind === "kg"} />
      <Field label="Note (optionnel)" value={note} onChange={setNote} placeholder="Prise, matériel, sensations…" />
      {err ? <Text style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center" }}>{err}</Text> : null}
      <Btn label="Enregistrer le test" icon="check" onPress={save} />
      <Pressable onPress={() => setMove(null)} style={{ padding: 6 }}><Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut, textAlign: "center" }}>Changer de mouvement</Text></Pressable>
      <View style={{ height: 80 }} />
    </Page>
  );
}
