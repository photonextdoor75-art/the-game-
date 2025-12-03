
import { AppState, QuestPreset } from "./types";

export const AVATARS = [
    "🦁", "🐯", "🐻", "🐶", "🐱", "🐼", "🐨", "🐸",
    "🤖", "👽", "👻", "💀", "🦸", "🥷", "🧙", "🧚",
    "😎", "🤠", "🥳", "🥶", "🎃", "👾", "🦖", "🦄"
];

// Quests for Age < 14
export const KIDS_QUESTS: QuestPreset[] = [
    { txt: "Faire ses devoirs (Maths/Français)", cat: "ECO", xp: 50, minLevel: 1 },
    { txt: "Brosser les dents (Matin)", cat: "PHY", xp: 10, minLevel: 1 },
    { txt: "Brosser les dents (Soir)", cat: "PHY", xp: 10, minLevel: 1 },
    { txt: "Manger un fruit / légume", cat: "PHY", xp: 20, minLevel: 1 },
    { txt: "S'habiller tout seul", cat: "PHY", xp: 15, minLevel: 1 },
    { txt: "Ranger sa chambre", cat: "ENV", xp: 30, minLevel: 2 },
    { txt: "Lire 10 minutes", cat: "ECO", xp: 25, minLevel: 2 },
    { txt: "Aider à mettre la table", cat: "FAM", xp: 25, minLevel: 1 },
    { txt: "Aller au lit à l'heure", cat: "PHY", xp: 30, minLevel: 1 },
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
    { txt: "Appeler un proche", cat: "FAM", xp: 50, minLevel: 1 }
];

// REWARDS CONFIG
export const KIDS_REWARDS = [
    { txt: "1 Chocolat / Bonbon", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.5 },
    { txt: "15 min Brawl Stars", rar: "RARE", color: "#0091ff", val: 100, prob: 0.3 },
    { txt: "15 min Chanson/Danse", rar: "RARE", color: "#0091ff", val: 100, prob: 0.1 },
    { txt: "1 Dessin Animé", rar: "RARE", color: "#0091ff", val: 150, prob: 0.05 },
    { txt: "Jeu Ballon avec Papa", rar: "EPIQUE", color: "#d15eff", val: 250, prob: 0.03 },
    { txt: "15 min Brawl avec Papa", rar: "EPIQUE", color: "#d15eff", val: 300, prob: 0.015 },
    { txt: "Sortie Parc (1h)", rar: "LEGENDAIRE", color: "#ffc400", val: 500, prob: 0.005 },
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
    "MNT": { name: "MENTAL", val: 20, max: 100 },
    "PHY": { name: "PHYSIQUE", val: 20, max: 100 },
    "ENV": { name: "ENVIRON.", val: 20, max: 100 },
    "PRJ": { name: "PROJETS", val: 20, max: 100 },
    "FAM": { name: "FAMILLE", val: 20, max: 100 },
    "ECO": { name: "ECOLE", val: 20, max: 100 }
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
