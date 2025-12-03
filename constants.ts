
import { AppState, QuestPreset } from "./types";

export const AVATARS = [
    "🦁", "🐯", "🐻", "🐶", "🐱", "🐼", "🐨", "🐸",
    "🤖", "👽", "👻", "💀", "🦸", "🥷", "🧙", "🧚",
    "😎", "🤠", "🥳", "🥶", "🎃", "👾", "🦖", "🦄"
];

// Quests for Age < 14
export const KIDS_QUESTS: QuestPreset[] = [
    // --- ECOLE (ECO) ---
    { txt: "Faire ses devoirs", cat: "ECO", xp: 50, minLevel: 1 },
    { txt: "Lire 10 minutes", cat: "ECO", xp: 25, minLevel: 1 },
    { txt: "Apprendre sa poésie/leçon", cat: "ECO", xp: 40, minLevel: 2 },
    { txt: "Faire 3 additions/maths", cat: "ECO", xp: 30, minLevel: 1 },
    { txt: "Préparer son cartable", cat: "ECO", xp: 20, minLevel: 1 },
    
    // --- FAMILLE (FAM) ---
    { txt: "Dire 'Je t'aime' à Papa/Maman", cat: "FAM", xp: 50, minLevel: 1 },
    { txt: "Faire un câlin à un proche", cat: "FAM", xp: 20, minLevel: 1 },
    { txt: "Jouer avec petit frère/sœur", cat: "FAM", xp: 30, minLevel: 2 },
    { txt: "Aider à mettre la table", cat: "FAM", xp: 25, minLevel: 1 },
    { txt: "Débarrasser son assiette", cat: "FAM", xp: 15, minLevel: 1 },
    
    // --- COMPORTEMENT (SOC) ---
    { txt: "Dire Bonjour / Merci / S'il te plait", cat: "SOC", xp: 25, minLevel: 1 },
    { txt: "Ne pas dire de gros mots", cat: "SOC", xp: 50, minLevel: 1 },
    { txt: "Ecouter Papa/Maman du 1er coup", cat: "SOC", xp: 50, minLevel: 1 },
    { txt: "Être gentil et serviable", cat: "SOC", xp: 30, minLevel: 1 },
    { txt: "Prêter un jouet", cat: "SOC", xp: 40, minLevel: 2 },
    { txt: "Se calmer tout seul (colère)", cat: "SOC", xp: 60, minLevel: 2 },

    // --- PHYSIQUE / SANTE (PHY) ---
    { txt: "Brosser les dents (Matin)", cat: "PHY", xp: 10, minLevel: 1 },
    { txt: "Brosser les dents (Soir)", cat: "PHY", xp: 10, minLevel: 1 },
    { txt: "Manger un fruit / légume", cat: "PHY", xp: 20, minLevel: 1 },
    { txt: "S'habiller tout seul", cat: "PHY", xp: 15, minLevel: 1 },
    { txt: "Aller au lit à l'heure", cat: "PHY", xp: 30, minLevel: 1 },
    
    // --- ENVIRONNEMENT (ENV) ---
    { txt: "Ranger sa chambre", cat: "ENV", xp: 30, minLevel: 2 },
    { txt: "Ranger ses jouets après usage", cat: "ENV", xp: 20, minLevel: 1 },
];

// Quests for Age >= 14
export const TEEN_QUESTS: QuestPreset[] = [
    { txt: "Douche Froide", cat: "PHY", xp: 50, minLevel: 1 },
    { txt: "Session Sport (30min)", cat: "PHY", xp: 50, minLevel: 1 },
    { txt: "Ranger l'appartement/chambre", cat: "ENV", xp: 30, minLevel: 1 },
    { txt: "Avancer Projet Perso", cat: "PRJ", xp: 100, minLevel: 1 },
    { txt: "Lire 20 pages", cat: "MNT", xp: 40, minLevel: 2 },
    { txt: "Boire 2L d'eau", cat: "PHY", xp: 20, minLevel: 1 },
    { txt: "Méditation (10min)", cat: "MNT", xp: 30, minLevel: 3 },
    { txt: "Appeler un proche", cat: "FAM", xp: 50, minLevel: 1 },
    { txt: "Cuisiner un repas sain", cat: "PHY", xp: 40, minLevel: 2 },
    { txt: "0 sucre ajouté aujourd'hui", cat: "PHY", xp: 60, minLevel: 3 }
];

// REWARDS CONFIG
export const KIDS_REWARDS = [
    { txt: "1 Chocolat / Bonbon", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.4 },
    { txt: "1 Image / Sticker", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.3 },
    { txt: "15 min Brawl Stars", rar: "RARE", color: "#0091ff", val: 100, prob: 0.1 },
    { txt: "15 min Musique/Danse", rar: "RARE", color: "#0091ff", val: 100, prob: 0.05 },
    { txt: "1 Dessin Animé", rar: "RARE", color: "#0091ff", val: 150, prob: 0.05 },
    { txt: "Jeu Ballon avec Papa", rar: "EPIQUE", color: "#d15eff", val: 250, prob: 0.03 },
    { txt: "15 min Brawl avec Papa", rar: "EPIQUE", color: "#d15eff", val: 300, prob: 0.02 },
    { txt: "Histoire du soir Extra", rar: "EPIQUE", color: "#d15eff", val: 200, prob: 0.02 },
    { txt: "Sortie Parc (1h)", rar: "LEGENDAIRE", color: "#ffc400", val: 500, prob: 0.01 },
    { txt: "Sortie Ciné", rar: "LEGENDAIRE", color: "#ffc400", val: 800, prob: 0.005 },
    { txt: "Nouveau Petit Jouet", rar: "LEGENDAIRE", color: "#ffc400", val: 1000, prob: 0.005 },
];

export const TEEN_REWARDS = [
    { txt: "Pause Café/Thé", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.5 },
    { txt: "Episode Série", rar: "RARE", color: "#0091ff", val: 150, prob: 0.3 },
    { txt: "Cheat Meal", rar: "EPIQUE", color: "#d15eff", val: 300, prob: 0.15 },
    { txt: "Ciné / Sortie", rar: "LEGENDAIRE", color: "#ffc400", val: 1000, prob: 0.05 },
];

export const INITIAL_STATE: AppState = {
  onboardingComplete: false,
  age: 0,
  gender: 'O',
  avatar: '😎',
  
  level: 1,
  xp: 0,
  
  boxes: 0,
  tasksDoneTotal: 0,
  streak: 1,
  tasksSinceLastBox: 0,

  stats: {
    "MNT": { name: "MENTAL", val: 10, max: 100 },
    "PHY": { name: "PHYSIQUE", val: 10, max: 100 },
    "ENV": { name: "ENVIRON.", val: 10, max: 100 },
    "PRJ": { name: "PROJETS", val: 10, max: 100 },
    "FAM": { name: "FAMILLE", val: 10, max: 100 },
    "ECO": { name: "ECOLE", val: 10, max: 100 },
    "SOC": { name: "COMPORT.", val: 10, max: 100 }
  },
  
  schoolStats: {
    "ECR": { name: "ÉCRITURE", val: 10, max: 100 },
    "LEC": { name: "LECTURE", val: 10, max: 100 },
    "MAT": { name: "MATHS", val: 10, max: 100 },
    "SPO": { name: "SPORT", val: 10, max: 100 },
    "COM": { name: "COMPORT.", val: 50, max: 100 }
  },

  quests: [] // Will be populated based on age
};
