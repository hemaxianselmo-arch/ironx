// Activités hors musculation : course, Hyrox, street (tests max), CrossFit (WOD), vélo, natation, mobilité
// + forme du jour (bien-être), objectifs, blocs d'entraînement, défis perso. Tout est persisté sur le téléphone.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------- types ----------
/** Course / vélo / natation : une sortie avec ses splits */
export type Run = { id: string; sport: "course" | "velo" | "natation"; at: number; distance: number /* m */; duration: number /* s */; splits?: number[] /* s par km (ou par 100 m natation) */; hr?: number; hrMax?: number; elev?: number; name?: string; kind?: "endurance" | "fractionne" | "seuil" | "sortie longue" | "course" | "recup"; intervals?: { n: number; dist: number; times: number[]; rest: number }; note?: string; power?: number; ftpTest?: boolean };
/** Hyrox : les 8 stations dans l'ordre officiel + 8 courses de 1 km */
export const HYROX_STATIONS = [
  { id: "skierg", name: "SkiErg 1 000 m", short: "SkiErg", unit: "m", target: 1000 },
  { id: "sled-push", name: "Sled push 50 m", short: "Sled push", unit: "m", target: 50 },
  { id: "sled-pull", name: "Sled pull 50 m", short: "Sled pull", unit: "m", target: 50 },
  { id: "burpee", name: "Burpee broad jumps 80 m", short: "Burpees", unit: "m", target: 80 },
  { id: "rowing", name: "Rowing 1 000 m", short: "Rowing", unit: "m", target: 1000 },
  { id: "farmers", name: "Farmers carry 200 m", short: "Farmers", unit: "m", target: 200 },
  { id: "lunges", name: "Sandbag lunges 100 m", short: "Lunges", unit: "m", target: 100 },
  { id: "wallballs", name: "Wall balls 100 reps", short: "Wall balls", unit: "reps", target: 100 },
] as const;
export type HyroxSim = { id: string; at: number; division: "open" | "pro" | "doubles" | "relais"; stations: number[] /* s, 8 */; runs: number[] /* s, 8 */; roxzone?: number; hr?: number; name?: string; partial?: boolean; note?: string };
/** Street workout : tests max (reps, secondes de tenue, lest) par mouvement */
export const STREET_MOVES = [
  { id: "pullup", name: "Tractions", kind: "reps" }, { id: "dips", name: "Dips", kind: "reps" }, { id: "pushup", name: "Pompes", kind: "reps" }, { id: "muscleup", name: "Muscle-up", kind: "reps" },
  { id: "hspu", name: "Pompes en équilibre", kind: "reps" }, { id: "pistol", name: "Pistol squat", kind: "reps" }, { id: "pullup-w", name: "Tractions lestées", kind: "kg" }, { id: "dips-w", name: "Dips lestés", kind: "kg" },
  { id: "frontlever", name: "Front lever", kind: "sec" }, { id: "backlever", name: "Back lever", kind: "sec" }, { id: "planche", name: "Planche", kind: "sec" }, { id: "lsit", name: "L-sit", kind: "sec" }, { id: "handstand", name: "Équilibre", kind: "sec" }, { id: "human-flag", name: "Drapeau", kind: "sec" },
] as const;
export type StreetTest = { id: string; at: number; move: string; value: number /* reps, s ou kg */; variant?: string /* strict, tuck, full… */; note?: string };
/** CrossFit : WOD (For time / AMRAP / EMOM) et benchmarks */
export type Wod = { id: string; at: number; name: string; format: "fortime" | "amrap" | "emom" | "tabata" | "chipper"; result: number /* s (for time) ou reps/rounds (amrap) */; rounds?: number; reps?: number; rx?: boolean; cap?: number; movements: string; note?: string; benchmark?: boolean };
/** Forme du jour (R15) */
export type Wellness = { day: string; sleep?: number /* h */; hrRest?: number; hrv?: number; soreness?: 1 | 2 | 3 | 4 | 5; energy?: 1 | 2 | 3 | 4 | 5; stress?: 1 | 2 | 3 | 4 | 5; motivation?: 1 | 2 | 3 | 4 | 5; weight?: number };
/** Objectif (R07) */
export type Goal = { id: string; kind: "exo1rm" | "exoreps" | "run" | "hyrox" | "street" | "bodyweight" | "sessions"; label: string; ref?: string /* exoId, move, distance */; from: number; to: number; unit: string; deadline?: number; createdAt: number; done?: boolean; lower?: boolean /* true si "plus petit = mieux" (temps) */ };
/** Bloc d'entraînement (R20) */
export type Block = { id: string; name: string; focus: "force" | "hypertrophie" | "endurance" | "hyrox" | "decharge" | "mixte"; weeks: { label: string; intensity: [number, number]; volumeDelta: number }[]; startAt: number; targetLabel?: string; targetValue?: string; active: boolean };
/** Défi perso (R22) */
export type Challenge = { id: string; title: string; sub: string; kind: "self" | "friend" | "gym"; from: number; to: number; cur: number; unit: string; deadline: number; lower?: boolean; createdAt: number; done?: boolean };

