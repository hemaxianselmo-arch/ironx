// Journal nutrition : repas du jour, eau, aliments perso, favoris, repas composés, courses, planning — persisté
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Food, FOOD_BY_ID, FOODS, Recipe, RECIPE_BY_ID, nut, recipeNut } from "../data/foods";

export type MealKey = "petitdej" | "dejeuner" | "diner" | "collation";
export const MEALS: { key: MealKey; label: string; short: string; photo: string }[] = [
  { key: "petitdej", label: "Petit-déjeuner", short: "Petit-déj.", photo: "photo-meal-oats" }, { key: "dejeuner", label: "Déjeuner", short: "Déjeuner", photo: "photo-meal-chicken" },
  { key: "collation", label: "Collation", short: "Collation", photo: "photo-shaker" }, { key: "diner", label: "Dîner", short: "Dîner", photo: "photo-meal-salmon" }];
export type Entry = { id: string; foodId?: string; recipeId?: string; grams: number; servings?: number; at: number };
export type Day = { meals: Record<MealKey, Entry[]>; water: number };
export type SavedMeal = { id: string; name: string; entries: { foodId: string; grams: number }[]; photo: string };
export type ShopItem = { id: string; name: string; qty: string; cat: string; done: boolean };
type State = { days: Record<string, Day>; foods: Food[]; favorites: string[]; recents: string[]; savedMeals: SavedMeal[]; shopping: ShopItem[]; planner: Record<string, Partial<Record<MealKey, { recipeId?: string; mealId?: string }>>>; kcalAdjust: number; waterGoal: number };
let state: State = { days: {}, foods: [], favorites: [], recents: [], savedMeals: [], shopping: [], planner: {}, kcalAdjust: 0, waterGoal: 2.5 };
const subs = new Set<() => void>(); const KEY = "ironx.nutrition.v1";
const emit = () => { subs.forEach((f) => f()); AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); };
export async function loadNutrition() { try { const raw = await AsyncStorage.getItem(KEY); if (raw) { state = { ...state, ...JSON.parse(raw) }; subs.forEach((f) => f()); } } catch {} }
export const useNutrition = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const emptyDay = (): Day => ({ meals: { petitdej: [], dejeuner: [], collation: [], diner: [] }, water: 0 });
export const getDay = (k = dayKey()) => state.days[k] ?? emptyDay();
export const foodOf = (id: string): Food | undefined => FOOD_BY_ID[id] ?? state.foods.find((f) => f.id === id);
export const allFoods = () => [...state.foods, ...FOODS];
export const foodsMap = () => ({ ...FOOD_BY_ID, ...Object.fromEntries(state.foods.map((f) => [f.id, f])) });

export function entryNut(e: Entry) {
  if (e.recipeId) { const r = RECIPE_BY_ID[e.recipeId]; return r ? recipeNut(r, e.servings ?? 1, foodsMap()) : { kcal: 0, p: 0, g: 0, l: 0 }; }
  const f = foodOf(e.foodId!); return f ? nut(f, e.grams) : { kcal: 0, p: 0, g: 0, l: 0 };
}
export const entryName = (e: Entry) => e.recipeId ? RECIPE_BY_ID[e.recipeId]?.name ?? "Recette" : foodOf(e.foodId!)?.name ?? "Aliment";
export const entryQty = (e: Entry) => e.recipeId ? `${e.servings ?? 1} portion${(e.servings ?? 1) > 1 ? "s" : ""}` : `${e.grams} g`;
export function mealTotals(entries: Entry[]) { const t = { kcal: 0, p: 0, g: 0, l: 0 }; for (const e of entries) { const n = entryNut(e); t.kcal += n.kcal; t.p += n.p; t.g += n.g; t.l += n.l; } return { kcal: Math.round(t.kcal), p: Math.round(t.p), g: Math.round(t.g), l: Math.round(t.l) }; }
export function dayTotals(k = dayKey()) { const d = getDay(k); return mealTotals(Object.values(d.meals).flat()); }

