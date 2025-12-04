
import { AppState, QuestPreset, RewardDef, ShopItem, SeasonType } from "./types";

export const AVATARS = [
    "🦁", "🐯", "🐻", "🐶", "🐱", "🐼", "🐨", "🐸",
    "🤖", "👽", "👻", "💀", "🦸", "🥷", "🧙", "🧚",
    "😎", "🤠", "🥳", "🥶", "🎃", "👾", "🦖", "🦄"
];

// --- SEASONS LOGIC (Zone C / Paris) ---
export const getCurrentSeason = (): SeasonType => {
    const now = new Date();
    const month = now.getMonth(); // 0-11 (Jan is 0)
    const day = now.getDate();

    // RENTREE: Sept 1 - Oct 17
    if (month === 8 || (month === 9 && day < 18)) return 'RENTREE';
    
    // AUTOMNE / TOUSSAINT: Oct 18 - Nov 30
    if ((month === 9 && day >= 18) || month === 10) return 'AUTOMNE';

    // NOEL: Dec 1 - Jan 5 (Covers Advent + Holidays)
    if (month === 11 || (month === 0 && day <= 5)) return 'NOEL';

    // HIVER: Jan 6 - Mar 20
    if ((month === 0 && day > 5) || month === 1 || (month === 2 && day < 20)) return 'HIVER';

    // PRINTEMPS: Mar 20 - Jun 20
    if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 20)) return 'PRINTEMPS';

    // ETE: Jun 21 - Aug 31
    return 'ETE';
};

export const SEASON_CONFIG: Record<SeasonType, { bgGradient: string[] }> = {
    RENTREE: { bgGradient: ['#2b1145', '#05020a'] }, // Deep Purple (Cosmic)
    AUTOMNE: { bgGradient: ['#3d1e11', '#140802'] }, // Brown/Orange Dark
    NOEL: { bgGradient: ['#0f2e47', '#020b14'] },    // Dark Ice Blue
    HIVER: { bgGradient: ['#1e2530', '#000000'] },   // Cold Grey/Black
    PRINTEMPS: { bgGradient: ['#1e3814', '#040f02'] }, // Deep Green
    ETE: { bgGradient: ['#453811', '#120c02'] }      // Warm Gold/Dark
};

// --- READING GAME DATA ---
export const READING_WORDS = [
    { id: 1, text: "MOTO", syllables: ["MO", "TO"], image: "🏍️" },
    { id: 2, text: "VÉLO", syllables: ["VÉ", "LO"], image: "🚲" },
    { id: 3, text: "LAMA", syllables: ["LA", "MA"], image: "🦙" },
    { id: 4, text: "DOMINO", syllables: ["DO", "MI", "NO"], image: "🎲" },
    { id: 5, text: "TOMATE", syllables: ["TO", "MA", "TE"], image: "🍅" },
    { id: 6, text: "BANANE", syllables: ["BA", "NA", "NE"], image: "🍌" },
    { id: 7, text: "ROBOT", syllables: ["RO", "BOT"], image: "🤖" },
    { id: 8, text: "CANAPÉ", syllables: ["CA", "NA", "PÉ"], image: "🛋️" },
    { id: 9, text: "PYJAMA", syllables: ["PY", "JA", "MA"], image: "👕" },
    { id: 10, text: "SIRÈNE", syllables: ["SI", "RÈ", "NE"], image: "🧜‍♀️" }
];

export const DISTRACTORS = ["RA", "PI", "LU", "SO", "NU", "KA", "RI", "PO", "TU", "ME"];

// --- QUESTS POOLS ---

