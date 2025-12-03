
import { AppState } from "./types";

export const INITIAL_STATE: AppState = {
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

  quests: [
    { id: 1, txt: "Douche Froide", cat: "PHY", xp: 50, done: false },
    { id: 2, txt: "Ranger 10 min", cat: "ENV", xp: 30, done: false },
    { id: 3, txt: "Avancer Projet X", cat: "PRJ", xp: 100, done: false }
  ]
};