const upd = (k: string, f: (d: Day) => Day) => { state = { ...state, days: { ...state.days, [k]: f(getDay(k)) } }; emit(); };
export const nutri = {
  add(meal: MealKey, e: Omit<Entry, "id" | "at">, k = dayKey()) {
    upd(k, (d) => ({ ...d, meals: { ...d.meals, [meal]: [...d.meals[meal], { ...e, id: String(Date.now() + Math.random()), at: Date.now() }] } }));
    if (e.foodId) state = { ...state, recents: [e.foodId, ...state.recents.filter((x) => x !== e.foodId)].slice(0, 20) };
    emit();
  },
  remove(meal: MealKey, id: string, k = dayKey()) { upd(k, (d) => ({ ...d, meals: { ...d.meals, [meal]: d.meals[meal].filter((e) => e.id !== id) } })); },
  setGrams(meal: MealKey, id: string, grams: number, k = dayKey()) { upd(k, (d) => ({ ...d, meals: { ...d.meals, [meal]: d.meals[meal].map((e) => (e.id === id ? { ...e, grams } : e)) } })); },
  water(delta: number, k = dayKey()) { upd(k, (d) => ({ ...d, water: Math.max(0, Math.round((d.water + delta) * 100) / 100) })); },
  addFood(f: Food) { state = { ...state, foods: [{ ...f, custom: true }, ...state.foods.filter((x) => x.id !== f.id)] }; emit(); },
  toggleFav(id: string) { state = { ...state, favorites: state.favorites.includes(id) ? state.favorites.filter((x) => x !== id) : [id, ...state.favorites] }; emit(); },
  saveMeal(m: SavedMeal) { state = { ...state, savedMeals: [m, ...state.savedMeals.filter((x) => x.id !== m.id)] }; emit(); },
  deleteMeal(id: string) { state = { ...state, savedMeals: state.savedMeals.filter((x) => x.id !== id) }; emit(); },
  addSavedMeal(m: SavedMeal, meal: MealKey, k = dayKey()) { for (const e of m.entries) nutri.add(meal, { foodId: e.foodId, grams: e.grams }, k); },
  copyDay(from: string, to = dayKey()) { const d = state.days[from]; if (!d) return; state = { ...state, days: { ...state.days, [to]: { ...d, meals: Object.fromEntries(Object.entries(d.meals).map(([m, es]) => [m, es.map((e) => ({ ...e, id: String(Date.now() + Math.random()), at: Date.now() }))])) as any } } }; emit(); },
  shopAdd(items: Omit<ShopItem, "id" | "done">[]) {
    const cur = [...state.shopping];
    for (const it of items) { const ex = cur.find((x) => x.name === it.name && !x.done); if (ex) ex.qty = mergeQty(ex.qty, it.qty); else cur.push({ ...it, id: String(Date.now() + Math.random()), done: false }); }
    state = { ...state, shopping: cur }; emit();
  },
  shopToggle(id: string) { state = { ...state, shopping: state.shopping.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }; emit(); },
  shopClearDone() { state = { ...state, shopping: state.shopping.filter((x) => !x.done) }; emit(); },
  plan(k: string, meal: MealKey, v: { recipeId?: string; mealId?: string } | null) { const day = { ...(state.planner[k] ?? {}) }; if (v) day[meal] = v; else delete day[meal]; state = { ...state, planner: { ...state.planner, [k]: day } }; emit(); },
  setAdjust(v: number) { state = { ...state, kcalAdjust: v }; emit(); },
  setWaterGoal(v: number) { state = { ...state, waterGoal: v }; emit(); },
};
function mergeQty(a: string, b: string) { const pa = parseFloat(a), pb = parseFloat(b); const ua = a.replace(/[\d.,\s]/g, ""), ub = b.replace(/[\d.,\s]/g, ""); return !isNaN(pa) && !isNaN(pb) && ua === ub ? `${Math.round((pa + pb) * 10) / 10} ${ua}`.trim() : `${a} + ${b}`; }
export const fmtG = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")} kg` : `${Math.round(v)} g`);
export const catOf = (f: Food) => ({ "Protéines": "Protéines", "Féculents": "Féculents", "Légumes": "Légumes", "Fruits": "Légumes", "Produits laitiers": "Épicerie", "Matières grasses": "Épicerie", "Épicerie": "Épicerie", "Boissons": "Épicerie", "Compléments": "Épicerie" } as Record<string, string>)[f.cat];
/** Calories brûlées estimées aujourd'hui par les séances (26 kcal / série) */
export function burnedToday(history: { startedAt: number; exos: { sets: { done: boolean }[] }[] }[]) { const k = dayKey(); return history.filter((s) => dayKey(new Date(s.startedAt)) === k).reduce((a, s) => a + s.exos.reduce((b, e) => b + e.sets.filter((x) => x.done).length, 0) * 26, 0); }
export const recipeToShop = (r: Recipe, servings = r.servings) => r.ingredients.map((i) => { const f = foodOf(i.foodId)!; return { name: f.name, qty: fmtG((i.grams / r.servings) * servings), cat: catOf(f) }; });
