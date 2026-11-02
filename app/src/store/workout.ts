// Magasin de la séance : séance en cours + historique, persistés sur le téléphone (AsyncStorage)
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Template, TemplateSet, SetKind, PREVIOUS_BEST, e1rm, byId } from "../data/seed";
import { Exercise } from "../data/exercises";

export type LoggedSet = { kg: number; reps: number; rpe?: number; done: boolean; pr?: boolean; flags?: string[]; targetRpe?: number; kind?: SetKind; targetReps?: number };
export type ActiveExo = { exoId: string; rest: number; note?: string; superset?: boolean; sets: LoggedSet[] };
export type Session = { id: string; templateId: string; name: string; program: string; startedAt: number; endedAt?: number; exos: ActiveExo[]; photo: string };
export type PR = { exoId: string; kg: number; reps: number; prevKg?: number; prevReps?: number };

type State = { active: Session | null; history: Session[]; lastPR: PR | null; restUntil: number | null; restTotal: number };
let state: State = { active: null, history: [], lastPR: null, restUntil: null, restTotal: 0 };
const subs = new Set<() => void>();
const emit = () => { subs.forEach((f) => f()); persist(); };
const KEY = "ironx.workout.v1";
let loaded = false;

async function persist() {
  try { await AsyncStorage.setItem(KEY, JSON.stringify({ active: state.active, history: state.history })); } catch {}
}
export async function loadWorkouts() {
  if (loaded) return; loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); state = { ...state, active: d.active ?? null, history: d.history ?? [] }; subs.forEach((f) => f()); }
  } catch {}
}
export function useWorkout() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
}

export const volume = (s: Session) => s.exos.reduce((a, e) => a + e.sets.filter((x) => x.done).reduce((b, x) => b + x.kg * x.reps, 0), 0);
export const setsDone = (s: Session) => s.exos.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
export const repsDone = (s: Session) => s.exos.reduce((a, e) => a + e.sets.filter((x) => x.done).reduce((b, x) => b + x.reps, 0), 0);
export const fmtT = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(s / 60), r = s % 60; return `${m}:${String(r).padStart(2, "0")}`; };
export const fmtKg = (v: number) => String(v).replace(".", ",");
export const fmtVol = (kg: number) => (kg >= 1000 ? fmtKg(Math.round(kg / 100) / 10) + " t" : Math.round(kg) + " kg");

/** Meilleure performance connue pour un exercice (historique + données de départ) */
function bestFor(exoId: string): TemplateSet | undefined {
  const all: TemplateSet[] = [...(PREVIOUS_BEST[exoId] ?? [])];
  for (const s of state.history) for (const e of s.exos) if (e.exoId === exoId) for (const x of e.sets) if (x.done) all.push({ kg: x.kg, reps: x.reps });
  if (!all.length) return undefined;
  return all.reduce((a, b) => (e1rm(b.kg, b.reps) > e1rm(a.kg, a.reps) ? b : a));
}
export const bestOf = bestFor;
/** Meilleur connu + séries déjà validées de cet exercice dans la séance en cours (hors série si) */
function bestWithActive(exo: ActiveExo, si: number): TemplateSet | undefined {
  const all: TemplateSet[] = []; const b = bestFor(exo.exoId); if (b) all.push(b);
  exo.sets.forEach((x, i) => { if (x.done && i !== si) all.push({ kg: x.kg, reps: x.reps }); });
  if (!all.length) return undefined;
  return all.reduce((a, c) => (e1rm(c.kg, c.reps) > e1rm(a.kg, a.reps) ? c : a));
}
/** Charge la plus lourde jamais faite (affichage « Record ») */
export function heaviest(exoId: string): TemplateSet | undefined {
  const all: TemplateSet[] = [...(PREVIOUS_BEST[exoId] ?? [])];
  for (const s of state.history) for (const e of s.exos) if (e.exoId === exoId) for (const x of e.sets) if (x.done) all.push({ kg: x.kg, reps: x.reps });
  if (!all.length) return undefined;
  return all.reduce((a, b) => (b.kg > a.kg || (b.kg === a.kg && b.reps > a.reps) ? b : a));
}

