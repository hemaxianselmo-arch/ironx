// Séances types intégrées
export type SetKind = "normal" | "warmup" | "top" | "backoff" | "drop" | "restpause" | "amrap";
export const SET_KINDS: [SetKind, string, string][] = [["normal", "Normale", "N"], ["warmup", "Échauffement", "E"], ["top", "Top set", "T"], ["backoff", "Back-off", "B"], ["drop", "Drop set", "D"], ["restpause", "Rest-pause", "RP"], ["amrap", "AMRAP", "A"]];
export const KIND_LABEL = Object.fromEntries(SET_KINDS.map(([k, l]) => [k, l])) as Record<SetKind, string>;
/** Une série programmée : charge, reps visées, RPE visé (optionnel), type */
export type TemplateSet = { kg: number; reps: number; rpe?: number; kind?: SetKind };
/** superset : enchaîné avec l'exercice suivant sans repos (superset / circuit) */
export type TemplateExo = { exoId: string; sets: TemplateSet[]; rest: number; note?: string; superset?: boolean; tempo?: string };
export type Template = { id: string; name: string; program: string; exos: TemplateExo[]; photo: string; level: "Facile" | "Moyen" | "Avancé" | "Dur"; minutes: number; discipline: string; custom?: boolean };

const S = (kg: number, reps: number, n = 3): TemplateSet[] => Array.from({ length: n }, () => ({ kg, reps }));
const X = (exoId: string, sets: TemplateSet[], rest = 90, note?: string): TemplateExo => ({ exoId, sets, rest, note });

