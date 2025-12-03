
import { AppState, Quest } from "./types";

export const AVATARS = [
    "🦁", "🐯", "🐻", "🐶", "🐱", "🐼", "🐨", "🐸",
    "🤖", "👽", "👻", "💀", "🦸", "🥷", "🧙", "🧚",
    "😎", "🤠", "🥳", "🥶", "🎃", "👾", "🦖", "🦄"
];

// Quests for Age < 14
export const KIDS_QUESTS: Omit<Quest, 'id' | 'done'>[] = [
    { txt: "Faire ses devoirs", cat: "MNT", xp: 50, minLevel: 1 },
    { txt: "Brosser les dents (Matin)", cat: "PHY", xp: 10, minLevel: 1 },
    { txt: "Brosser les dents (Soir)", cat: "PHY", xp: 10, minLevel: 1 },
    { txt: "Manger un fruit / légume", cat: "PHY", xp: 20, minLevel: 1 },
    { txt: "S'habiller tout seul", cat: "PHY", xp: 15, minLevel: 1 },
    { txt: "Ranger sa chambre", cat: "ENV", xp: 30, minLevel: 2 },
    { txt: "Lire 10 minutes", cat: "MNT", xp: 25, minLevel: 2 },
    { txt: "Aider à mettre la table", cat: "FAM", xp: 25, minLevel: 1 },
    { txt: "Aller au lit à l'heure", cat: "PHY", xp: 30, minLevel: 1 },
];

// Quests for Age >= 14
export const TEEN_QUESTS: Omit<Quest, 'id' | 'done'>[] = [
    { txt: "Douche Froide", cat: "PHY", xp: 50, minLevel: 1 },
    { txt: "Session Sport (30min)", cat: "PHY", xp: 50, minLevel: 1 },
    { txt: "Ranger l'appartement/chambre", cat: "ENV", xp: 30, minLevel: 1 },
    { txt: "Avancer Projet Perso", cat: "PRJ", xp: 100, minLevel: 1 },
    { txt: "Lire 20 pages", cat: "MNT", xp: 40, minLevel: 2 },
    { txt: "Boire 2L d'eau", cat: "PHY", xp: 20, minLevel: 1 },
    { txt: "Méditation (10min)", cat: "MNT", xp: 30, minLevel: 3 },
    { txt: "Appeler un proche", cat: "FAM", xp: 50, minLevel: 1 }
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
    "FAM": { name: "FAMILLE", val: 20, max: 100 }
  },

  quests: [] // Will be populated based on age
};
