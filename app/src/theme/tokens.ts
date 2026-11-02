// Jetons de design IRONX — valeurs reprises à l'identique des maquettes (kit3.py)
export const C = {
  bg: "#0C0E1A",
  txt: "#F4F5F7",
  mut: "#8E93A8",
  soft: "#C9CDD4",
  surf: "#161929",
  surf2: "#1E2235",
  line: "rgba(255,255,255,0.06)",
  line2: "rgba(255,255,255,0.08)",
  accent: "#EB1B3F",
  accentRgb: "235,27,63",
  onAccent: "#FFFFFF",
  green: "#3DDC84",
  blue: "#4DB8FF",
  orange: "#FFB84D",
  red: "#FF6B6B",
  white: "#FFFFFF",
} as const;

export const rgba = (rgb: string, a: number) => `rgba(${rgb},${a})`;
export const accentA = (a: number) => rgba(C.accentRgb, a);

// Familles de polices (chargées dans fonts.ts)
export const F = {
  man500: "Manrope_500Medium",
  man600: "Manrope_600SemiBold",
  man700: "Manrope_700Bold",
  man800: "Manrope_800ExtraBold",
  inter400: "Inter_400Regular",
  inter500: "Inter_500Medium",
  inter600: "Inter_600SemiBold",
  inter700: "Inter_700Bold",
} as const;

/** Police Inter selon le poids CSS utilisé dans les maquettes */
export const inter = (w: 400 | 500 | 600 | 700 = 400) =>
  ({ 400: F.inter400, 500: F.inter500, 600: F.inter600, 700: F.inter700 })[w];
export const man = (w: 500 | 600 | 700 | 800 = 700) =>
  ({ 500: F.man500, 600: F.man600, 700: F.man700, 800: F.man800 })[w];

export const SCREEN_W = 390;
export const PAD = 16;
export const NAV_H = 84;