export const TEMPLATES: Template[] = [
  { id: "push", name: "Push", program: "PPL · jour 1", photo: "photo-bench", level: "Moyen", minutes: 62, discipline: "bodybuilding", exos: [
    X("bench", [{ kg: 100, reps: 6 }, { kg: 105, reps: 5 }, { kg: 107.5, reps: 5 }, { kg: 107.5, reps: 5 }], 180, "Top set + back-off"),
    X("incline-db", [{ kg: 32, reps: 10 }, { kg: 32, reps: 9 }, { kg: 32, reps: 8 }], 120), X("cable-fly", S(15, 14), 90), X("dips", [{ kg: 22.5, reps: 8 }, { kg: 20, reps: 8 }, { kg: 20, reps: 7 }], 150), X("lateral", S(12, 15), 60), X("pushdown", S(30, 12), 60) ] },
  { id: "pull", name: "Pull", program: "PPL · jour 2", photo: "photo-pullup", level: "Moyen", minutes: 58, discipline: "bodybuilding", exos: [
    X("pullup-weighted", S(20, 6, 4), 150), X("row", S(80, 8, 4), 120), X("lat-pulldown", S(70, 10), 90), X("seated-row", S(60, 12), 90), X("face-pull", S(25, 15), 60), X("curl-bar", S(35, 10), 60), X("hammer", S(16, 12), 60) ] },
  { id: "legs", name: "Legs", program: "PPL · jour 3", photo: "photo-squat", level: "Avancé", minutes: 65, discipline: "bodybuilding", exos: [
    X("squat", [{ kg: 100, reps: 6 }, { kg: 120, reps: 5 }, { kg: 130, reps: 4 }, { kg: 120, reps: 6 }], 180, "Montée progressive"), X("rdl", S(100, 8), 150), X("leg-press", S(180, 12), 120), X("leg-curl", S(45, 12), 90), X("leg-ext", S(50, 15), 60), X("calf-raise", S(80, 15, 4), 60) ] },
  { id: "upper-a", name: "Haut A", program: "Upper / Lower · jour 1", photo: "photo-bench", level: "Moyen", minutes: 60, discipline: "bodybuilding", exos: [
    X("bench", S(100, 6, 4), 180), X("row", S(80, 8, 4), 120), X("ohp", S(50, 8), 120), X("lat-pulldown", S(65, 10), 90), X("lateral", S(12, 15), 60), X("curl-db", S(14, 12), 60), X("pushdown", S(30, 12), 60) ] },
  { id: "lower-a", name: "Bas A", program: "Upper / Lower · jour 2", photo: "photo-squat", level: "Moyen", minutes: 55, discipline: "bodybuilding", exos: [
    X("squat", S(110, 6, 4), 180), X("rdl", S(90, 8), 150), X("bulgarian", S(20, 10), 90), X("leg-curl", S(40, 12), 90), X("calf-raise", S(70, 15, 4), 60), X("plank", S(0, 60), 60) ] },
  { id: "upper-b", name: "Haut B", program: "Upper / Lower · jour 3", photo: "photo-pullup", level: "Moyen", minutes: 60, discipline: "bodybuilding", exos: [
    X("incline-bar", S(80, 8, 4), 150), X("pullup", S(0, 8, 4), 120), X("db-ohp", S(24, 10), 90), X("seated-row", S(60, 12), 90), X("cable-fly", S(15, 14), 60), X("hammer", S(16, 12), 60), X("skull", S(30, 12), 60) ] },
  { id: "lower-b", name: "Bas B", program: "Upper / Lower · jour 4", photo: "photo-deadlift", level: "Avancé", minutes: 55, discipline: "bodybuilding", exos: [
    X("deadlift", [{ kg: 140, reps: 5 }, { kg: 160, reps: 3 }, { kg: 170, reps: 3 }], 210), X("front-squat", S(80, 6), 150), X("hip-thrust", S(120, 10), 90), X("lunge", S(16, 12), 90), X("leg-ext", S(50, 15), 60), X("hanging-leg", S(0, 12), 60) ] },
  { id: "full-a", name: "Full body A", program: "Full body · 3 × / sem.", photo: "photo-w-squat", level: "Facile", minutes: 45, discipline: "bodybuilding", exos: [
    X("goblet", S(24, 12), 90), X("db-press", S(26, 10), 90), X("db-row", S(28, 10), 90), X("db-ohp", S(18, 10), 90), X("rdl", S(60, 10), 90), X("plank", S(0, 45), 60) ] },
  { id: "full-b", name: "Full body B", program: "Full body · 3 × / sem.", photo: "photo-kettlebell", level: "Facile", minutes: 45, discipline: "bodybuilding", exos: [
    X("squat", S(70, 8), 120), X("pushup", S(0, 15), 60), X("lat-pulldown", S(55, 12), 90), X("lunge", S(12, 12), 90), X("lateral", S(8, 15), 60), X("ab-wheel", S(0, 10), 60) ] },
  { id: "push-heavy", name: "Push lourd", program: "Force", photo: "photo-bench", level: "Avancé", minutes: 60, discipline: "powerlifting", exos: [
    X("bench", [{ kg: 90, reps: 5 }, { kg: 100, reps: 3 }, { kg: 110, reps: 2 }, { kg: 115, reps: 1 }, { kg: 100, reps: 5 }], 240, "Montée vers un single"), X("close-grip", S(80, 5, 4), 150), X("ohp", S(55, 5, 4), 150), X("dips", S(15, 8), 120), X("skull", S(35, 10), 90) ] },
  { id: "squat-day", name: "Squat 5/3/1", program: "Force 5/3/1", photo: "photo-squat", level: "Avancé", minutes: 55, discipline: "powerlifting", exos: [
    X("squat", [{ kg: 105, reps: 5 }, { kg: 120, reps: 3 }, { kg: 135, reps: 1 }], 240, "5/3/1 · semaine 3"), X("squat", S(95, 5, 5), 150, "Back-off 5 × 5"), X("rdl", S(100, 8), 120), X("hanging-leg", S(0, 12), 60) ] },
  { id: "hyrox-sim", name: "Hyrox simulation", program: "8 stations + course", photo: "photo-w-rower", level: "Dur", minutes: 75, discipline: "hyrox", exos: [
    X("run", [{ kg: 0, reps: 1000 }], 0), X("skierg", [{ kg: 0, reps: 1000 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("sled-push", [{ kg: 152, reps: 50 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("sled-pull", [{ kg: 103, reps: 50 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("burpee-bj", [{ kg: 0, reps: 80 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("rower", [{ kg: 0, reps: 1000 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("farmers", [{ kg: 48, reps: 200 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("sandbag-lunge", [{ kg: 20, reps: 100 }], 0), X("run", [{ kg: 0, reps: 1000 }], 0), X("wallball", [{ kg: 6, reps: 100 }], 0) ] },
  { id: "street", name: "Street · figures", program: "Street workout", photo: "photo-chalk", level: "Dur", minutes: 50, discipline: "street", exos: [
    X("front-lever", [{ kg: 0, reps: 10 }, { kg: 0, reps: 10 }, { kg: 0, reps: 8 }], 120, "Tenues en secondes"), X("muscle-up", S(0, 3, 5), 180), X("pullup-weighted", S(25, 6, 4), 150), X("dips", S(20, 8), 120), X("hanging-leg", S(0, 12), 60) ] },
  { id: "run-intervals", name: "Fractionné 8 × 400 m", program: "Course", photo: "photo-run", level: "Moyen", minutes: 40, discipline: "course", exos: [
    X("run", [{ kg: 0, reps: 1500 }], 0, "Échauffement"), X("run", Array.from({ length: 8 }, () => ({ kg: 0, reps: 400 })), 90, "Récup 1:30"), X("run", [{ kg: 0, reps: 1000 }], 0, "Retour au calme") ] },
];
export const TEMPLATE_BY_ID: Record<string, Template> = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
/** Programme (famille) → identifiants de séances pour chaque jour nommé */
export const DAY_TO_TEMPLATE: Record<string, string> = { Push: "push", Pull: "pull", Legs: "legs", "Haut A": "upper-a", "Bas A": "lower-a", "Haut B": "upper-b", "Bas B": "lower-b", Haut: "upper-a", Bas: "lower-a", "Full A": "full-a", "Full B": "full-b", "Full C": "full-a", Squat: "squat-day", Couché: "push-heavy", Soulevé: "lower-b", Hyrox: "hyrox-sim" };
