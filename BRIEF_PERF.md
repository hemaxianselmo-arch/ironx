# IRONX — brief module Performances (app Expo / React Native / TypeScript / expo-router)

Projet : /home/claude/ironx/app (routes dans src/app, UI dans src/ui, stores dans src/store, données dans src/data).
TOUT le texte utilisateur est en FRANÇAIS. Qualité visuelle = celle des maquettes (images de référence ci-dessous), pas moins.
Ne JAMAIS appeler router.* pendant le rendu (seulement dans onPress/useEffect). Toujours `npx tsc --noEmit` propre à la fin.
Écrans = fichiers `src/app/perf/<nom>.tsx`, export default, enveloppés dans `<Page>` (gère safe areas haut/bas et le scroll) + `<Top title sub onBack={() => router.back()} right={...} />`.
Les ScrollView horizontaux doivent avoir `style={{ flexGrow: 0 }}` (sinon trous verticaux). Rien ne doit être coupé à droite : listes de puces → composant `Pills` (scroll horizontal).

## Références visuelles (maquettes, à reproduire fidèlement)
- /home/claude/ironx/ref_perf_a.png : R01 Performances (hub), R02 Détail record (table reps→1RM, Epley/Brzycki, table de charges %), R03 Mes classements, R04 Volume par muscle (figure + barres), R05 Charge et récupération (ACWR, jauge, barres S37→S44, conseil), R06 Tendances (multi-courbes couché/squat/soulevé, 1RM/Volume/Fréquence/Durée/RPE)
- /home/claude/ironx/ref_perf_b.png : R07 Objectifs (barres de progression + suggérés), R08 Hyrox et course (meilleure simulation, barres mensuelles, par station), R09 Rapport du mois (hero rouge, volume, records du mois, partager), R10 Comparer deux simulations Hyrox (stations/courses/tout, écarts), R11 Points faibles (radar Hyrox toi vs allure objectif, à travailler, prédiction depuis tests en salle), R12 Course à pied (VO2max, km/sem, records par distance + prédit Riegel, dernière sortie)
- /home/claude/ironx/ref_perf_c.png : R13 Fractionné (8×400 m, barres par rep, liste rep/FC/temps/écart), R14 Street workout (tests max, courbe, ratio lesté), R15 Forme du jour (anneau score 81, sommeil/FC/VFC/courbatures, ressenti 1-5, ajustement proposé), R16 Standards de force (barre Débutant→Élite par mouvement, ratios × poids de corps, équilibres couché/squat etc.), R17 À améliorer (plateaux/régressions détectés avec conseil + boutons), R18 Régularité (série en cours, heatmap, séances/semaine, par discipline, semaine type)
- /home/claude/ironx/ref_perf_d.png : R19 Ton année (plein écran photo, stats, top 3 progressions, partager en story), R20 Bloc en cours (semaines S1..S6, courbes intensité/volume, séances de la semaine, prochain bloc), R21 Ma semaine (score /100, tableau S44 vs S43 par discipline, ce qui a fait la différence), R22 Se challenger (défis en cours contre moi / amis / salle, défis proposés)

## Kit UI (import depuis "../../ui")
Layout : Page{hero,pad,scroll,withNav}, Top{title,sub,left,right,onBack}, Actions, Surf{pad,r}, Divider, Row, Between, Col, FRow{left,text,right,sub,onPress}, KV{k,v,strong,align}, Media{photo,h,w,r}, Shade, Ov{x,y,anchor}, OvText, OvTitle.
Texte : H1, H2{action,onAction}, Big{v,unit,size,color}, Sub, Label, B{color}, Mono{size,color}.
Contrôles : Btn{label,kind primary|secondary|white|glass,icon,size lg|md|sm,full,onPress}, Circ{icon,size,kind,label,onPress}, Pill{label,on,onPress}, Pills{items,on,onChange}, Tabs, Seg{items,on,onChange}, Toggle{on,onChange}, Avatar{ini,size,ring}, Logo{name}, AIco{name}, Img{name,size}.
Icônes (Icon name=) : Accueil Fil Séance Nutrition Salle back chev plus search check more star play filter cam clock cal bolt trophy share edit copy run bell stats x pause timer.
Graphiques : AreaChart{points,w,h,color}, Bars{vals,w,h,labels,hl}, Ring{pct,size,thick,color,children}, Progress{pct,color,h}, MultiLine{series:[{color,points}],w,h,labels}, Radar{axes,series:[{color,values 0..1}],size}, Heatmap{days:{"YYYY-MM-DD":n},weeks,w}, LevelBar{pct,labels,w}.
Formulaires (Forms) : Field{label,value,onChange,placeholder,keyboard,secure}, Search, Slider, Ruler, SelRow{visual,title,s,on,right,onPress}, SelCard, CheckCircle, Days, FieldLabel, CTA{label,onPress}.
Figure : Figure{view front|back, hl:{groupe:0..1}, h}, ExoThumb{hl,view,size}. Groupes figure : voir GROUPS dans src/ui/Figure.tsx.
Tokens ("../../theme/tokens") : C.bg C.txt C.mut C.soft C.surf C.surf2 C.line C.accent C.green C.blue C.orange C.red, inter(w), man(w), PAD. Images : IMG["photo-bench"] etc. (src/theme/images.ts). Photos dispo : photo-bench, photo-squat, photo-deadlift, photo-gym, photo-run-rain, photo-sled, photo-w-rower, photo-pullup, photo-chalk, photo-portrait, photo-wallball…
Largeur utile d'un graphique dans Page : 358.

