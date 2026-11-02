import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Seg, Search, SelRow, Avatar, Pills, Toggle, CTA } from "../../ui";
import { IMG } from "../../theme/images";
import { C, inter } from "../../theme/tokens";

const LBL = ({ t }: { t: string }) => <Text style={{ fontFamily: inter(700), fontSize: 13, color: C.mut }}>{t}</Text>;
/** G06 · Lancer un défi */
export default function Lancer() {
  const [who, setWho] = useState(0); const [target, setTarget] = useState(0); const [crit, setCrit] = useState(0); const [dur, setDur] = useState(1); const [badge, setBadge] = useState(true); const [sent, setSent] = useState(false);
  const gyms = [["BF", "Basic-Fit Saint-Brieuc", "312 membres · 21 km"], ["FC", "Fitness Club Lamballe", "54 membres · 2,8 km"], ["OR", "Orange Bleue Dinan", "180 membres · 26 km"]];
  return (
    <Page>
      <Top title="Lancer un défi" left={<></>} right={<Circ icon="x" size={38} onPress={() => router.back()} />} />
      <View style={{ gap: 8 }}><LBL t="Contre qui" /><Seg items={["Une salle", "Des amis", "Public"]} on={who} onChange={setWho} /></View>
      <Search ph={who === 0 ? "Rechercher une salle proche" : "Rechercher un membre"} />
      {gyms.map(([i, n, s], k) => <SelRow key={n} visual={<Avatar ini={i} size={44} />} title={n} s={s} on={target === k} onPress={() => setTarget(k)} />)}
      <View style={{ gap: 8 }}><LBL t="Critère" /><Pills items={["Volume / membre", "Assiduité", "Séances", "Km courus"]} on={crit} onChange={setCrit} /></View>
      <View style={{ gap: 8 }}><LBL t="Durée" /><Seg items={["7 jours", "14 jours", "30 jours"]} on={dur} onChange={setDur} /></View>
      <SelRow visual={<Image source={IMG["record"]} style={{ width: 36, height: 36 }} resizeMode="contain" />} title="Badge de salle en jeu" s="pour tous les membres de la salle gagnante" right={<Toggle on={badge} onChange={setBadge} />} />
      <CTA label={sent ? "Défi envoyé ✓" : "Envoyer le défi"} icon="bolt" kind={sent ? "secondary" : "primary"} onPress={() => { setSent(true); setTimeout(() => router.back(), 900); }} secondary="L'administrateur de l'autre salle doit accepter · réponse sous 48 h (actif avec le serveur)" />
    </Page>
  );
}
