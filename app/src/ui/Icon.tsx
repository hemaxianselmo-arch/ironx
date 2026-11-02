import React from "react";
import { SvgXml } from "react-native-svg";
import { C } from "../theme/tokens";

// Icônes trait fin — mêmes tracés que les maquettes (kit.py ICONS)
const ICONS: Record<string, string> = {
  Accueil: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
  Fil: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M10 9l5 3-5 3z"/>',
  Séance: '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
  Nutrition: '<circle cx="12" cy="12" r="8"/><path d="M12 4v8l5 5"/>',
  Salle: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M15 20a4.5 4.5 0 0 1 6-4"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  trophy: '<path d="M6 4h12v4a6 6 0 0 1-12 0z"/><path d="M12 14v4M8 21h8"/><path d="M6 6H3a3 3 0 0 0 3 4M18 6h3a3 3 0 0 1-3 4"/>',
  share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M7 8l5-5 5 5"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  run: '<circle cx="14" cy="5" r="2"/><path d="M8 21l3-7 3 2 2 5M11 14l-3-3 4-4 3 3 3-1"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  stats: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
};
export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 22, color = C.txt, w = 1.8 }: { name: IconName; size?: number; color?: string; w?: number }) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}