export const actions = {
  start(t: Template) {
    state = { ...state, active: { id: String(Date.now()), templateId: t.id, name: t.name, program: t.program, startedAt: Date.now(), photo: t.photo,
      exos: t.exos.map((e) => ({ exoId: e.exoId, rest: e.rest, note: e.note, superset: e.superset, sets: e.sets.map((s) => ({ kg: s.kg, reps: s.reps, targetReps: s.reps, targetRpe: s.rpe, kind: s.kind, done: false })) })) }, lastPR: null, restUntil: null };
    emit();
  },
  /** Valide une série : détecte le record (1RM estimé supérieur au meilleur connu) et lance le repos */
  logSet(ei: number, si: number, kg: number, reps: number, rpe?: number, flags?: string[]) {
    const a = state.active; if (!a) return;
    const exo = a.exos[ei]; const best = bestWithActive(exo, si);
    // record seulement si on bat un meilleur connu (la toute première fois n'est pas un record)
    const pr = reps > 0 && kg > 0 && !!best && e1rm(kg, reps) > e1rm(best.kg, best.reps);
    const sets = exo.sets.map((s, i) => (i === si ? { ...s, kg, reps, rpe: rpe ?? s.rpe, flags: flags ?? s.flags, done: true, pr } : s));
    const exos = a.exos.map((e, i) => (i === ei ? { ...e, sets } : e));
    // enchaîné avec le suivant (superset) : pas de repos ; drop set / rest-pause : repos très court
    const nextKind = exo.sets[si + 1]?.kind; const rest = exo.superset ? 0 : nextKind === "drop" ? 0 : nextKind === "restpause" ? 20 : exo.rest;
    state = { ...state, active: { ...a, exos }, lastPR: pr ? { exoId: exo.exoId, kg, reps, prevKg: best?.kg, prevReps: best?.reps } : null, restUntil: rest > 0 ? Date.now() + rest * 1000 : null, restTotal: rest };
    emit();
  },
  /** Modifie une série (prévue ou déjà validée) sans lancer le repos */
  editSet(ei: number, si: number, patch: Partial<LoggedSet>) {
    const a = state.active; if (!a) return;
    const exo = a.exos[ei]; const best = bestWithActive(exo, si);
    const sets = exo.sets.map((s, i) => { if (i !== si) return s; const n = { ...s, ...patch }; if (n.done) n.pr = n.reps > 0 && n.kg > 0 && !!best && e1rm(n.kg, n.reps) > e1rm(best.kg, best.reps); return n; });
    state = { ...state, active: { ...a, exos: a.exos.map((e, i) => (i === ei ? { ...e, sets } : e)) } }; emit();
  },
  removeSet(ei: number, si: number) { const a = state.active; if (!a) return; state = { ...state, active: { ...a, exos: a.exos.map((e, i) => (i === ei ? { ...e, sets: e.sets.filter((_, j) => j !== si) } : e)) } }; emit(); },
  setRest(ei: number, rest: number) { const a = state.active; if (!a) return; state = { ...state, active: { ...a, exos: a.exos.map((e, i) => (i === ei ? { ...e, rest: Math.max(0, rest) } : e)) } }; if (state.restUntil) state = { ...state, restUntil: Date.now() + Math.max(0, rest) * 1000, restTotal: rest }; emit(); },
  setSuperset(ei: number, on: boolean) { const a = state.active; if (!a) return; state = { ...state, active: { ...a, exos: a.exos.map((e, i) => (i === ei ? { ...e, superset: on } : e)) } }; emit(); },
  removeExo(ei: number) { const a = state.active; if (!a || a.exos.length <= 1) return; state = { ...state, active: { ...a, exos: a.exos.filter((_, i) => i !== ei) } }; emit(); },
  addSet(ei: number) {
    const a = state.active; if (!a) return;
    const exo = a.exos[ei]; const last = exo.sets[exo.sets.length - 1] ?? { kg: 20, reps: 10 };
    state = { ...state, active: { ...a, exos: a.exos.map((e, i) => (i === ei ? { ...e, sets: [...e.sets, { kg: last.kg, reps: last.reps, done: false }] } : e)) } };
    emit();
  },
  skipRest() { state = { ...state, restUntil: null }; emit(); },
  clearPR() { state = { ...state, lastPR: null }; emit(); },
  finish(): Session | null {
    const a = state.active; if (!a) return null;
    const done = { ...a, endedAt: Date.now() };
    state = { ...state, active: null, history: [done, ...state.history], restUntil: null };
    emit(); return done;
  },
  discard() { state = { ...state, active: null, restUntil: null }; emit(); },
};
export const exoName = (id: string) => byId(id)?.name ?? id;

/** Historique d'un exercice : une entrée par séance où il a été fait */
export function exoHistory(exoId: string) {
  return state.history.map((s) => ({ session: s, sets: s.exos.filter((e) => e.exoId === exoId).flatMap((e) => e.sets.filter((x) => x.done)) })).filter((h) => h.sets.length);
}
/** Records par exercice (meilleur 1RM estimé), historique + données de départ */
export function allRecords() {
  const ids = new Set<string>([...Object.keys(PREVIOUS_BEST), ...state.history.flatMap((s) => s.exos.map((e) => e.exoId))]);
  return [...ids].map((id) => ({ exoId: id, best: bestFor(id)!, date: state.history.find((s) => s.exos.some((e) => e.exoId === id && e.sets.some((x) => x.pr)))?.startedAt })).filter((r) => r.best);
}
/** Démarre une séance vide ou à partir d'une liste d'exercices (assistant, "ajouter à la séance") */
export function startFromExos(name: string, exos: { exo: Exercise; sets?: number; reps?: number; kg?: number; rest?: number }[]) {
  const t: Template = { id: "custom-" + Date.now(), name, program: "Séance libre", photo: exos[0]?.exo.photo ?? "photo-gym", level: "Moyen", minutes: exos.length * 10, discipline: "bodybuilding",
    exos: exos.map((x) => ({ exoId: x.exo.id, rest: x.rest ?? 90, sets: Array.from({ length: x.sets ?? 3 }, () => ({ kg: x.kg ?? (bestFor(x.exo.id)?.kg ?? 20), reps: x.reps ?? 10 })) })) };
  actions.start(t); return t;
}
export function addExoToActive(exo: Exercise) {
  const a = state.active; if (!a) return false;
  const b = bestFor(exo.id);
  state = { ...state, active: { ...a, exos: [...a.exos, { exoId: exo.id, rest: 90, sets: Array.from({ length: 3 }, () => ({ kg: b?.kg ?? 20, reps: b?.reps ?? 10, done: false })) }] } };
  emit(); return true;
}