type State = { runs: Run[]; hyrox: HyroxSim[]; street: StreetTest[]; wods: Wod[]; wellness: Record<string, Wellness>; goals: Goal[]; blocks: Block[]; challenges: Challenge[]; ftp?: number };
let state: State = { runs: [], hyrox: [], street: [], wods: [], wellness: {}, goals: [], blocks: [], challenges: [] };
const subs = new Set<() => void>(); const KEY = "ironx.activities.v1";
const emit = () => { subs.forEach((f) => f()); AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); };
export async function loadActivities() { try { const raw = await AsyncStorage.getItem(KEY); if (raw) { state = { ...state, ...JSON.parse(raw) }; subs.forEach((f) => f()); } } catch {} }
export const useActivities = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
export const getActivities = () => state;
const nid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const act = {
  addRun(r: Omit<Run, "id">) { const x = { ...r, id: nid() }; state = { ...state, runs: [x, ...state.runs].sort((a, b) => b.at - a.at) }; emit(); return x; },
  removeRun(id: string) { state = { ...state, runs: state.runs.filter((r) => r.id !== id) }; emit(); },
  addHyrox(h: Omit<HyroxSim, "id">) { const x = { ...h, id: nid() }; state = { ...state, hyrox: [x, ...state.hyrox].sort((a, b) => b.at - a.at) }; emit(); return x; },
  removeHyrox(id: string) { state = { ...state, hyrox: state.hyrox.filter((r) => r.id !== id) }; emit(); },
  addStreet(t: Omit<StreetTest, "id">) { const x = { ...t, id: nid() }; state = { ...state, street: [x, ...state.street].sort((a, b) => b.at - a.at) }; emit(); return x; },
  removeStreet(id: string) { state = { ...state, street: state.street.filter((r) => r.id !== id) }; emit(); },
  addWod(w: Omit<Wod, "id">) { const x = { ...w, id: nid() }; state = { ...state, wods: [x, ...state.wods].sort((a, b) => b.at - a.at) }; emit(); return x; },
  removeWod(id: string) { state = { ...state, wods: state.wods.filter((r) => r.id !== id) }; emit(); },
  setWellness(day: string, patch: Partial<Wellness>) { state = { ...state, wellness: { ...state.wellness, [day]: { ...(state.wellness[day] ?? { day }), ...patch } } }; emit(); },
  addGoal(g: Omit<Goal, "id" | "createdAt">) { const x = { ...g, id: nid(), createdAt: Date.now() }; state = { ...state, goals: [x, ...state.goals] }; emit(); return x; },
  updateGoal(id: string, patch: Partial<Goal>) { state = { ...state, goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }; emit(); },
  removeGoal(id: string) { state = { ...state, goals: state.goals.filter((g) => g.id !== id) }; emit(); },
  addBlock(b: Omit<Block, "id">) { const x = { ...b, id: nid() }; state = { ...state, blocks: [x, ...state.blocks.map((o) => (b.active ? { ...o, active: false } : o))] }; emit(); return x; },
  updateBlock(id: string, patch: Partial<Block>) { state = { ...state, blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }; emit(); },
  removeBlock(id: string) { state = { ...state, blocks: state.blocks.filter((b) => b.id !== id) }; emit(); },
  addChallenge(c: Omit<Challenge, "id" | "createdAt">) { const x = { ...c, id: nid(), createdAt: Date.now() }; state = { ...state, challenges: [x, ...state.challenges] }; emit(); return x; },
  updateChallenge(id: string, patch: Partial<Challenge>) { state = { ...state, challenges: state.challenges.map((c) => (c.id === id ? { ...c, ...patch } : c)) }; emit(); },
  removeChallenge(id: string) { state = { ...state, challenges: state.challenges.filter((c) => c.id !== id) }; emit(); },
  setFtp(v: number) { state = { ...state, ftp: v }; emit(); },
};

