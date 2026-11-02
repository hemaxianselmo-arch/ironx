// Bibliothèque d'exercices intégrée (sans base externe) : muscles ciblés sur la figure + consignes texte
import { Highlight } from "../ui/Figure";

export type Equip = "Barre" | "Haltères" | "Poulie" | "Machine" | "Poids du corps" | "Kettlebell" | "Cardio";
export type Group = "Pectoraux" | "Dos" | "Jambes" | "Épaules" | "Bras" | "Abdos" | "Cardio";
export type Exercise = {
  id: string; name: string; group: Group; primary: string; secondary: string; equip: Equip;
  view: "front" | "back"; hl: Highlight; hlBack?: Highlight; steps: string[]; variants?: string[]; photo: string; custom?: boolean;
};

const E = (id: string, name: string, group: Group, equip: Equip, primary: string, secondary: string, view: "front" | "back", hl: Highlight, steps: string[], photo = "photo-gym", hlBack?: Highlight, variants?: string[]): Exercise =>
  ({ id, name, group, equip, primary, secondary, view, hl, hlBack, steps, photo, variants });

export const EXERCISES: Exercise[] = [
  // Pectoraux
  E("bench", "Développé couché", "Pectoraux", "Barre", "Pectoraux", "Deltoïdes antérieurs, triceps", "front", { pecs: 1, delts: 0.6 }, ["Omoplates serrées, pieds ancrés, légère cambrure.", "Descends la barre sous les pectoraux, coudes à 45°.", "Pousse en gardant les fessiers au banc."], "photo-bench", { triceps: 0.5 }, ["incline-bar", "decline", "close-grip", "db-press", "floor-press"]),
  E("incline-bar", "Développé incliné barre", "Pectoraux", "Barre", "Haut des pectoraux", "Deltoïdes antérieurs, triceps", "front", { pecs: 0.9, delts: 0.7 }, ["Banc à 30°, omoplates serrées.", "Barre vers le haut des pectoraux.", "Coudes sous la barre à la poussée."], "photo-bench", { triceps: 0.4 }),
  E("incline-db", "Développé incliné haltères", "Pectoraux", "Haltères", "Haut des pectoraux", "Deltoïdes antérieurs", "front", { pecs: 0.9, delts: 0.6 }, ["Banc à 30°, haltères au niveau des épaules.", "Pousse en rapprochant légèrement les haltères.", "Descends jusqu'à l'étirement, sans rebond."], "photo-bench", { triceps: 0.3 }),
  E("db-press", "Développé haltères", "Pectoraux", "Haltères", "Pectoraux", "Triceps, deltoïdes", "front", { pecs: 1, delts: 0.5 }, ["Haltères au-dessus des épaules.", "Amplitude complète, coudes à 45°.", "Contrôle la descente."], "photo-bench", { triceps: 0.4 }),
  E("decline", "Développé décliné", "Pectoraux", "Barre", "Bas des pectoraux", "Triceps", "front", { pecs: 0.9 }, ["Banc décliné, pieds bloqués.", "Barre vers le bas des pectoraux.", "Trajectoire courte, poussée franche."], "photo-bench", { triceps: 0.5 }),
  E("close-grip", "Développé prise serrée", "Bras", "Barre", "Triceps", "Pectoraux", "back", { pecs: 0.6 }, ["Mains largeur d'épaules.", "Coudes le long du corps.", "Verrouille sans claquer."], "photo-bench", { triceps: 1 }),
  E("floor-press", "Floor press", "Pectoraux", "Barre", "Pectoraux", "Triceps", "front", { pecs: 0.8 }, ["Allongé au sol, coudes touchent le sol.", "Pause d'une seconde en bas.", "Pousse explosif."], "photo-bench", { triceps: 0.7 }),
  E("cable-fly", "Écarté poulie vis-à-vis", "Pectoraux", "Poulie", "Pectoraux", "Deltoïdes antérieurs", "front", { pecs: 0.9 }, ["Légère flexion des coudes, fixe.", "Ramène les mains devant le sternum.", "Contracte 1 s, reviens lentement."], "photo-gym"),
  E("db-fly", "Écarté haltères", "Pectoraux", "Haltères", "Pectoraux", "", "front", { pecs: 0.9 }, ["Coudes légèrement fléchis.", "Descends jusqu'à l'étirement.", "Remonte en arc de cercle."], "photo-bench"),
  E("pec-deck", "Pec deck", "Pectoraux", "Machine", "Pectoraux", "", "front", { pecs: 0.9 }, ["Dos collé au dossier.", "Ferme les bras sans à-coups.", "Garde la tension en ouvrant."], "photo-gym"),
  E("dips", "Dips lestés", "Bras", "Poids du corps", "Triceps", "Pectoraux, deltoïdes antérieurs", "back", { pecs: 0.6, delts: 0.3 }, ["Buste légèrement penché pour les pecs, droit pour les triceps.", "Descends coudes à 90°.", "Pousse sans balancer."], "photo-pullup", { triceps: 1 }),
  E("pushup", "Pompes", "Pectoraux", "Poids du corps", "Pectoraux", "Triceps, abdos", "front", { pecs: 0.9, abs: 0.3 }, ["Corps gainé, mains sous les épaules.", "Poitrine proche du sol.", "Coudes à 45°."], "photo-burpees", { triceps: 0.5 }),
  E("pushup-decline", "Pompes déclinées", "Pectoraux", "Poids du corps", "Haut des pectoraux", "Triceps", "front", { pecs: 0.9, delts: 0.5 }, ["Pieds surélevés.", "Mains légèrement devant les épaules.", "Descends contrôlé."], "photo-burpees", { triceps: 0.5 }),
  // Dos
  E("deadlift", "Soulevé de terre", "Dos", "Barre", "Chaîne postérieure", "Dorsaux, trapèzes, fessiers, ischios", "back", { lower_back: 1, glutes: 0.8, hamstrings: 0.7, lats: 0.6, traps: 0.5 }, ["Barre contre les tibias, dos plat.", "Pousse le sol, hanches et épaules montent ensemble.", "Verrouille en serrant les fessiers."], "photo-deadlift", { quads: 0.4, forearms: 0.5 }),
  E("rdl", "Soulevé de terre roumain", "Jambes", "Barre", "Ischios", "Fessiers, lombaires", "back", { hamstrings: 1, glutes: 0.7, lower_back: 0.5 }, ["Genoux légèrement fléchis, fixes.", "Recule les hanches, barre le long des cuisses.", "Remonte en contractant les fessiers."], "photo-deadlift"),
  E("pullup", "Tractions", "Dos", "Poids du corps", "Dorsaux", "Biceps, avant-bras", "back", { lats: 1, biceps: 0.5 }, ["Prise pronation, bras tendus.", "Tire les coudes vers les hanches.", "Menton au-dessus de la barre, descends contrôlé."], "photo-pullup", { biceps: 0.5, forearms: 0.4 }),
  E("pullup-weighted", "Tractions lestées", "Dos", "Poids du corps", "Dorsaux", "Biceps", "back", { lats: 1 }, ["Ceinture de lest, départ bras tendus.", "Tire sans balancer.", "Descends en 2 s."], "photo-pullup", { biceps: 0.5 }),
  E("chinup", "Tractions supination", "Dos", "Poids du corps", "Dorsaux", "Biceps", "back", { lats: 0.9 }, ["Paumes vers toi.", "Coudes devant, poitrine vers la barre.", "Amplitude complète."], "photo-pullup", { biceps: 0.8 }),
  E("row", "Rowing barre", "Dos", "Barre", "Dorsaux", "Trapèzes, biceps", "back", { lats: 1, traps: 0.5 }, ["Buste à 45°, dos plat.", "Tire la barre vers le nombril.", "Serre les omoplates en haut."], "photo-deadlift", { biceps: 0.4 }),
  E("db-row", "Rowing haltère un bras", "Dos", "Haltères", "Dorsaux", "Biceps", "back", { lats: 1 }, ["Main et genou sur le banc.", "Tire le coude vers la hanche.", "Étire en bas sans tourner le buste."], "photo-gym", { biceps: 0.4 }),
  E("lat-pulldown", "Tirage vertical", "Dos", "Poulie", "Dorsaux", "Biceps", "back", { lats: 1 }, ["Prise large, buste légèrement en arrière.", "Tire la barre vers le haut des pectoraux.", "Remonte contrôlé."], "photo-gym", { biceps: 0.4 }),
  E("seated-row", "Tirage horizontal", "Dos", "Poulie", "Dorsaux", "Trapèzes", "back", { lats: 0.9, traps: 0.5 }, ["Dos droit, genoux fléchis.", "Tire vers le nombril, coudes serrés.", "Avance les épaules en revenant."], "photo-gym"),
  E("t-bar", "Rowing T-bar", "Dos", "Machine", "Dorsaux", "Trapèzes", "back", { lats: 1, traps: 0.6 }, ["Poitrine sur le support.", "Tire les coudes vers l'arrière.", "Contracte en haut."], "photo-gym"),
  E("face-pull", "Face pull", "Épaules", "Poulie", "Deltoïdes postérieurs", "Trapèzes", "back", { rear_delts: 1, traps: 0.5 }, ["Corde à hauteur du visage.", "Tire en écartant les mains, coudes hauts.", "Rotation externe en fin de mouvement."], "photo-gym"),
  E("shrug", "Shrugs", "Dos", "Haltères", "Trapèzes", "", "back", { traps: 1 }, ["Bras tendus, haltères le long du corps.", "Monte les épaules vers les oreilles.", "Tiens 1 s en haut."], "photo-gym"),
  E("hyperext", "Extensions lombaires", "Dos", "Poids du corps", "Lombaires", "Fessiers, ischios", "back", { lower_back: 1, glutes: 0.5, hamstrings: 0.4 }, ["Hanches sur le coussin.", "Descends dos plat.", "Remonte jusqu'à l'alignement, pas plus."], "photo-gym"),
  // Jambes
  E("squat", "Squat", "Jambes", "Barre", "Quadriceps", "Fessiers, ischios, lombaires", "front", { quads: 1, adductors: 0.4 }, ["Barre sur les trapèzes, pieds largeur d'épaules.", "Descends hanches sous les genoux, dos gainé.", "Pousse le sol, genoux dans l'axe des pieds."], "photo-squat", { glutes: 0.8, hamstrings: 0.4, lower_back: 0.4 }, ["front-squat", "hack-squat", "leg-press", "goblet"]),
  E("front-squat", "Front squat", "Jambes", "Barre", "Quadriceps", "Fessiers, abdos", "front", { quads: 1, abs: 0.4 }, ["Barre sur les deltoïdes, coudes hauts.", "Buste vertical.", "Descends profond."], "photo-squat", { glutes: 0.6 }),
  E("goblet", "Goblet squat", "Jambes", "Kettlebell", "Quadriceps", "Fessiers", "front", { quads: 1 }, ["Kettlebell contre la poitrine.", "Coudes entre les genoux en bas.", "Pousse les genoux vers l'extérieur."], "photo-kettlebell", { glutes: 0.6 }),
  E("leg-press", "Presse à cuisses", "Jambes", "Machine", "Quadriceps", "Fessiers", "front", { quads: 1 }, ["Pieds au milieu du plateau.", "Descends sans décoller le bassin.", "Ne verrouille pas les genoux."], "photo-gym", { glutes: 0.6 }),
  E("hack-squat", "Hack squat", "Jambes", "Machine", "Quadriceps", "", "front", { quads: 1 }, ["Dos collé au dossier.", "Descends profond.", "Pousse avec le milieu du pied."], "photo-gym"),
  E("lunge", "Fentes marchées", "Jambes", "Haltères", "Quadriceps", "Fessiers", "front", { quads: 0.9 }, ["Grand pas, genou arrière vers le sol.", "Buste droit.", "Pousse sur le talon avant."], "photo-squat", { glutes: 0.8 }),
  E("bulgarian", "Fentes bulgares", "Jambes", "Haltères", "Quadriceps", "Fessiers", "front", { quads: 1 }, ["Pied arrière sur le banc.", "Descends vertical.", "Pousse sur la jambe avant."], "photo-squat", { glutes: 0.8 }),
  E("hip-thrust", "Hip thrust", "Jambes", "Barre", "Fessiers", "Ischios", "back", { glutes: 1, hamstrings: 0.4 }, ["Omoplates sur le banc, barre sur les hanches.", "Monte jusqu'à l'alignement.", "Menton rentré, contracte 1 s."], "photo-squat"),
  E("leg-curl", "Leg curl", "Jambes", "Machine", "Ischios", "", "back", { hamstrings: 1 }, ["Hanches collées.", "Fléchis complètement.", "Reviens lentement."], "photo-gym"),
  E("leg-ext", "Leg extension", "Jambes", "Machine", "Quadriceps", "", "front", { quads: 1 }, ["Dos calé.", "Tends complètement, contracte.", "Descends en 2 s."], "photo-gym"),
  E("calf-raise", "Mollets debout", "Jambes", "Machine", "Mollets", "", "back", { calves: 1 }, ["Pointe des pieds sur la marche.", "Étire en bas 1 s.", "Monte au maximum."], "photo-gym", { calves: 1 }),
  E("adductor", "Adducteurs machine", "Jambes", "Machine", "Adducteurs", "", "front", { adductors: 1 }, ["Amplitude confortable.", "Serre sans à-coups.", "Reviens contrôlé."], "photo-gym"),
  // Épaules
  E("ohp", "Développé militaire", "Épaules", "Barre", "Deltoïdes", "Triceps, trapèzes", "front", { delts: 1 }, ["Barre sur les clavicules, fessiers serrés.", "Pousse en passant la tête à travers.", "Verrouille au-dessus de la tête."], "photo-gym", { triceps: 0.6, traps: 0.4 }),
  E("db-ohp", "Développé épaules haltères", "Épaules", "Haltères", "Deltoïdes", "Triceps", "front", { delts: 1 }, ["Haltères à hauteur des oreilles.", "Pousse sans cambrer.", "Descends contrôlé."], "photo-gym", { triceps: 0.5 }),
  E("lateral", "Élévations latérales", "Épaules", "Haltères", "Deltoïdes moyens", "", "front", { delts: 1 }, ["Coudes légèrement fléchis.", "Monte jusqu'à l'horizontale, petit doigt vers le haut.", "Descends en 2 s."], "photo-gym"),
  E("cable-lateral", "Élévations latérales poulie", "Épaules", "Poulie", "Deltoïdes moyens", "", "front", { delts: 1 }, ["Poulie basse, bras croisé devant.", "Monte à l'horizontale.", "Tension constante."], "photo-gym"),
  E("rear-delt", "Oiseau", "Épaules", "Haltères", "Deltoïdes postérieurs", "Trapèzes", "back", { rear_delts: 1, traps: 0.4 }, ["Buste penché, dos plat.", "Écarte les bras, coudes fixes.", "Serre en haut."], "photo-gym"),
  E("front-raise", "Élévations frontales", "Épaules", "Haltères", "Deltoïdes antérieurs", "", "front", { delts: 0.9 }, ["Bras tendus devant.", "Monte à hauteur des yeux.", "Descends lentement."], "photo-gym"),
  E("arnold", "Arnold press", "Épaules", "Haltères", "Deltoïdes", "Triceps", "front", { delts: 1 }, ["Paumes vers toi en bas.", "Tourne les mains en poussant.", "Inverse à la descente."], "photo-gym", { triceps: 0.4 }),
  // Bras
  E("curl-bar", "Curl barre", "Bras", "Barre", "Biceps", "Avant-bras", "front", { biceps: 1, forearms: 0.4 }, ["Coudes fixes le long du corps.", "Monte sans balancer.", "Descends en 2 s."], "photo-gym"),
  E("curl-db", "Curl haltères alterné", "Bras", "Haltères", "Biceps", "", "front", { biceps: 1 }, ["Supination en montant.", "Coudes immobiles.", "Contracte en haut."], "photo-gym"),
  E("hammer", "Curl marteau", "Bras", "Haltères", "Biceps, brachial", "Avant-bras", "front", { biceps: 0.9, forearms: 0.6 }, ["Prise neutre.", "Monte sans balancer.", "Descends contrôlé."], "photo-gym"),
  E("preacher", "Curl pupitre", "Bras", "Barre", "Biceps", "", "front", { biceps: 1 }, ["Aisselles sur le pupitre.", "Ne tends pas complètement en bas.", "Contracte en haut."], "photo-gym"),
  E("pushdown", "Extension triceps poulie", "Bras", "Poulie", "Triceps", "", "back", {}, ["Coudes collés au corps.", "Tends complètement.", "Remonte sans décoller les coudes."], "photo-gym", { triceps: 1 }),
  E("skull", "Barre au front", "Bras", "Barre", "Triceps", "", "back", {}, ["Allongé, barre au-dessus du front.", "Fléchis les coudes seulement.", "Tends sans verrouiller brutalement."], "photo-gym", { triceps: 1 }),
  E("overhead-ext", "Extension triceps au-dessus de la tête", "Bras", "Haltères", "Triceps (longue portion)", "", "back", {}, ["Haltère à deux mains derrière la tête.", "Coudes près des oreilles.", "Tends complètement."], "photo-gym", { triceps: 1 }),
  E("wrist-curl", "Curl poignets", "Bras", "Barre", "Avant-bras", "", "front", { forearms: 1 }, ["Avant-bras sur les cuisses.", "Fléchis les poignets.", "Amplitude complète."], "photo-gym"),
  // Abdos
  E("plank", "Planche", "Abdos", "Poids du corps", "Abdos", "Obliques, lombaires", "front", { abs: 1, obliques: 0.5 }, ["Coudes sous les épaules.", "Bassin rétroversé, corps aligné.", "Respire sans relâcher."], "photo-burpees"),
  E("hanging-leg", "Relevés de jambes suspendu", "Abdos", "Poids du corps", "Abdos", "Fléchisseurs de hanche", "front", { abs: 1 }, ["Suspendu, sans balancer.", "Monte les genoux ou jambes tendues.", "Enroule le bassin en haut."], "photo-pullup"),
  E("crunch-cable", "Crunch à la poulie", "Abdos", "Poulie", "Abdos", "", "front", { abs: 1 }, ["À genoux, corde derrière la tête.", "Enroule le buste vers les genoux.", "Reviens lentement."], "photo-gym"),
  E("ab-wheel", "Roue abdominale", "Abdos", "Poids du corps", "Abdos", "Lombaires", "front", { abs: 1, obliques: 0.4 }, ["À genoux, bassin rétroversé.", "Roule devant sans cambrer.", "Reviens en contractant."], "photo-burpees"),
  E("russian", "Russian twist", "Abdos", "Kettlebell", "Obliques", "Abdos", "front", { obliques: 1, abs: 0.5 }, ["Buste incliné, pieds décollés.", "Tourne les épaules, pas seulement les bras.", "Touche le sol de chaque côté."], "photo-kettlebell"),
  E("side-plank", "Planche latérale", "Abdos", "Poids du corps", "Obliques", "", "front", { obliques: 1 }, ["Coude sous l'épaule.", "Hanches hautes et alignées.", "Tiens sans relâcher."], "photo-burpees"),
  // Cardio / stations
  E("run", "Course", "Cardio", "Cardio", "Cardio", "Jambes", "front", { quads: 0.5, calves: 0.5 }, ["Cadence 170–180 pas/min.", "Regard loin, épaules relâchées.", "Allure régulière."], "photo-run", { hamstrings: 0.5, calves: 0.6 }),
  E("rower", "Rameur", "Cardio", "Cardio", "Cardio", "Dos, jambes", "back", { lats: 0.6, quads: 0.5 }, ["Jambes, puis buste, puis bras.", "Retour dans l'ordre inverse.", "Puissance par les jambes."], "photo-w-rower", { lats: 0.6 }),
  E("skierg", "SkiErg", "Cardio", "Cardio", "Cardio", "Dorsaux, abdos", "front", { abs: 0.6 }, ["Tire avec le buste, pas seulement les bras.", "Hanches en arrière.", "Rythme constant."], "photo-w-rower", { lats: 0.7, triceps: 0.4 }),
  E("sled-push", "Sled push", "Cardio", "Cardio", "Jambes", "Cardio", "front", { quads: 1, calves: 0.5 }, ["Bras tendus, buste bas.", "Petits pas puissants.", "Ne t'arrête pas."], "photo-sled", { glutes: 0.8 }),
  E("sled-pull", "Sled pull", "Cardio", "Cardio", "Dos", "Jambes", "back", { lats: 0.8, hamstrings: 0.6 }, ["Prise main sur main.", "Tire par le dos, recule régulièrement.", "Corde tendue en permanence."], "photo-sled", { lats: 0.9 }),
  E("burpee-bj", "Burpee broad jumps", "Cardio", "Poids du corps", "Corps entier", "", "front", { quads: 0.7, pecs: 0.4, abs: 0.4 }, ["Poitrine au sol.", "Saut en longueur, réception souple.", "Rythme tenable."], "photo-burpees", { glutes: 0.6 }),
  E("farmers", "Farmers carry", "Cardio", "Kettlebell", "Avant-bras, trapèzes", "Gainage", "front", { forearms: 1, abs: 0.4 }, ["Épaules basses et en arrière.", "Pas rapides et courts.", "Ne te penche pas."], "photo-kettlebell", { traps: 0.8 }),
  E("sandbag-lunge", "Fentes sac de sable", "Cardio", "Poids du corps", "Jambes", "Fessiers", "front", { quads: 1 }, ["Sac sur les épaules.", "Genou arrière au sol à chaque pas.", "Buste droit."], "photo-squat", { glutes: 0.9 }),
  E("wallball", "Wall balls", "Cardio", "Poids du corps", "Jambes, épaules", "Cardio", "front", { quads: 0.9, delts: 0.8 }, ["Squat complet.", "Lance à la cible en remontant.", "Réceptionne et redescends sans pause."], "photo-wallball", { glutes: 0.6 }),
  E("bike", "Vélo", "Cardio", "Cardio", "Cardio", "Jambes", "front", { quads: 0.8, calves: 0.4 }, ["Cadence 85–95 tr/min.", "Buste stable.", "Puissance régulière."], "photo-run"),
  E("muscle-up", "Muscle-up", "Dos", "Poids du corps", "Dorsaux", "Triceps, pectoraux", "back", { lats: 1 }, ["Traction explosive, barre vers les hanches.", "Transition coudes au-dessus de la barre.", "Dips final."], "photo-chalk", { triceps: 0.8 }),
  E("front-lever", "Front lever", "Dos", "Poids du corps", "Dorsaux", "Abdos", "back", { lats: 1 }, ["Bras tendus, omoplates serrées.", "Corps horizontal, bassin rétroversé.", "Tiens, respire."], "photo-chalk", { abs: 0.8 }),
];
export const EXO_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const GROUPS_LIST: Group[] = ["Pectoraux", "Dos", "Jambes", "Épaules", "Bras", "Abdos", "Cardio"];
export const EQUIPS: Equip[] = ["Barre", "Haltères", "Poulie", "Machine", "Poids du corps", "Kettlebell", "Cardio"];
export const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