## Données réelles (stores)
- src/store/workout.ts : useWorkout() → {active, history: Session[]}, Session{id,name,startedAt,endedAt,exos:[{exoId,rest,sets:[{kg,reps,done,pr,rpe,kind}]}]}, volume(s), bestOf(exoId)→{kg,reps}, heaviest(exoId), exoHistory(exoId)→[{session,sets}], allRecords()→[{exoId,best,date}], fmtKg, fmtVol, fmtT(ms).
- src/data/seed.ts : byId(exoId)→Exercise{id,name,group,primary,equip,hl,view,photo}, e1rm(kg,reps) (Epley), EXERCISES, PREVIOUS_BEST, TEMPLATES. Brzycki : kg × 36 / (37 − reps).
- src/store/profile.ts : useProfile() → {prenom, sexe (0 h,1 f), poids, taille, naissance, disciplines[], goal, seances, jours}, age(p), GOAL_LABEL.
- src/store/activities.ts (NOUVEAU, lis-le entièrement) : useActivities() → {runs, hyrox, street, wods, wellness, goals, blocks, challenges, ftp}; act.addRun/addHyrox/addStreet/addWod/setWellness/addGoal/updateGoal/removeGoal/addBlock/updateBlock/addChallenge/updateChallenge…; HYROX_STATIONS, STREET_MOVES, RUN_DISTS; fmtTime, fmtTimeLong, fmtPace, fmtKm, fmtSigned, pace, hyroxTotal, bestRun, bestRunTime, riegel, vo2max, hrZones, bestHyrox, bestStations, predictHyrox, bestStreet, fmtStreet, readiness(day), acwr(loads), isoWeek, dayKey.
- src/store/gym.ts : MEMBERS (démo) pour les classements, src/store/auth.ts.
Les classements / abonnés / région / France (R03) n'ont pas de serveur : affiche TES chiffres réels et un classement de démonstration clairement nommé « démo » (MEMBERS de gym.ts), avec le texte « classements réels à l'arrivée du serveur ».

## Règles
- Tout doit marcher avec des données réelles : états vides élégants (« Fais ta première séance / sortie pour voir ... ») + un bouton d'action vers la saisie. Pas de chiffres inventés présentés comme réels, sauf les éléments « démo » nommés comme tels.
- Standards de force (R16, ratios 1RM/poids de corps, homme / femme) : Débutant / Novice / Intermédiaire / Avancé / Élite — couché H 0,5/0,75/1,0/1,5/2,0 (F 0,25/0,5/0,75/1,0/1,25), squat H 0,75/1,25/1,5/2,25/2,75 (F 0,5/0,75/1,0/1,5/2,0), soulevé H 1,0/1,5/2,0/2,5/3,0 (F 0,5/1,0/1,25/1,75/2,25), développé militaire H 0,35/0,55/0,8/1,1/1,4 (F 0,2/0,35/0,5/0,7/0,9), tractions lestées (kg ajouté / poids de corps) H 0/0,25/0,5/0,8/1,1 (F 0/0,1/0,25/0,45/0,65). Exercices ids : bench, squat, deadlift, ohp, pullup-weighted.
- Volume par muscle (R04) : séries par groupe via byId(exoId).group et byId(exoId).hl (clés = groupes de la Figure, valeur = intensité) ; colorer la Figure proportionnellement.
- Partager : utiliser `Share.share({ message })` de react-native.
- Un seul fichier par écran, pas de nouveaux packages. Composants partagés éventuels dans src/ui/Perf.tsx (créer si besoin, et l'exporter depuis src/ui/index.ts — attention aux conflits entre agents : préfixe tes composants par ton lot, ex. PerfA_…).
