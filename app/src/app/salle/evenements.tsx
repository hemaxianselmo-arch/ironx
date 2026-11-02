import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Page, Top, Circ, Pills, Media, Shade, Ov, OvText, OvTitle, Pill, Btn, Sub } from "../../ui";
import { C, inter, man } from "../../theme/tokens";
import { useGym, gym, EVENTS } from "../../store/gym";

/** G07 · Événements */
export default function Evenements() {
  const g = useGym(); const [f, setF] = useState(0);
  const list = f === 2 ? EVENTS.filter((e) => g.rsvp.includes(e.id)) : f === 1 ? [] : EVENTS;
  const hero = list[0];
  return (
    <Page>
      <Top title="Événements" right={<Circ icon="plus" size={38} kind="primary" onPress={() => router.push("/salle/admin")} />} onBack={() => router.back()} />
      <Pills items={["À venir", "Passés", "Mes inscriptions"]} on={f} onChange={setF} />
      {hero ? (
        <Media photo={hero.photo as any} h={190} r={22}>
          <Shade />
          <Ov x={16} y={14} anchor="lb"><OvText>{hero.date}</OvText><OvTitle size={24}>{hero.title}</OvTitle><OvText size={12.5} dim={0.85}>{hero.s} · {hero.n + (g.rsvp.includes(hero.id) ? 1 : 0)} inscrits</OvText></Ov>
          <Ov x={14} y={14} anchor="rt"><Pill label={g.rsvp.includes(hero.id) ? "Inscrit" : "S'inscrire"} on={g.rsvp.includes(hero.id)} onPress={() => gym.rsvp(hero.id)} /></Ov>
        </Media>
      ) : <Sub>{f === 1 ? "Les événements passés apparaîtront ici." : "Aucune inscription pour l'instant."}</Sub>}
      {list.slice(1).map((e) => { const on = g.rsvp.includes(e.id); return (
        <View key={e.id} style={{ flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 8 }}>
          <Media photo={e.photo as any} h={72} w={72} r={14}><Shade /><View style={{ position: "absolute", left: 0, right: 0, bottom: 6, alignItems: "center" }}><Text style={{ fontFamily: inter(400), fontSize: 9, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>{e.month}</Text><Text style={{ fontFamily: man(700), fontSize: 18, color: "#fff" }}>{e.day}</Text></View></Media>
          <View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: inter(700), fontSize: 15, color: C.txt }}>{e.title}</Text><Text style={{ fontFamily: inter(400), fontSize: 12.5, color: C.mut }}>{e.s} · {e.n + (on ? 1 : 0)} inscrits</Text></View>
          <Btn label={on ? "Inscrit" : "S'inscrire"} kind={on ? "secondary" : "primary"} size="sm" full={false} onPress={() => gym.rsvp(e.id)} />
        </View>); })}
    </Page>
  );
}
