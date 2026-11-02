import React, { useState } from "react";
import { router } from "expo-router";
import { Page, Top, Circ, Search, Pills, MemberRow, Btn, Sub } from "../../ui";
import { useGym, gym, MEMBERS } from "../../store/gym";

/** G02 · Membres */
export default function Membres() {
  const g = useGym(); const [q, setQ] = useState(""); const [f, setF] = useState(0);
  const list = MEMBERS.filter((m) => (!q || m.name.includes(q.toLowerCase())) && [true, m.weekSessions >= 3, !!m.live, !!m.new, !!m.admin][f]);
  return (
    <Page>
      <Top title="Membres" sub={`${MEMBERS.length + 78} membres · ${MEMBERS.filter((m) => m.weekSessions > 0).length + 23} actifs cette semaine`} right={<Circ icon="filter" size={38} />} onBack={() => router.back()} />
      <Search ph="Rechercher un membre" value={q} onChange={setQ} />
      <Pills items={["Tous", "Actifs", "En séance", "Nouveaux", "Admins"]} on={f} onChange={setF} />
      {list.map((m) => { const on = g.following.includes(m.id); return (
        <MemberRow key={m.id} ini={m.ini} name={m.name} ring={m.weekSessions >= 3} s={`${m.discipline}${m.live ? " · en séance" : m.new ? " · nouveau" : m.km ? ` · ${m.km} km ce mois` : ` · ${m.weekSessions} séances cette semaine`}`} right={<Btn label={on ? "Suivi" : "Suivre"} kind={on ? "secondary" : "primary"} size="sm" full={false} onPress={() => gym.follow(m.id)} />} onPress={() => router.push({ pathname: "/salle/membre", params: { id: m.id } })} />); })}
      {!list.length ? <Sub>Aucun membre dans ce filtre.</Sub> : null}
    </Page>
  );
}