// ---------- formats ----------
export const fmtTime = (s: number) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`; };
export const fmtTimeLong = (s: number) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`; };
export const fmtPace = (sPerKm: number) => (isFinite(sPerKm) && sPerKm > 0 ? `${Math.floor(sPerKm / 60)}:${String(Math.round(sPerKm % 60)).padStart(2, "0")} /km` : "—");
export const fmtKm = (m: number) => `${(m / 1000).toFixed(m >= 10000 ? 0 : 1).replace(".", ",")} km`;
export const fmtSigned = (s: number) => (s === 0 ? "=" : (s < 0 ? "−" : "+") + fmtTime(Math.abs(s)));
export const pace = (r: Run) => (r.distance > 0 ? r.duration / (r.distance / 1000) : 0);
export const hyroxTotal = (h: HyroxSim) => h.stations.reduce((a, b) => a + b, 0) + h.runs.reduce((a, b) => a + b, 0) + (h.roxzone ?? 0);

// ---------- calculs course ----------
/** Meilleur temps par distance (1, 5, 10, 21,1, 42,2 km) à partir des sorties */
export const RUN_DISTS: [number, string][] = [[1000, "1 km"], [5000, "5 km"], [10000, "10 km"], [21097, "Semi"], [42195, "Marathon"]];
export function bestRun(dist: number, sport: Run["sport"] = "course"): Run | undefined {
  const c = state.runs.filter((r) => r.sport === sport && r.distance >= dist * 0.98);
  if (!c.length) return undefined;
  // temps estimé sur la distance = temps × (dist / distance totale) (allure moyenne), ou splits si 1 km
  const t = (r: Run) => (dist === 1000 && r.splits?.length ? Math.min(...r.splits) : r.duration * (dist / r.distance));
  return c.reduce((a, b) => (t(b) < t(a) ? b : a));
}
export const bestRunTime = (dist: number) => { const r = bestRun(dist); if (!r) return undefined; return dist === 1000 && r.splits?.length ? Math.min(...r.splits) : r.duration * (dist / r.distance); };
/** Prédiction de Riegel : T2 = T1 × (D2/D1)^1,06 */
export const riegel = (t1: number, d1: number, d2: number) => t1 * Math.pow(d2 / d1, 1.06);
/** VO2max estimée (Daniels/Gilbert simplifié) depuis une perf */
export function vo2max(t: number, d: number) { const v = d / (t / 60); const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * (t / 60)) + 0.2989558 * Math.exp(-0.1932605 * (t / 60)); const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v; return Math.round(vo2 / pct); }
/** Zones cardiaques (Karvonen simplifié sur FC max) */
export const hrZones = (hrMax: number) => [[0.5, 0.6, "Z1 récup"], [0.6, 0.7, "Z2 endurance"], [0.7, 0.8, "Z3 tempo"], [0.8, 0.9, "Z4 seuil"], [0.9, 1, "Z5 VO2max"]].map(([a, b, l]) => ({ label: l as string, lo: Math.round(hrMax * (a as number)), hi: Math.round(hrMax * (b as number)) }));

// ---------- calculs Hyrox ----------
export function bestHyrox(): HyroxSim | undefined { const c = state.hyrox.filter((h) => !h.partial); return c.length ? c.reduce((a, b) => (hyroxTotal(b) < hyroxTotal(a) ? b : a)) : undefined; }
/** Meilleur temps par station toutes simulations confondues */
export function bestStations() { return HYROX_STATIONS.map((_, i) => { const v = state.hyrox.map((h) => h.stations[i]).filter((x) => x > 0); return v.length ? Math.min(...v) : undefined; }); }
/** Prédiction Hyrox à partir des tests en salle (SkiErg 1 000, rameur 1 000, 5 km, sled) : somme + 8 km à l'allure 5 km × 1,12 + roxzone 4 min */
export function predictHyrox(): { total: number; reliability: number; parts: string[] } | undefined {
  const parts: string[] = []; let total = 0; let known = 0;
  const bs = bestStations();
  HYROX_STATIONS.forEach((s, i) => { if (bs[i]) { total += bs[i]!; known++; parts.push(`${s.short} ${fmtTime(bs[i]!)}`); } else { total += [240, 180, 240, 300, 250, 120, 270, 400][i]; } });
  const t5 = bestRunTime(5000); if (t5) { total += (t5 / 5) * 8 * 1.12; known++; parts.push(`5 km ${fmtTime(t5)}`); } else total += 8 * 330;
  total += 240;
  if (!known) return undefined;
  return { total, reliability: Math.round((known / 9) * 100), parts };
}

