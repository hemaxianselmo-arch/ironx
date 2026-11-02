// Salle : membres, classements, défis, événements, discussion — données de démonstration locales en attendant le serveur,
// mais TES chiffres (volume, records, séances) sont réels et comptent dans les classements et les défis.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Member = { id: string; ini: string; name: string; discipline: string; weekSessions: number; weekVol: number; monthVol: number; bench: number; squat: number; deadlift: number; bw: number; live?: string; liveSince?: number; admin?: boolean; new?: boolean; km?: number };
export const MEMBERS: Member[] = [
  { id: "kevin", ini: "KM", name: "kevin.m", discipline: "Powerlifting", weekSessions: 5, weekVol: 38200, monthVol: 41200, bench: 135, squat: 170, deadlift: 220, bw: 88, admin: true },
  { id: "thomas", ini: "TL", name: "thomas.lft", discipline: "Bodybuilding", weekSessions: 4, weekVol: 31800, monthVol: 36800, bench: 110, squat: 150, deadlift: 190, bw: 82, live: "Push", liveSince: Date.now() - 24 * 60e3 },
  { id: "julie", ini: "JB", name: "julie.b", discipline: "Hyrox", weekSessions: 4, weekVol: 21200, monthVol: 29100, bench: 55, squat: 90, deadlift: 110, bw: 62, live: "Hyrox", liveSince: Date.now() - 18 * 60e3, km: 34 },
  { id: "marc", ini: "MR", name: "marc.r", discipline: "CrossFit", weekSessions: 3, weekVol: 18400, monthVol: 22000, bench: 100, squat: 140, deadlift: 180, bw: 85, new: true },
  { id: "sarah", ini: "SL", name: "sarah.l", discipline: "Street workout", weekSessions: 4, weekVol: 9800, monthVol: 14200, bench: 50, squat: 80, deadlift: 100, bw: 58 },
  { id: "alex", ini: "AD", name: "alex.d", discipline: "Course", weekSessions: 3, weekVol: 12100, monthVol: 16500, bench: 92.5, squat: 120, deadlift: 150, bw: 76, km: 42 },
  { id: "paul", ini: "PN", name: "paul.n", discipline: "Bodybuilding", weekSessions: 2, weekVol: 15600, monthVol: 19800, bench: 90, squat: 130, deadlift: 160, bw: 80 },
  { id: "lea", ini: "LD", name: "lea.d", discipline: "Hyrox", weekSessions: 3, weekVol: 14300, monthVol: 20100, bench: 60, squat: 95, deadlift: 120, bw: 64, km: 28 },
];
export type Msg = { id: string; from: string; ini: string; text: string; at: number; me?: boolean; media?: string };
export type Event = { id: string; title: string; s: string; date: string; day: number; month: string; n: number; photo: string; pos?: string };
export const EVENTS: Event[] = [
  { id: "bench", title: "Challenge développé couché", s: "3 essais · catégories de poids", date: "Samedi 8 novembre · 10:00", day: 8, month: "nov", n: 18, photo: "photo-bench" },
  { id: "hyrox", title: "Séance de groupe Hyrox", s: "Samedi 9:00 · équipes de 2", date: "Samedi 15 novembre · 9:00", day: 15, month: "nov", n: 12, photo: "photo-sled" },
  { id: "street", title: "Initiation street workout", s: "Samedi 11:00 · tous niveaux", date: "Samedi 22 novembre · 11:00", day: 22, month: "nov", n: 6, photo: "photo-w-pullup" },
  { id: "soiree", title: "Soirée résultats du défi", s: "Vendredi 19:00 · remise des badges", date: "Vendredi 29 novembre · 19:00", day: 29, month: "nov", n: 31, photo: "photo-class" },
];
const SEED_MSGS: Msg[] = [
  { id: "1", from: "kevin.m", ini: "KM", text: "Quelqu'un pour un spot au couché vers 18h30 ?", at: Date.now() - 50 * 60e3 },
  { id: "2", from: "thomas.lft", ini: "TL", text: "Le défi passe les 650 t ce soir si on s'y met tous 💪", at: Date.now() - 40 * 60e3 },
  { id: "3", from: "julie.b", ini: "JB", text: "Hyrox samedi, il reste 2 places par équipe.", at: Date.now() - 30 * 60e3 },
];
type State = { gymName: string; following: string[]; messages: Msg[]; rsvp: string[]; cheers: number; challengeOther: { name: string; vol: number; ini: string } };
let state: State = { gymName: "[NOM DE LA SALLE]", following: ["kevin", "thomas"], messages: SEED_MSGS, rsvp: ["bench"], cheers: 0, challengeOther: { name: "Basic-Fit St-Brieuc", vol: 19300, ini: "BF" } };
const subs = new Set<() => void>(); const KEY = "ironx.gym.v1";
const emit = () => { subs.forEach((f) => f()); AsyncStorage.setItem(KEY, JSON.stringify({ gymName: state.gymName, following: state.following, messages: state.messages.filter((m) => m.me), rsvp: state.rsvp, cheers: state.cheers })).catch(() => {}); };
export async function loadGym() { try { const raw = await AsyncStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); state = { ...state, ...d, messages: [...SEED_MSGS, ...(d.messages ?? [])].sort((a, b) => a.at - b.at) }; subs.forEach((f) => f()); } } catch {} }
export const useGym = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
export const gym = {
  setName(n: string) { state = { ...state, gymName: n }; emit(); },
  follow(id: string) { state = { ...state, following: state.following.includes(id) ? state.following.filter((x) => x !== id) : [...state.following, id] }; emit(); },
  send(text: string, ini: string) { if (!text.trim()) return; state = { ...state, messages: [...state.messages, { id: String(Date.now()), from: "Toi", ini, text: text.trim(), at: Date.now(), me: true }] }; emit(); },
  rsvp(id: string) { state = { ...state, rsvp: state.rsvp.includes(id) ? state.rsvp.filter((x) => x !== id) : [...state.rsvp, id] }; emit(); },
  cheer() { state = { ...state, cheers: state.cheers + 1 }; emit(); },
};
export const fmtT = (kg: number) => `${(kg / 1000).toFixed(1).replace(".", ",")} t`;
export const CHALLENGE = { name: "1 000 tonnes ensemble", goal: 1_000_000, base: 623_600, endsIn: 12, participants: 54 };
