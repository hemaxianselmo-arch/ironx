// Base d'aliments intégrée (valeurs pour 100 g, ordre de grandeur Ciqual) + recettes
export type Cat = "Protéines" | "Féculents" | "Légumes" | "Fruits" | "Produits laitiers" | "Matières grasses" | "Épicerie" | "Boissons" | "Compléments";
export type Food = { id: string; name: string; cat: Cat; kcal: number; p: number; g: number; l: number; fib?: number; portion: number; portionLabel?: string; photo: string; brand?: string; custom?: boolean; barcode?: string };
const F = (id: string, name: string, cat: Cat, kcal: number, p: number, g: number, l: number, portion: number, photo = "photo-meal-chicken", portionLabel?: string, fib?: number): Food => ({ id, name, cat, kcal, p, g, l, portion, photo, portionLabel, fib });

export const FOODS: Food[] = [
  // Protéines
  F("poulet", "Blanc de poulet grillé", "Protéines", 165, 31, 0, 3.6, 180, "photo-meal-chicken"),
  F("dinde", "Escalope de dinde", "Protéines", 110, 24, 0, 1, 150, "photo-meal-chicken"),
  F("boeuf-5", "Steak haché 5 %", "Protéines", 130, 21, 0, 5, 150, "photo-meal-chicken"),
  F("boeuf-15", "Steak haché 15 %", "Protéines", 230, 18, 0, 17, 150, "photo-meal-chicken"),
  F("rumsteak", "Rumsteak", "Protéines", 140, 22, 0, 5.5, 180, "photo-meal-chicken"),
  F("saumon", "Saumon frais", "Protéines", 200, 20, 0, 13, 150, "photo-meal-salmon"),
  F("thon-boite", "Thon au naturel (boîte)", "Protéines", 110, 25, 0, 1, 140, "photo-meal-salmon"),
  F("cabillaud", "Cabillaud", "Protéines", 80, 18, 0, 0.7, 180, "photo-meal-salmon"),
  F("crevettes", "Crevettes cuites", "Protéines", 95, 21, 0, 1, 120, "photo-meal-salmon"),
  F("oeuf", "Œuf entier", "Protéines", 145, 12.5, 0.7, 10, 60, "photo-meal-oats", "1 œuf (60 g)"),
  F("blanc-oeuf", "Blanc d'œuf", "Protéines", 48, 11, 0.7, 0.2, 33, "photo-meal-oats", "1 blanc (33 g)"),
  F("jambon", "Jambon blanc", "Protéines", 110, 20, 1, 3, 50, "photo-meal-chicken", "1 tranche (50 g)"),
  F("tofu", "Tofu ferme", "Protéines", 125, 13, 2, 7, 150, "photo-meal-salmon"),
  F("lentilles", "Lentilles cuites", "Féculents", 115, 9, 17, 0.4, 200, "photo-meal-chicken", undefined, 8),
  F("pois-chiches", "Pois chiches cuits", "Féculents", 140, 8, 20, 2.5, 200, "photo-meal-chicken", undefined, 6),
  // Féculents
  F("riz-cuit", "Riz basmati cuit", "Féculents", 130, 3, 28, 0.3, 250, "photo-meal-chicken"),
  F("riz-cru", "Riz basmati cru", "Féculents", 350, 7.5, 78, 0.6, 80, "photo-meal-chicken"),
  F("pates-cuites", "Pâtes complètes cuites", "Féculents", 125, 5, 24, 1, 200, "photo-meal-chicken", undefined, 4),
  F("pates-crues", "Pâtes crues", "Féculents", 360, 12, 72, 1.5, 100, "photo-meal-chicken"),
  F("avoine", "Flocons d'avoine", "Féculents", 370, 13, 58, 7, 80, "photo-meal-oats", undefined, 10),
  F("patate-douce", "Patate douce cuite", "Féculents", 90, 1.6, 20, 0.1, 250, "photo-meal-salmon", undefined, 3),
  F("pomme-terre", "Pomme de terre vapeur", "Féculents", 80, 2, 17, 0.1, 250, "photo-meal-salmon"),
  F("quinoa", "Quinoa cuit", "Féculents", 120, 4.4, 21, 1.9, 200, "photo-meal-chicken"),
  F("pain-complet", "Pain complet", "Féculents", 250, 9, 45, 3, 60, "photo-meal-oats", "2 tranches (60 g)", 7),
  F("galette-riz", "Galettes de riz", "Féculents", 390, 8, 82, 3, 16, "photo-meal-oats", "2 galettes (16 g)"),
  F("wrap", "Tortilla de blé", "Féculents", 310, 8, 50, 8, 60, "photo-meal-chicken", "1 wrap (60 g)"),
  // Légumes
  F("brocoli", "Brocolis vapeur", "Légumes", 35, 3, 4, 0.4, 200, "photo-meal-chicken", undefined, 3),
  F("haricots-verts", "Haricots verts", "Légumes", 30, 2, 4, 0.2, 200, "photo-meal-chicken", undefined, 3),
  F("courgette", "Courgette", "Légumes", 20, 1.3, 3, 0.2, 200, "photo-meal-salmon"),
  F("epinards", "Épinards", "Légumes", 25, 3, 1.5, 0.5, 150, "photo-meal-salmon"),
  F("tomate", "Tomate", "Légumes", 20, 0.9, 3, 0.2, 150, "photo-meal-salmon", "1 tomate (150 g)"),
  F("salade", "Salade verte", "Légumes", 15, 1.3, 1.5, 0.2, 80, "photo-meal-salmon"),
  F("carotte", "Carotte", "Légumes", 40, 0.8, 8, 0.2, 150, "photo-meal-chicken"),
  F("poivron", "Poivron", "Légumes", 25, 1, 4.5, 0.3, 120, "photo-meal-salmon"),
  F("champignons", "Champignons de Paris", "Légumes", 25, 3, 1, 0.5, 150, "photo-meal-chicken"),
  F("avocat", "Avocat", "Matières grasses", 170, 2, 2, 16, 80, "photo-meal-salmon", "½ avocat (80 g)"),
  // Fruits
  F("banane", "Banane", "Fruits", 90, 1.1, 20, 0.3, 120, "photo-smoothie", "1 banane (120 g)"),
  F("pomme", "Pomme", "Fruits", 52, 0.3, 12, 0.2, 150, "photo-smoothie", "1 pomme (150 g)"),
  F("fruits-rouges", "Fruits rouges", "Fruits", 45, 1, 8, 0.4, 100, "photo-smoothie"),
  F("orange", "Orange", "Fruits", 47, 0.9, 10, 0.1, 150, "photo-smoothie", "1 orange (150 g)"),
  F("kiwi", "Kiwi", "Fruits", 55, 1.1, 11, 0.5, 80, "photo-smoothie", "1 kiwi (80 g)"),
  F("raisins-secs", "Raisins secs", "Fruits", 300, 3, 70, 0.5, 30, "photo-meal-oats"),
  // Produits laitiers
  F("skyr", "Skyr nature 0 %", "Produits laitiers", 57, 10, 4, 0.2, 200, "photo-meal-oats"),
  F("fromage-blanc", "Fromage blanc 0 %", "Produits laitiers", 45, 8, 4, 0.1, 200, "photo-meal-oats"),
  F("yaourt-grec", "Yaourt grec", "Produits laitiers", 120, 5, 4, 9, 150, "photo-meal-oats"),
  F("lait-demi", "Lait demi-écrémé", "Produits laitiers", 46, 3.3, 4.8, 1.6, 250, "photo-shaker", "1 verre (250 ml)"),
  F("cottage", "Cottage cheese", "Produits laitiers", 100, 12, 3, 4, 150, "photo-meal-oats"),
  F("mozzarella", "Mozzarella", "Produits laitiers", 250, 18, 1, 19, 60, "photo-meal-salmon"),
  F("emmental", "Emmental", "Produits laitiers", 380, 28, 0, 29, 30, "photo-meal-chicken"),
  // Matières grasses & épicerie
  F("huile-olive", "Huile d'olive", "Matières grasses", 900, 0, 0, 100, 10, "photo-meal-salmon", "1 c. à s. (10 g)"),
  F("beurre", "Beurre", "Matières grasses", 740, 0.7, 0.5, 82, 10, "photo-meal-oats"),
  F("beurre-cacahuete", "Beurre de cacahuète", "Matières grasses", 600, 25, 15, 50, 15, "photo-meal-oats", "1 c. à s. (15 g)"),
  F("amandes", "Amandes", "Matières grasses", 600, 21, 7, 52, 20, "photo-meal-oats", "1 poignée (20 g)"),
  F("noix", "Noix", "Matières grasses", 650, 15, 7, 63, 20, "photo-meal-oats"),
  F("miel", "Miel", "Épicerie", 320, 0.3, 80, 0, 15, "photo-meal-oats", "1 c. à s. (15 g)"),
  F("chocolat-noir", "Chocolat noir 70 %", "Épicerie", 560, 8, 30, 42, 20, "photo-meal-oats", "2 carrés (20 g)"),
  F("sauce-teriyaki", "Sauce teriyaki", "Épicerie", 90, 2, 18, 0, 20, "photo-meal-chicken", "1 c. à s. (20 g)"),
  F("sauce-soja", "Sauce soja", "Épicerie", 55, 5, 6, 0, 15, "photo-meal-chicken"),
  F("sesame", "Graines de sésame", "Épicerie", 570, 18, 12, 50, 10, "photo-meal-chicken"),
  F("granola", "Granola", "Épicerie", 450, 10, 60, 18, 50, "photo-meal-oats"),
  F("confiture", "Confiture", "Épicerie", 250, 0.3, 60, 0.1, 20, "photo-meal-oats", "1 c. à s. (20 g)"),
  F("ketchup", "Ketchup", "Épicerie", 100, 1, 23, 0.1, 20, "photo-meal-chicken"),
  F("pizza", "Pizza margherita", "Épicerie", 250, 11, 30, 9, 350, "photo-meal-chicken", "1 pizza (350 g)"),
  F("burger", "Burger (fast-food)", "Épicerie", 250, 13, 25, 11, 220, "photo-meal-chicken", "1 burger (220 g)"),
  // Boissons & compléments
  F("eau", "Eau", "Boissons", 0, 0, 0, 0, 250, "photo-shaker", "1 verre (250 ml)"),
  F("cafe", "Café noir", "Boissons", 2, 0.2, 0, 0, 100, "photo-shaker", "1 tasse"),
  F("jus-orange", "Jus d'orange", "Boissons", 45, 0.7, 10, 0.2, 200, "photo-smoothie", "1 verre (200 ml)"),
  F("soda", "Soda", "Boissons", 42, 0, 10.5, 0, 330, "photo-shaker", "1 canette (330 ml)"),
  F("biere", "Bière blonde", "Boissons", 43, 0.5, 3.5, 0, 330, "photo-shaker", "1 bouteille (330 ml)"),
  F("whey", "Whey protéine", "Compléments", 380, 78, 6, 6, 30, "photo-shaker", "1 dose (30 g)"),
  F("creatine", "Créatine monohydrate", "Compléments", 0, 0, 0, 0, 5, "photo-shaker", "1 dose (5 g)"),
  F("barre-prot", "Barre protéinée", "Compléments", 360, 30, 35, 10, 55, "photo-shaker", "1 barre (55 g)"),
];
export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));
export const CATS: Cat[] = ["Protéines", "Féculents", "Légumes", "Fruits", "Produits laitiers", "Matières grasses", "Épicerie", "Boissons", "Compléments"];