// ---------- street ----------
export function bestStreet(move: string): StreetTest | undefined { const c = state.street.filter((t) => t.move === move); return c.length ? c.reduce((a, b) => (b.value > a.value ? b : a)) : undefined; }
export const streetMove = (id: string) => STREET_MOVES.find((m) => m.id === id);
export const fmtStreet = (move: string, v: number) => { const k = streetMove(move)?.kind; return k === "sec" ? `${v} s` : k === "kg" ? `+${String(v).replace(".", ",")} kg` : `${v} reps`; };

// ---------- forme du jour (R15) ----------
/** Score 0-100 : sommeil, FC repos vs moyenne, VFC vs moyenne, courbatures, énergie, stress, motivation */
export function readiness(day = dayKey()): { score: number; tips: string[]; w: Wellness } {
  const w = state.wellness[day] ?? { day }; const hist = Object.values(state.wellness).filter((x) => x.day !== day).slice(-14);
  let score = 60; const tips: string[] = [];
  if (w.sleep != null) { score += w.sleep >= 7.5 ? 15 : w.sleep >= 6.5 ? 6 : w.sleep >= 5.5 ? -5 : -15; if (w.sleep < 6.5) tips.push("Nuit courte : garde les charges, baisse le volume de 20 %."); }
  const avg = (k: "hrRest" | "hrv") => { const v = hist.map((x) => x[k]).filter((x): x is number => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined; };
  const ah = avg("hrRest"); if (w.hrRest != null && ah) { const d = w.hrRest - ah; score += d <= -2 ? 6 : d >= 5 ? -12 : d >= 3 ? -6 : 0; if (d >= 5) tips.push("FC de repos élevée : signe de fatigue ou de début d'infection, séance légère."); }
  const av = avg("hrv"); if (w.hrv != null && av) { const d = (w.hrv - av) / av; score += d >= 0.05 ? 8 : d <= -0.15 ? -12 : d <= -0.08 ? -5 : 0; if (d <= -0.15) tips.push("VFC en baisse nette : privilégie la technique et la mobilité."); }
  if (w.soreness) { score += [0, 8, 4, 0, -8, -15][w.soreness]; if (w.soreness >= 4) tips.push("Courbatures fortes : change de groupe musculaire ou fais une séance de rappel."); }
  if (w.energy) score += [0, -10, -5, 0, 5, 10][w.energy];
  if (w.stress) score += [0, 6, 3, 0, -4, -8][w.stress];
  if (w.motivation) score += [0, -6, -3, 0, 3, 6][w.motivation];
  score = Math.max(0, Math.min(100, Math.round(score)));
  if (!tips.length) tips.push(score >= 80 ? "Tout est au vert : vise un top set ou un record aujourd'hui." : score >= 60 ? "Journée normale : suis le plan prévu." : "Récupération incomplète : allège la séance ou décale-la.");
  return { score, tips, w };
}

// ---------- charge aiguë / chronique (R05) ----------
/** ACWR = charge 7 j / moyenne hebdo des 28 j. loads : liste [timestamp, charge] */
export function acwr(loads: [number, number][]) {
  const now = Date.now(); const sum = (days: number) => loads.filter(([t]) => now - t < days * 86400e3).reduce((a, [, v]) => a + v, 0);
  const acute = sum(7), chronic = sum(28) / 4;
  return { acute, chronic, ratio: chronic > 0 ? acute / chronic : 0 };
}
/** Semaine ISO (n°) */
export function isoWeek(t: number) { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)); const w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400e3 - 3 + ((w1.getDay() + 6) % 7)) / 7); }
