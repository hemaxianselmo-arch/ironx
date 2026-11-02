import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, ProgressTop, Headline, Search, Media, Shade, Ov, OvText, Btn, SelRow, Avatar, Circ, Icon, CTA, B } from "../../ui";
import { C, man } from "../../theme/tokens";
import { setProfile } from "../../store/profile";

/** D09 · Ta salle */
export default function Salle() {
  return (
    <Page>
      <ProgressTop step={6} total={8} onBack={() => router.back()} />
      <Headline q="Rejoins ta salle" s="Classements, défis collectifs, membres en séance en direct." />
      <Search ph="Nom de la salle, ville ou code" />
      <Media photo="photo-gym" h={150}>
        <Shade />
        <Ov x={14} y={12} anchor="lb">
          <Text style={{ fontFamily: man(700), fontSize: 18, color: "#fff" }}>[NOM DE LA SALLE]</Text>
          <OvText size={12.5}>Lamballe · 86 membres · 1,2 km</OvText>
        </Ov>
        <Ov x={12} y={12} anchor="rb"><Btn label="Rejoindre" kind="white" size="sm" full={false} onPress={() => { setProfile({ salle: "[NOM DE LA SALLE]" }); router.push("/onboarding/autorisations"); }} /></Ov>
      </Media>
      <SelRow visual={<Avatar ini="BF" size={48} />} title="Basic-Fit Saint-Brieuc" s="312 membres · 21 km" right={<Btn label="Rejoindre" kind="secondary" size="sm" full={false} />} />
      <SelRow visual={<Avatar ini="FC" size={48} />} title="Fitness Club Lamballe" s="54 membres · 2,8 km" right={<Btn label="Rejoindre" kind="secondary" size="sm" full={false} />} />
      <SelRow visual={<Circ icon="plus" size={48} />} title="Ma salle n'est pas dans la liste" s="crée sa fiche, tu en deviens l'administrateur" right={<Icon name="chev" size={18} color={C.mut} />} />
      <CTA label="Continuer" onPress={() => router.push("/onboarding/autorisations")} secondary={<>Je m'entraîne à la maison · <B>passer</B></>} onSecondary={() => router.push("/onboarding/autorisations")} />
    </Page>
  );
}
