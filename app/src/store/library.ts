// Bibliothèque personnelle : séances créées/modifiées, exercices personnalisés, favoris — persistés
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Template, TEMPLATES, TEMPLATE_BY_ID } from "../data/templates";
import { Exercise, EXO_BY_ID } from "../data/exercises";

type State = { templates: Template[]; exercises: Exercise[]; favorites: string[]; programId: string | null };
let state: State = { templates: [], exercises: [], favorites: [], programId: null };
const subs = new Set<() => void>();
const KEY = "ironx.library.v1";
const emit = () => { subs.forEach((f) => f()); AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); };
export async function loadLibrary() { try { const raw = await AsyncStorage.getItem(KEY); if (raw) { state = { ...state, ...JSON.parse(raw) }; subs.forEach((f) => f()); } } catch {} }
export const useLibrary = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);

/** Exercice choisi dans la bibliothèque pour l'éditeur (retour arrière) */
export let pendingAdd: string | null = null;
export const setPendingAdd = (id: string | null) => { pendingAdd = id; };
export const customExo = (id: string) => state.exercises.find((e) => e.id === id);
export const allExercises = () => [...Object.values(EXO_BY_ID), ...state.exercises];
export const allTemplates = () => { const own = state.templates; const ownIds = new Set(own.map((t) => t.id)); return [...own, ...TEMPLATES.filter((t) => !ownIds.has(t.id))]; };
export const getTemplate = (id: string) => state.templates.find((t) => t.id === id) ?? TEMPLATE_BY_ID[id];

export const lib = {
  saveTemplate(t: Template) { state = { ...state, templates: [{ ...t, custom: true }, ...state.templates.filter((x) => x.id !== t.id)] }; emit(); },
  deleteTemplate(id: string) { state = { ...state, templates: state.templates.filter((x) => x.id !== id) }; emit(); },
  addExercise(e: Exercise) { state = { ...state, exercises: [{ ...e, custom: true }, ...state.exercises] }; emit(); },
  toggleFav(id: string) { state = { ...state, favorites: state.favorites.includes(id) ? state.favorites.filter((x) => x !== id) : [...state.favorites, id] }; emit(); },
};
