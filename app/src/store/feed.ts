// Fil social : posts (démo + les tiens), bravos, commentaires, stories — local jusqu'au serveur
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Comment = { id: string; ini: string; user: string; text: string; at: number; likes: number; me?: boolean; reply?: boolean };
export type Post = { id: string; ini: string; user: string; gym: string; caption: string; seance: string; photo: string; uri?: string; sound: string; likes: number; bravos: number; comments: Comment[]; at: number; me?: boolean; liked?: boolean; bravoed?: boolean; scope: "salle" | "pourtoi" | "abonnements"; tags: string[] };
export type Story = { id: string; ini: string; user: string; photo: string; uri?: string; at: number; me?: boolean; seen?: boolean; caption?: string };
const SEED: Post[] = [
  { id: "p1", ini: "TL", user: "thomas.lft", gym: "[NOM DE LA SALLE]", caption: "Nouveau PR au couché, 110 kg x 3. Le dernier rep a failli rester.", tags: ["powerlifting", "ironx"], seance: "Push lourd · 48 min · 7,8 t", photo: "photo-deadlift", sound: "son original", likes: 1284, bravos: 96, at: Date.now() - 3600e3, scope: "pourtoi",
    comments: [{ id: "c1", ini: "KM", user: "kevin.m", text: "Propre le dernier rep 🔥 on se voit samedi pour le challenge", at: Date.now() - 720e3, likes: 24 }, { id: "c2", ini: "TL", user: "thomas.lft", text: "Merci frérot, 115 la prochaine", at: Date.now() - 600e3, likes: 8, reply: true }, { id: "c3", ini: "JB", user: "julie.b", text: "Le spot était limite 😅", at: Date.now() - 3600e3, likes: 12 }, { id: "c4", ini: "SL", user: "sarah.l", text: "Bravo ! Tu mets quelle pause en bas ?", at: Date.now() - 7200e3, likes: 3 }] },
  { id: "p2", ini: "JB", user: "julie.b", gym: "[NOM DE LA SALLE] · en séance", caption: "Simulation Hyrox, sled push 152 kg. On est 2 pour le 15 novembre, qui vient ?", tags: ["hyrox"], seance: "Hyrox simulation · 1 h 12 · station 5", photo: "photo-sled", sound: "Night Drive · Kaelo", likes: 412, bravos: 38, at: Date.now() - 2 * 3600e3, scope: "salle", comments: [{ id: "c5", ini: "AD", user: "alex.d", text: "Hyrox samedi, je viens !", at: Date.now() - 1800e3, likes: 1 }] },
  { id: "p3", ini: "KM", user: "kevin.m", gym: "[NOM DE LA SALLE]", caption: "Squat 150 kg, enfin. Six mois de travail.", tags: ["squat", "record"], seance: "Legs · 1 h 05 · 9,8 t", photo: "photo-squat", sound: "son original", likes: 2210, bravos: 180, at: Date.now() - 5 * 3600e3, scope: "salle", comments: [] },
  { id: "p4", ini: "SL", user: "sarah.l", gym: "Parc de Lamballe", caption: "Front lever 8 secondes, le full arrive.", tags: ["street", "frontlever"], seance: "Street · figures · 50 min", photo: "photo-chalk", sound: "Iron Mind · Rvge", likes: 860, bravos: 64, at: Date.now() - 8 * 3600e3, scope: "abonnements", comments: [] },
  { id: "p5", ini: "AD", user: "alex.d", gym: "Course · Lamballe", caption: "10 km sous la pluie, 47:52. Nouveau record perso.", tags: ["course", "10km"], seance: "Course · 47:52 · 4:47 /km", photo: "photo-run-rain", sound: "son original", likes: 530, bravos: 41, at: Date.now() - 26 * 3600e3, scope: "pourtoi", comments: [] },
  { id: "p6", ini: "MR", user: "marc.r", gym: "[NOM DE LA SALLE]", caption: "Wall balls 100 pour le temps, 6:40. Les jambes brûlent.", tags: ["crossfit", "wod"], seance: "WOD · 24 min", photo: "photo-wallball", sound: "son original", likes: 300, bravos: 22, at: Date.now() - 30 * 3600e3, scope: "salle", comments: [] },
];
const SEED_STORIES: Story[] = [{ id: "s1", ini: "PR", user: "Records", photo: "photo-bench", at: Date.now() - 3600e3 }, { id: "s2", ini: "HX", user: "Hyrox", photo: "photo-w-rower", at: Date.now() - 7200e3 }, { id: "s3", ini: "CL", user: "Carnet", photo: "photo-gym", at: Date.now() - 10800e3, seen: true }];
type State = { posts: Post[]; stories: Story[]; drafts: { uri?: string; photo?: string; caption: string; sound: string; filter: number } | null };
let state: State = { posts: SEED, stories: SEED_STORIES, drafts: null };
const subs = new Set<() => void>(); const KEY = "ironx.feed.v1";
const emit = () => { subs.forEach((f) => f()); AsyncStorage.setItem(KEY, JSON.stringify({ mine: state.posts.filter((p) => p.me), reactions: state.posts.filter((p) => !p.me).map((p) => ({ id: p.id, liked: p.liked, bravoed: p.bravoed, comments: p.comments.filter((c) => c.me) })), stories: state.stories.filter((s) => s.me) })).catch(() => {}); };
export async function loadFeed() {
  try { const raw = await AsyncStorage.getItem(KEY); if (!raw) return; const d = JSON.parse(raw);
    const posts = SEED.map((p) => { const r = d.reactions?.find((x: any) => x.id === p.id); return r ? { ...p, liked: r.liked, bravoed: r.bravoed, likes: p.likes + (r.liked ? 1 : 0), bravos: p.bravos + (r.bravoed ? 1 : 0), comments: [...p.comments, ...(r.comments ?? [])] } : p; });
    state = { ...state, posts: [...(d.mine ?? []), ...posts].sort((a, b) => b.at - a.at), stories: [...(d.stories ?? []), ...SEED_STORIES] }; subs.forEach((f) => f()); } catch {}
}
export const useFeed = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
const up = (id: string, f: (p: Post) => Post) => { state = { ...state, posts: state.posts.map((p) => (p.id === id ? f(p) : p)) }; emit(); };
export const feed = {
  like(id: string) { up(id, (p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) })); },
  bravo(id: string) { up(id, (p) => ({ ...p, bravoed: !p.bravoed, bravos: p.bravos + (p.bravoed ? -1 : 1) })); },
  comment(id: string, text: string, ini: string) { if (!text.trim()) return; up(id, (p) => ({ ...p, comments: [...p.comments, { id: String(Date.now()), ini, user: "toi", text: text.trim(), at: Date.now(), likes: 0, me: true }] })); },
  publish(p: Omit<Post, "id" | "at" | "likes" | "bravos" | "comments" | "me">) { state = { ...state, posts: [{ ...p, id: "me-" + Date.now(), at: Date.now(), likes: 0, bravos: 0, comments: [], me: true }, ...state.posts], drafts: null }; emit(); },
  remove(id: string) { state = { ...state, posts: state.posts.filter((p) => p.id !== id) }; emit(); },
  addStory(s: Omit<Story, "id" | "at" | "me">) { state = { ...state, stories: [{ ...s, id: "st-" + Date.now(), at: Date.now(), me: true }, ...state.stories] }; emit(); },
  seen(id: string) { state = { ...state, stories: state.stories.map((s) => (s.id === id ? { ...s, seen: true } : s)) }; subs.forEach((f) => f()); },
  setDraft(d: State["drafts"]) { state = { ...state, drafts: d }; subs.forEach((f) => f()); },
};
export const fmtN = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",").replace(",0", "")} k` : String(n));
export const ago = (t: number) => { const m = Math.round((Date.now() - t) / 60e3); return m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} j`; };
