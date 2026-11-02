// Profil utilisateur (onboarding) + calculs : calories, macros, rythme, programme proposé
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Goal = "muscle" | "fat" | "perf" | "regular";
export type Profile = {
  prenom: string; pseudo: string; sexe: 0 | 1 | 2; naissance: string; niveau: 0 | 1 | 2;
  unit: 0 | 1; taille: number; poids: number;
  goal: Goal; poidsVise: number;
  seances: number; jours: number[]; duree: 0 | 1 | 2 | 3; creneau: 0 | 1 | 2 | 3; rappel: boolean;
  disciplines: string[]; salle: string | null; visibilite: 0 | 1 | 2;
  onboarded: boolean;
};
export const DEFAULT: Profile = {
  prenom: "", pseudo: "", sexe: 0, naissance: "1986-04-12", niveau: 1, unit: 0, taille: 178, poids: 82,
  goal: "muscle", poidsVise: 86, seances: 4, jours: [0, 1, 3, 4], duree: 1, creneau: 2, rappel: true,
  disciplines: ["bodybuilding"], salle: null, visibilite: 0, onboarded: false,
};
let state: Profile = { ...DEFAULT };
const subs = new Set<() => void>();
const KEY = "ironx.profile.v1";
export async function loadProfile() {
  try { const raw = await AsyncStorage.getItem(KEY); if (raw) { state = { ...DEFAULT, ...JSON.parse(raw) }; subs.forEach((f) => f()); } } catch {}
}
export function useProfile() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
}
export function setProfile(patch: Partial<Profile>) {
  state = { ...state, ...patch }; subs.forEach((f) => f());
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

// ---------- calculs ----------
export const age = (p: Profile) => { const d = new Date(p.naissance); const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a; };
const DUREE_MIN = [45, 60, 90, 120];

/** Métabolisme de base (Mifflin-St Jeor) */
export const bmr = (p: Profile) => Math.round(10 * p.poids + 6.25 * p.taille - 5 * age(p) + (p.sexe === 1 ? -161 : 5));
/** Dépense journalière : base × activité (séances/semaine et durée) + coût direct de l'entraînement */
export function tdee(p: Profile) {
  const minParSem = p.seances * DUREE_MIN[p.duree];
  const naf = 1.35 + Math.min(0.35, minParSem / 1200); // 1,35 sédentaire actif → 1,7 très actif
  const sport = Math.round((minParSem * 7.5) / 7); // ~7,5 kcal/min de musculation lissé sur la semaine
  return Math.round(bmr(p) * naf + sport);
}
/** Cible calorique selon l'objectif */
export function kcalTarget(p: Profile) {
  const t = tdee(p);
  const adj = { muscle: +300, fat: -450, perf: +100, regular: 0 }[p.goal];
  return Math.round((t + adj) / 10) * 10;
}
/** Macros : protéines 2 g/kg (2,2 en sèche), lipides 0,9 g/kg (min 50 g), reste en glucides */
export function macros(p: Profile) {
  const kcal = kcalTarget(p);
  const prot = Math.round(p.poids * (p.goal === "fat" ? 2.2 : 2.0));
  const lip = Math.max(50, Math.round(p.poids * 0.9));
  const gluc = Math.max(80, Math.round((kcal - prot * 4 - lip * 9) / 4));
  return { kcal, prot, lip, gluc };
}
/** Rythme hebdomadaire conseillé (kg/sem) et nombre de semaines jusqu'au poids visé */
export function pace(p: Profile) {
  const diff = p.poidsVise - p.poids;
  const rate = p.goal === "fat" ? -0.5 : p.goal === "muscle" ? +0.25 : diff === 0 ? 0 : diff > 0 ? 0.2 : -0.3;
  const weeks = rate === 0 || Math.sign(diff) !== Math.sign(rate) ? 0 : Math.ceil(Math.abs(diff / rate));
  return { rate, weeks };
}
export const fmtRate = (r: number) => (r === 0 ? "maintien" : `${r > 0 ? "+" : "−"}${String(Math.abs(r)).replace(".", ",")} kg / sem.`);
export const GOAL_LABEL: Record<Goal, string> = { muscle: "Prise de muscle", fat: "Perte de gras", perf: "Performance", regular: "Régularité" };

/** Programme proposé selon le nombre de jours, les disciplines et le niveau */
export type Program = { name: string; family: string; weeks: number; days: string[]; discipline: string };
export function suggestProgram(p: Profile): Program {
  const n = Math.min(6, Math.max(2, p.seances));
  const power = p.disciplines.includes("powerlifting") || p.goal === "perf";
  const hyrox = p.disciplines.includes("hyrox");
  const plans: Record<number, Program> = {
    2: { name: "Full body · 2 jours", family: "Full body", weeks: 6, days: ["Full A", "Full B"], discipline: "bodybuilding" },
    3: { name: power ? "Force 5/3/1 · 3 jours" : "Full body · 3 jours", family: power ? "Force" : "Full body", weeks: 6, days: power ? ["Squat", "Couché", "Soulevé"] : ["Full A", "Full B", "Full C"], discipline: power ? "powerlifting" : "bodybuilding" },
    4: { name: power ? "Force Upper / Lower · 4 jours" : "Upper / Lower · 4 jours", family: "Upper / Lower", weeks: 6, days: ["Haut A", "Bas A", "Haut B", "Bas B"], discipline: power ? "powerlifting" : "bodybuilding" },
    5: { name: "PPL + Upper / Lower · 5 jours", family: "Hybride", weeks: 6, days: ["Push", "Pull", "Legs", "Haut", "Bas"], discipline: "bodybuilding" },
    6: { name: "PPL · 6 jours", family: "Push / Pull / Legs", weeks: 6, days: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"], discipline: "bodybuilding" },
  };
  const prog = plans[n];
  if (hyrox && n >= 4) { const d = [...prog.days]; d[d.length - 1] = "Hyrox"; return { ...prog, name: prog.name.replace(/ · \d jours/, "") + " + Hyrox", days: d }; }
  return prog;
}
/** Répartition sur la semaine : jours choisis → nom de la séance, autres → repos */
export function weekPlan(p: Profile): [string, string][] {
  const prog = suggestProgram(p); const jours = [...p.jours].sort(); let k = 0;
  return "LMMJVSD".split("").map((d, i) => [d, jours.includes(i) && k < prog.days.length ? prog.days[k++] : ""]);
}
