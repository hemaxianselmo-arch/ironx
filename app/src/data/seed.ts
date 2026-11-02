export { EXERCISES, EXO_BY_ID } from "./exercises";
export type { Exercise } from "./exercises";
export { TEMPLATES, TEMPLATE_BY_ID } from "./templates";
export type { Template, TemplateExo, TemplateSet, SetKind } from "./templates";
export { SET_KINDS, KIND_LABEL } from "./templates";
import { EXO_BY_ID } from "./exercises";
import { TEMPLATE_BY_ID } from "./templates";
export const byId = (id: string) => EXO_BY_ID[id] ?? customExo(id)!;
export const PUSH = TEMPLATE_BY_ID["push"];
/** Meilleures séries connues au départ (démo) : exoId → séries */
export const PREVIOUS_BEST: Record<string, { kg: number; reps: number }[]> = {
  bench: [{ kg: 105, reps: 5 }, { kg: 110, reps: 2 }, { kg: 100, reps: 8 }], dips: [{ kg: 20, reps: 8 }], squat: [{ kg: 140, reps: 1 }], deadlift: [{ kg: 180, reps: 2 }], ohp: [{ kg: 65, reps: 3 }], pullup: [{ kg: 0, reps: 14 }],
};
/** 1RM estimé (Epley) */
export const e1rm = (kg: number, reps: number) => (reps <= 1 ? kg : Math.round(kg * (1 + reps / 30) * 2) / 2);
import { customExo } from "../store/library";
