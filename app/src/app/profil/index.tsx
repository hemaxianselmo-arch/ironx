import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { Page, Top, Avatar, Surf, KV, Btn, Icon, Field, Divider } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useProfile, GOAL_LABEL, age } from "../../store/profile";
import { useAuth, auth } from "../../store/auth";
import { useWorkout, volume, allRecords, fmtVol } from "../../store/workout";

/** P01 · Mon profil : identité, compte, chiffres, déconnexion */
export default function Profil() {
  const p = useProfile(); const a = useAuth(); const w = useWorkout();
  const ini = (p.prenom.trim().slice(0, 2) || "IX").toUpperCase();
  const email = a.session ?? "—";
  const vol = w.history.reduce((s, x) => s + volume(x), 0);
  const recs = allRecords().length;
  const [pwOpen, setPwOpen] = useState(false); const [old, setOld] = useState(""); const [nw, setNw] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const logout = () => { auth.logout(); router.replace("/"); };
  const remove = () => Alert.alert("Supprimer le compte", "Toutes les données de ce compte sur ce téléphone seront effacées.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { auth.deleteAccount(); router.replace("/"); } }]);
  return (
    <Page>
      <Top title="Mon profil" onBack={() => router.back()} />
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
        <Avatar ini={ini} size={88} ring />
        <Text style={{ fontFamily: man(800), fontSize: 24, color: C.txt }}>{p.prenom || "Membre IRONX"}</Text>
        <Text style={{ fontFamily: inter(400), fontSize: 13, color: C.mut }}>{p.pseudo ? "@" + p.pseudo + " · " : ""}{email}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 6 }}>
        <KV k="Séances" v={String(w.history.length)} strong align="center" /><KV k="Volume total" v={fmtVol(vol)} strong align="center" /><KV k="Records" v={String(recs)} strong align="center" />
      </View>
      <Surf>
        <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Mes infos</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          <KV k="Âge" v={`${age(p)} ans`} /><KV k="Taille" v={`${p.taille} cm`} /><KV k="Poids" v={`${p.poids} kg`} /><KV k="Objectif" v={GOAL_LABEL[p.goal]} /><KV k="Séances / sem." v={String(p.seances)} /><KV k="Salle" v={p.salle ?? "—"} />
        </View>
        <Btn label="Modifier mes infos" kind="secondary" size="md" icon="edit" onPress={() => router.push("/onboarding/toi")} />
      </Surf>
      <Surf>
        <Text style={{ fontFamily: inter(600), fontSize: 13, color: C.mut }}>Mon compte</Text>
        <KV k="E-mail" v={email} />
        {pwOpen ? <>
          <Field label="Ancien mot de passe" value={old} onChange={setOld} secure />
          <Field label="Nouveau mot de passe" value={nw} onChange={setNw} secure />
          {msg ? <Text style={{ fontFamily: inter(500), fontSize: 13, color: msg.startsWith("OK") ? C.green : C.red }}>{msg}</Text> : null}
          <Btn label="Enregistrer" size="md" onPress={() => { const e = auth.changePassword(old, nw); setMsg(e ?? "OK, mot de passe modifié."); if (!e) { setOld(""); setNw(""); } }} />
        </> : <Btn label="Changer le mot de passe" kind="secondary" size="md" onPress={() => setPwOpen(true)} />}
      </Surf>
      <Divider />
      <Btn label="Se déconnecter" kind="secondary" onPress={logout} />
      <Text onPress={remove} style={{ fontFamily: inter(500), fontSize: 13, color: C.red, textAlign: "center", padding: 8 }}>Supprimer mon compte sur ce téléphone</Text>
      <Text style={{ fontFamily: inter(400), fontSize: 11.5, color: C.mut, textAlign: "center", lineHeight: 16 }}>Les comptes sont pour l'instant enregistrés sur ce téléphone uniquement. La synchronisation entre appareils arrivera avec le serveur.</Text>
    </Page>
  );
}
