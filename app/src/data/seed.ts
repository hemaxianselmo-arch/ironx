import { Highlight } from "../ui/Figure";

export type Exercise = { id: string; name: string; muscle: string; equip: string; view: "front" | "back"; hl: Highlight; photo: string };
export const EXERCISES: Exercise[] = [
  { id: "bench", name: "Développé couché", muscle: "Pectoraux", equip: "barre", view: "front", hl: { pecs: 1, delts: 0.5 }, photo: "photo-bench" },
  { id: "incline-db", name: "Incliné haltères", muscle: "Pectoraux", equip: "haltères", view: "front", hl: { pecs: 0.8, delts: 0.4 }, photo: "photo-bench" },
  { id: "cable-fly", name: "Écarté poulie", muscle: "Pectoraux", equip: "poulie", view: "front", hl: { pecs: 0.8 }, photo: "photo-gym" },
  { id: "dips", name: "Dips lestés", muscle: "Triceps", equip: "poids de corps", view: "back", hl: { triceps: 1 }, photo: "photo-pullup" },
  { id: "lateral", name: "Élévations latérales", muscle: "Épaules", equip: "haltères", view: "front", hl: { delts: 1 }, photo: "photo-gym" },
  { id: "pushdown", name: "Extension triceps poulie", muscle: "Triceps", equip: "poulie", view: "back", hl: { triceps: 1 }, photo: "photo-gym" },
  { id: "squat", name: "Squat", muscle: "Quadriceps", equip: "barre", view: "front", hl: { quads: 1 }, photo: "photo-squat" },
  { id: "deadlift", name: "Soulevé de terre", muscle: "Dos", equip: "barre", view: "back", hl: { lats: 0.6, lower_back: 1, hamstrings: 0.7, glutes: 0.8 }, photo: "photo-deadlift" },
  { id: "pullup", name: "Tractions", muscle: "Dorsaux", equip: "poids de corps", view: "back", hl: { lats: 1 }, photo: "photo-pullup" },
  { id: "row", name: "Rowing barre", muscle: "Dorsaux", equip: "barre", view: "back", hl: { lats: 1, traps: 0.5 }, photo: "photo-deadlift" },
];
export const byId = (id: string) => EXERCISES.find((e) => e.id === id)!;

export type TemplateSet = { kg: number; reps: number };
export type TemplateExo = { exoId: string; sets: TemplateSet[]; rest: number; note?: string };
export type Template = { id: string; name: string; program: string; exos: TemplateExo[]; photo: string };

export const PUSH: Template = {
  id: "push", name: "Push", program: "PPL jour 1 / 6", photo: "photo-squat",
  exos: [
    { exoId: "bench", sets: [{ kg: 100, reps: 6 }, { kg: 105, reps: 5 }, { kg: 107.5, reps: 5 }, { kg: 107.5, reps: 5 }], rest: 180, note: "Top set + back-off" },
    { exoId: "incline-db", sets: [{ kg: 32, reps: 10 }, { kg: 32, reps: 9 }, { kg: 32, reps: 8 }], rest: 120 },
    { exoId: "cable-fly", sets: [{ kg: 15, reps: 15 }, { kg: 15, reps: 14 }, { kg: 15, reps: 12 }], rest: 90 },
    { exoId: "dips", sets: [{ kg: 22.5, reps: 8 }, { kg: 20, reps: 8 }, { kg: 20, reps: 7 }], rest: 150 },
    { exoId: "lateral", sets: [{ kg: 12, reps: 15 }, { kg: 12, reps: 15 }, { kg: 12, reps: 14 }], rest: 60 },
    { exoId: "pushdown", sets: [{ kg: 30, reps: 12 }, { kg: 30, reps: 12 }, { kg: 27.5, reps: 12 }], rest: 60 },
  ],
};
/** Meilleures séries connues (pour la détection de record) : exoId → [{kg, reps}] */
export const PREVIOUS_BEST: Record<string, TemplateSet[]> = {
  bench: [{ kg: 105, reps: 5 }, { kg: 110, reps: 2 }, { kg: 100, reps: 8 }],
  dips: [{ kg: 20, reps: 8 }],
  squat: [{ kg: 140, reps: 1 }],
};
/** 1RM estimé (formule d'Epley) */
export const e1rm = (kg: number, reps: number) => (reps <= 1 ? kg : Math.round(kg * (1 + reps / 30) * 2) / 2);
