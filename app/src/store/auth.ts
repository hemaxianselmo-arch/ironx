// Comptes : création, connexion, déconnexion — stockés sur le téléphone en attendant le serveur.
// Chaque compte garde son profil (onboarding, mesures, objectif) : on retrouve tout en se reconnectant.
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Profile, DEFAULT, getProfile, resetProfile, setOnProfileChange } from "./profile";

type Account = { email: string; hash: string; profile: Profile; createdAt: number; lastLogin: number };
type State = { accounts: Record<string, Account>; session: string | null; lastEmail: string | null; ready: boolean };
let state: State = { accounts: {}, session: null, lastEmail: null, ready: false };
const subs = new Set<() => void>(); const KEY = "ironx.auth.v1";
const save = () => AsyncStorage.setItem(KEY, JSON.stringify({ accounts: state.accounts, session: state.session, lastEmail: state.lastEmail })).catch(() => {});
const emit = () => { subs.forEach((f) => f()); save(); };
const norm = (e: string) => e.trim().toLowerCase();
// Empreinte locale du mot de passe (pas de stockage en clair) ; le serveur fera mieux plus tard
export function hash(pw: string) { let h = 5381; for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) | 0; let g = 0x811c9dc5; for (let i = 0; i < pw.length; i++) { g ^= pw.charCodeAt(i); g = Math.imul(g, 0x01000193); } return (h >>> 0).toString(16) + (g >>> 0).toString(16); }
export const EMAIL_OK = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(norm(e));

export async function loadAuth() {
  try { const raw = await AsyncStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); state = { ...state, accounts: d.accounts ?? {}, session: d.session ?? null, lastEmail: d.lastEmail ?? null }; } } catch {}
  state = { ...state, ready: true }; subs.forEach((f) => f());
  // le profil de la session suit chaque modification
  setOnProfileChange((p) => { if (state.session && state.accounts[state.session]) { state.accounts[state.session].profile = p; save(); } });
}
export const useAuth = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
export const auth = {
  /** Crée le compte et ouvre la session. Retourne un message d'erreur ou null. */
  register(email: string, pw: string): string | null {
    const e = norm(email);
    if (!EMAIL_OK(e)) return "Adresse e-mail invalide.";
    if (pw.length < 6) return "Mot de passe trop court (6 caractères minimum).";
    if (state.accounts[e]) return "Un compte existe déjà avec cet e-mail. Connecte-toi.";
    const profile: Profile = { ...DEFAULT, ...getProfile(), onboarded: false };
    state = { ...state, accounts: { ...state.accounts, [e]: { email: e, hash: hash(pw), profile, createdAt: Date.now(), lastLogin: Date.now() } }, session: e, lastEmail: e };
    resetProfile(profile); emit(); return null;
  },
  login(email: string, pw: string): string | null {
    const e = norm(email); const a = state.accounts[e];
    if (!a) return "Aucun compte avec cet e-mail.";
    if (a.hash !== hash(pw)) return "Mot de passe incorrect.";
    a.lastLogin = Date.now(); state = { ...state, session: e, lastEmail: e };
    resetProfile(a.profile); emit(); return null;
  },
  logout() { const e = state.session; if (e && state.accounts[e]) state.accounts[e].profile = getProfile(); state = { ...state, session: null }; resetProfile(); emit(); },
  deleteAccount() { const e = state.session; if (!e) return; const acc = { ...state.accounts }; delete acc[e]; state = { ...state, accounts: acc, session: null, lastEmail: null }; resetProfile(); emit(); },
  changePassword(old: string, pw: string): string | null { const e = state.session; const a = e ? state.accounts[e] : null; if (!a) return "Pas de session."; if (a.hash !== hash(old)) return "Ancien mot de passe incorrect."; if (pw.length < 6) return "Mot de passe trop court (6 caractères minimum)."; a.hash = hash(pw); emit(); return null; },
};
export const sessionEmail = () => state.session;