export type Recipe = { id: string; name: string; tags: string[]; minutes: number; servings: number; photo: string; ingredients: { foodId: string; grams: number }[]; steps: string[]; level: "facile" | "moyen" };
const R = (id: string, name: string, tags: string[], minutes: number, servings: number, photo: string, ingredients: [string, number][], steps: string[], level: "facile" | "moyen" = "facile"): Recipe => ({ id, name, tags, minutes, servings, photo, ingredients: ingredients.map(([foodId, grams]) => ({ foodId, grams })), steps, level });
export const RECIPES: Recipe[] = [
  R("bowl-teriyaki", "Bowl poulet teriyaki", ["Riches en protéines", "Prise de masse"], 25, 2, "rec-bowl_poulet_teriyaki", [["poulet", 300], ["riz-cru", 160], ["brocoli", 200], ["sauce-teriyaki", 60], ["sesame", 10], ["huile-olive", 10]], ["Cuis le riz. Coupe le poulet en morceaux.", "Saisis le poulet 6 min à feu vif, ajoute la sauce teriyaki, laisse napper.", "Brocolis vapeur 5 min. Dresse, parsème de sésame."]),
  R("overnight-oats", "Overnight oats fruits rouges", ["Rapides", "Riches en protéines"], 10, 1, "rec-overnight_oats_fruits_rouges", [["avoine", 80], ["skyr", 200], ["lait-demi", 100], ["banane", 120], ["beurre-cacahuete", 15]], ["Mélange avoine, skyr et lait dans un bocal.", "Une nuit au frais.", "Le matin : banane en rondelles et beurre de cacahuète."]),
  R("poulet-riz-brocolis", "Poulet riz brocolis", ["Riches en protéines", "Rapides"], 20, 1, "rec-poulet_riz_brocolis", [["poulet", 180], ["riz-cuit", 250], ["brocoli", 200], ["huile-olive", 10]], ["Poulet grillé 5 min par face.", "Riz et brocolis vapeur.", "Un filet d'huile d'olive, sel, poivre."]),
  R("smoothie-rouge", "Smoothie bowl rouge", ["Rapides", "Sèche"], 10, 1, "rec-smoothie_bowl_rouge", [["fruits-rouges", 150], ["banane", 60], ["skyr", 150], ["whey", 15], ["granola", 20]], ["Mixe fruits rouges, banane, skyr et whey.", "Verse dans un bol.", "Granola par-dessus."]),
  R("saumon-patate", "Saumon patate douce asperges", ["Prise de masse"], 25, 1, "rec-saumon_patate_douce_asperges", [["saumon", 150], ["patate-douce", 250], ["haricots-verts", 150], ["huile-olive", 10]], ["Patate douce en cubes au four 20 min à 200 °C.", "Saumon à la poêle 4 min côté peau, 2 min de l'autre.", "Haricots verts vapeur."]),
  R("omelette", "Omelette épinards feta", ["Rapides", "Sèche"], 10, 1, "rec-omelette_epinards_feta", [["oeuf", 180], ["champignons", 150], ["epinards", 80], ["emmental", 20]], ["Fais revenir les champignons.", "Bats les œufs, verse, ajoute épinards et fromage.", "Replie quand c'est pris."]),
  R("wrap-poulet", "Wrap poulet avocat", ["Rapides"], 10, 1, "photo-meal-chicken", [["wrap", 60], ["poulet", 120], ["avocat", 60], ["tomate", 80], ["salade", 30]], ["Poulet réchauffé ou froid.", "Garnis le wrap : salade, tomate, avocat, poulet.", "Roule serré, coupe en deux."]),
  R("shake-post", "Shake post-séance", ["Rapides", "Riches en protéines"], 2, 1, "rec-shaker_proteine", [["whey", 30], ["banane", 120], ["lait-demi", 250]], ["Tout au shaker.", "Secoue 20 secondes.", "Dans les 30 min après la séance."]),
  R("boeuf-quinoa", "Wok de bœuf aux légumes", ["Riches en protéines", "Prise de masse"], 25, 2, "rec-wok_boeuf_legumes", [["rumsteak", 300], ["quinoa", 300], ["poivron", 150], ["courgette", 150], ["sauce-soja", 30], ["huile-olive", 10]], ["Quinoa cuit 15 min.", "Bœuf en lanières saisi 2 min, légumes 5 min, sauce soja.", "Mélange et sers."], "moyen"),
  R("pates-thon", "Pâtes au thon", ["Rapides", "Sèche"], 15, 1, "photo-meal-chicken", [["pates-crues", 90], ["thon-boite", 140], ["tomate", 150], ["huile-olive", 8]], ["Pâtes al dente.", "Tomates concassées chauffées avec le thon.", "Mélange, poivre."]),
  R("cottage-fruits", "Bowl skyr granola", ["Rapides", "Sèche"], 3, 1, "rec-bowl_skyr_granola", [["skyr", 200], ["granola", 40], ["fruits-rouges", 80], ["miel", 10]], ["Skyr dans un bol.", "Granola et fruits rouges.", "Un filet de miel."]),
  R("chili", "Chili con carne", ["Prise de masse"], 20, 2, "rec-chili_con_carne", [["boeuf-5", 300], ["pois-chiches", 200], ["tomate", 300], ["poivron", 150], ["riz-cuit", 300], ["huile-olive", 10]], ["Poivron et tomate revenus 5 min, ajoute le bœuf.", "Pois chiches, épices chili, 10 min à couvert.", "Sers sur le riz."]),
  R("pancakes-prot", "Pancakes protéinés banane", ["Rapides", "Riches en protéines"], 15, 1, "rec-pancakes_proteines_banane", [["avoine", 60], ["oeuf", 120], ["banane", 120], ["whey", 25], ["lait-demi", 60]], ["Mixe avoine, œufs, banane, whey et lait.", "Cuis 2 min par face à feu moyen.", "Sers avec des rondelles de banane."]),
  R("porridge-choco", "Porridge chocolat beurre de cacahuète", ["Prise de masse"], 8, 1, "rec-porridge_chocolat_beurre_cacahuete", [["avoine", 80], ["lait-demi", 250], ["chocolat-noir", 15], ["beurre-cacahuete", 20], ["whey", 20]], ["Avoine et lait 4 min à feu doux.", "Hors du feu : whey et chocolat.", "Beurre de cacahuète par-dessus."]),
  R("tartines-avocat", "Tartines avocat œuf poché", ["Rapides", "Sèche"], 12, 1, "rec-tartines_avocat_oeuf_poche", [["pain-complet", 80], ["avocat", 80], ["oeuf", 120], ["tomate", 50]], ["Toaste le pain.", "Écrase l'avocat, sel, poivre, citron.", "Œufs pochés 3 min, pose-les dessus."]),
  R("smoothie-vert", "Smoothie vert", ["Rapides", "Sèche"], 5, 1, "rec-smoothie_vert", [["epinards", 60], ["banane", 100], ["kiwi", 80], ["yaourt-grec", 150], ["whey", 15]], ["Tout au blender.", "Mixe 40 secondes.", "Sers bien frais."]),
  R("crepes-prot", "Crêpes protéinées", ["Rapides", "Riches en protéines"], 15, 1, "rec-crepes_proteinees", [["avoine", 50], ["blanc-oeuf", 150], ["whey", 25], ["lait-demi", 100], ["fruits-rouges", 80]], ["Mixe avoine, blancs, whey et lait.", "Crêpes fines, 1 min par face.", "Garnis de fruits rouges."]),
  R("pates-bolo", "Pâtes complètes bolognaise", ["Prise de masse"], 25, 2, "rec-pates_completes_bolognaise", [["pates-crues", 160], ["boeuf-5", 300], ["tomate", 300], ["huile-olive", 10]], ["Bœuf saisi, tomates concassées, 15 min.", "Pâtes al dente.", "Mélange, basilic."]),
  R("salade-cesar", "Salade césar poulet", ["Rapides", "Sèche"], 15, 1, "rec-salade_cesar_poulet", [["poulet", 150], ["salade", 120], ["pain-complet", 40], ["emmental", 20], ["yaourt-grec", 40]], ["Poulet grillé en lanières.", "Croûtons au four 5 min.", "Sauce : yaourt, citron, moutarde, parmesan."]),
  R("wrap-thon", "Wrap thon crudités", ["Rapides", "Sèche"], 8, 1, "rec-wrap_thon_crudites", [["wrap", 60], ["thon-boite", 120], ["tomate", 80], ["salade", 30], ["carotte", 50], ["fromage-blanc", 40]], ["Thon émietté avec le fromage blanc.", "Garnis le wrap de crudités et de thon.", "Roule serré."]),
  R("dinde-quinoa", "Dinde quinoa légumes rôtis", ["Riches en protéines"], 30, 1, "rec-dinde_quinoa_legumes_rotis", [["dinde", 180], ["quinoa", 200], ["courgette", 120], ["poivron", 100], ["huile-olive", 10]], ["Légumes au four 20 min à 200 °C.", "Quinoa 15 min.", "Dinde grillée 4 min par face."]),
  R("burger-maison", "Burger maison pain complet", ["Prise de masse"], 20, 1, "rec-burger_maison_pain_complet", [["pain-complet", 90], ["boeuf-5", 150], ["emmental", 25], ["tomate", 50], ["salade", 20], ["ketchup", 15]], ["Steak 3 min par face, fromage à la fin.", "Pain toasté.", "Monte le burger."]),
  R("curry-pois-chiches", "Curry de pois chiches", ["Sèche"], 20, 2, "rec-curry_pois_chiches", [["pois-chiches", 400], ["tomate", 300], ["epinards", 100], ["riz-cuit", 300], ["huile-olive", 10]], ["Tomates, curry, 5 min.", "Pois chiches et épinards, 10 min.", "Sers sur le riz."]),
  R("cabillaud-rata", "Cabillaud ratatouille", ["Sèche", "Riches en protéines"], 25, 1, "rec-cabillaud_ratatouille", [["cabillaud", 200], ["courgette", 150], ["poivron", 100], ["tomate", 150], ["huile-olive", 10]], ["Ratatouille 15 min à couvert.", "Cabillaud au four 12 min à 180 °C.", "Dresse le poisson sur les légumes."]),
  R("tofu-saute", "Tofu sauté aux légumes", ["Sèche", "Rapides"], 15, 1, "rec-tofu_saute_legumes", [["tofu", 200], ["brocoli", 150], ["poivron", 100], ["sauce-soja", 20], ["sesame", 8], ["riz-cuit", 200]], ["Tofu en cubes doré 5 min.", "Légumes 5 min, sauce soja.", "Sésame, riz."]),
  R("soupe-lentilles", "Soupe de lentilles", ["Sèche"], 30, 2, "rec-soupe_lentilles", [["lentilles", 300], ["carotte", 150], ["tomate", 200], ["huile-olive", 10]], ["Carottes revenues 5 min.", "Lentilles, tomates, 600 ml d'eau, 20 min.", "Mixe partiellement, cumin."]),
];
export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const RECIPE_TAGS = ["Pour toi", "Riches en protéines", "Rapides", "Prise de masse", "Sèche", "Mes recettes"];

/** Macros d'une quantité d'aliment */
export const nut = (f: Food, grams: number) => { const k = grams / 100; return { kcal: Math.round(f.kcal * k), p: Math.round(f.p * k * 10) / 10, g: Math.round(f.g * k * 10) / 10, l: Math.round(f.l * k * 10) / 10 }; };
export const recipeNut = (r: Recipe, servings = 1, foods: Record<string, Food> = FOOD_BY_ID) => {
  const t = { kcal: 0, p: 0, g: 0, l: 0 };
  for (const i of r.ingredients) { const f = foods[i.foodId]; if (!f) continue; const n = nut(f, (i.grams / r.servings) * servings); t.kcal += n.kcal; t.p += n.p; t.g += n.g; t.l += n.l; }
  return { kcal: Math.round(t.kcal), p: Math.round(t.p), g: Math.round(t.g), l: Math.round(t.l) };
};