// Quests for Age < 14
export const KIDS_QUESTS: QuestPreset[] = [
    { txt: "Faire ses devoirs", cat: "ECO", xp: 50, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Lire 10 minutes", cat: "ECO", xp: 25, tokens: 5, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Brosser les dents", cat: "PHY", xp: 15, tokens: 5, minLevel: 1, frequency: 'DAILY', maxProgress: 2 }, // Matin et Soir
    { txt: "Ranger sa chambre", cat: "ENV", xp: 30, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Manger un fruit/légume", cat: "PHY", xp: 20, tokens: 5, minLevel: 1, frequency: 'DAILY', maxProgress: 2 },
    { txt: "Dire 'Je t'aime'", cat: "FAM", xp: 25, tokens: 5, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Ne pas dire de gros mots", cat: "SOC", xp: 50, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
];

export const TEEN_QUESTS: QuestPreset[] = [
    { txt: "Session Sport (30min)", cat: "PHY", xp: 100, tokens: 20, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Ranger l'espace perso", cat: "ENV", xp: 50, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Avancer Projet", cat: "PRJ", xp: 100, tokens: 25, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
    { txt: "Boire 2L d'eau", cat: "PHY", xp: 40, tokens: 10, minLevel: 1, frequency: 'DAILY', maxProgress: 1 },
];

// SEASON QUESTS (Weekly/Monthly) - Higher Rewards
export const WEEKLY_QUESTS: QuestPreset[] = [
    { txt: "Faire 5 fois ses devoirs sans râler", cat: "ECO", xp: 500, tokens: 100, minLevel: 2, frequency: 'WEEKLY', maxProgress: 5 },
    { txt: "Ranger sa chambre à fond", cat: "ENV", xp: 300, tokens: 60, minLevel: 1, frequency: 'WEEKLY', maxProgress: 1 },
    { txt: "Lire 3 soirs de suite", cat: "ECO", xp: 200, tokens: 50, minLevel: 2, frequency: 'WEEKLY', maxProgress: 3 },
    { txt: "Aider pour le repas 3 fois", cat: "FAM", xp: 300, tokens: 70, minLevel: 3, frequency: 'WEEKLY', maxProgress: 3 },
    { txt: "Sport : 2 Séances complètes", cat: "PHY", xp: 400, tokens: 80, minLevel: 2, frequency: 'WEEKLY', maxProgress: 2 },
];

export const MONTHLY_QUESTS: QuestPreset[] = [
    { txt: "Finir un livre entier", cat: "ECO", xp: 1000, tokens: 300, minLevel: 5, frequency: 'MONTHLY', maxProgress: 1 },
    { txt: "Aucun mot dans le carnet", cat: "SOC", xp: 1000, tokens: 300, minLevel: 3, frequency: 'MONTHLY', maxProgress: 1 },
    { txt: "Apprendre une nouvelle compétence", cat: "PRJ", xp: 1500, tokens: 500, minLevel: 5, frequency: 'MONTHLY', maxProgress: 1 },
];

// --- SHOP REWARDS ---

// Daily Freebies (Small Prizes)
export const DAILY_GIFT_POOL: RewardDef[] = [
    { txt: "1 Bonbon", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.4 },
    { txt: "1 Carré de Chocolat", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.3 },
    { txt: "1 Gommette / Sticker", rar: "COMMUNE", color: "#54b734", val: 50, prob: 0.2 },
    { txt: "5 Minutes Temps Libre", rar: "RARE", color: "#0091ff", val: 100, prob: 0.1 },
];

// Token Shop (Medium to Extreme Prizes)
export const SHOP_ITEMS: ShopItem[] = [
    // PETIT (10-30 Tokens)
    { id: 'bonbon_x2', txt: "2 Bonbons", cost: 15, rar: "COMMUNE", color: "#54b734", icon: "🍬" },
    { id: 'chocolat_chaud', txt: "Chocolat Chaud", cost: 25, rar: "COMMUNE", color: "#54b734", icon: "☕" },

    // MOYEN (Cost 50-150 Tokens)
    { id: 'brawl_15', txt: "15 min Brawl Stars", cost: 100, rar: "RARE", color: "#0091ff", icon: "📱" },
    { id: 'music_15', txt: "15 min Musique/Danse", cost: 80, rar: "RARE", color: "#0091ff", icon: "🎵" },
    { id: 'video_1', txt: "1 Dessin Animé", cost: 120, rar: "RARE", color: "#0091ff", icon: "📺" },
    
    // GRAND (Cost 200-500 Tokens)
    { id: 'brawl_dad', txt: "Brawl avec Papa", cost: 250, rar: "EPIQUE", color: "#d15eff", icon: "🎮" },
    { id: 'story_extra', txt: "Histoire Extra", cost: 200, rar: "EPIQUE", color: "#d15eff", icon: "📖" },
    { id: 'play_park', txt: "1h au Parc", cost: 400, rar: "EPIQUE", color: "#d15eff", icon: "🛝" },
    { id: 'switch_1h', txt: "1h Console Switch", cost: 500, rar: "EPIQUE", color: "#d15eff", icon: "🕹️" },

    // EXTREME (Cost 800+ Tokens)
    { id: 'cinema', txt: "Sortie Cinéma", cost: 1000, rar: "LEGENDAIRE", color: "#ffc400", icon: "🍿" },
    { id: 'mcdo', txt: "McDo / Burger King", cost: 1200, rar: "LEGENDAIRE", color: "#ffc400", icon: "🍔" },
    { id: 'toy_new', txt: "Nouveau Jouet", cost: 2000, rar: "LEGENDAIRE", color: "#ffc400", icon: "🎁" },
    { id: 'nuages', txt: "La Tête dans les Nuages", cost: 2500, rar: "LEGENDAIRE", color: "#ffc400", icon: "🎰" },
];

export const INITIAL_STATE: AppState = {
  name: '',
  pin: '',
  onboardingComplete: false,
  age: 0,
  gender: 'O',
  avatar: '😎',
  
  level: 1,
  xp: 0,
  tokens: 0, // Starts with 0 currency
  
  boxes: 0,
  tasksDoneTotal: 0,
  streak: 1,
  tasksSinceLastBox: 0,
  lastDailyClaim: null,

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

  quests: []
};
