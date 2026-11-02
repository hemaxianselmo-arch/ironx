import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, KV, Media, Shade, Ov, OvText, Btn, Field, SelRow, Toggle, Icon, H2, Avatar, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useGym, gym, MEMBERS, EVENTS } from "../../store/gym";

/** G09 · Administration de la salle */
export default function Admin() {
  const g = useGym(); const [name, setName] = useState(g.gymName); const [open, setOpen] = useState(true); const [valid, setValid] = useState(true);
  return (
    <Page>
      <Top title="Administration" sub={`${g.gymName} · tu es gérant`} onBack={() => router.back()} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}><KV k="Membres" v={String(MEMBERS.length + 78)} /><KV k="Actifs / sem." v="31" /><KV k="Demandes" v="3" /><KV k="Événements" v={String(EVENTS.length)} /></View>
      <Media photo="photo-gym" h={130} r={18}><Shade /><Ov x={14} y={12} anchor="lb"><OvText>Fiche publique</OvText><Text style={{ fontFamily: man(700), fontSize: 18, color: "#fff" }}>Logo, photos, horaires, adresse</Text></Ov><Ov x={12} y={12} anchor="rt"><Btn label="Modifier" kind="white" size="sm" full={false} /></Ov></Media>
      <Field label="Nom de la salle" value={name} onChange={setName} placeholder="Ex. Iron Gym Lamballe" />
      <Btn label="Enregistrer le nom" kind="secondary" size="md" onPress={() => { gym.setName(name.trim() || "[NOM DE LA SALLE]"); router.back(); }} />
      <H2>Demandes d'adhésion · 3</H2>
      {[["LB", "lucas.b", "hier"], ["EM", "emma.m", "il y a 2 j"], ["NR", "nico.r", "il y a 3 j"]].map(([i, n, d]) => <SelRow key={n} visual={<Avatar ini={i} size={44} ring={false} />} title={n} s={`demande · ${d}`} right={<View style={{ flexDirection: "row", gap: 6 }}><Btn label="Accepter" size="sm" full={false} /><Btn label="Non" kind="secondary" size="sm" full={false} /></View>} />)}
      <H2>Réglages</H2>
      <SelRow title="Adhésion ouverte" s="sans validation par un admin" right={<Toggle on={open} onChange={setOpen} />} />
      <SelRow title="Validation des records" s="un admin confirme les records au-dessus de 150 kg" right={<Toggle on={valid} onChange={setValid} />} />
      <SelRow title="Administrateurs" s="kevin.m, toi" right={<Icon name="chev" size={18} color={C.mut} />} />
      <SelRow title="Créer un événement" s="challenge, séance de groupe, soirée" right={<Icon name="chev" size={18} color={C.mut} />} />
      <Sub>Les demandes, validations et adhésions deviendront effectives avec le serveur.</Sub>
    </Page>
  );
}
