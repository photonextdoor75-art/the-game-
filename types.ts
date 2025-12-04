

export type StatKey = 'MNT' | 'PHY' | 'ENV' | 'PRJ' | 'FAM' | 'ECO' | 'SOC';

export type SchoolStatKey = 'ECR' | 'LEC' | 'MAT' | 'SPO' | 'COM';

export type QuestFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type SeasonType = 'RENTREE' | 'AUTOMNE' | 'NOEL' | 'HIVER' | 'PRINTEMPS' | 'ETE';

// Added 'games' to the union type
export type ViewName = 'quests' | 'stats' | 'rewards' | 'games';

export interface StatDef {
  name: string;
  val: number; // 0-100
  max: number;
}

export interface Quest {
  id: number;
  txt: string;
  cat: StatKey;
  xp: number;
  tokens: number; // Currency reward
  minLevel?: number;
  
  frequency: QuestFrequency;
  progress: number;
  maxProgress: number; // e.g. 5 for "Do 5 times"
  done: boolean;
}

export interface RewardDef {
  txt: string;
  rar: 'COMMUNE' | 'RARE' | 'EPIQUE' | 'LEGENDAIRE';
  color: string;
  val?: number; // XP value if applicable
  prob?: number; // Probability for random drops
}

export interface ShopItem {
  id: string;
  txt: string;
  cost: number; // Cost in Tokens
  rar: 'COMMUNE' | 'RARE' | 'EPIQUE' | 'LEGENDAIRE';
  color: string;
  icon: string;
}

export interface AvatarDef {
    id: string;
    file: string;
    name: string;
}

export interface AppState {
  // Identity
  name: string; // New: User's name
  pin: string;  // New: 4 digit security code

  // Profile
  onboardingComplete: boolean;
  age: number;
  gender: 'M' | 'F' | 'O';
  avatar: string;
  customSport?: string;

  level: number;
  xp: number;
  tokens: number; // Currency for shop
  
  // Brawl Mechanics
  boxes: number;
  tasksDoneTotal: number;
  streak: number;
  tasksSinceLastBox: number;
  lastDailyClaim: string | null; // ISO date string

  quests: Quest[];
  stats: Record<StatKey, StatDef>;
  schoolStats: Record<SchoolStatKey, StatDef>;
}

export type QuestPreset = Omit<Quest, 'id' | 'done' | 'progress'>;

// Helper to get color by category for UI
export const CAT_COLORS: Record<StatKey, string> = {
    MNT: '#0091ff', // Blue
    PHY: '#d32f2f', // Red
    ENV: '#68fd56', // Green
    PRJ: '#d15eff', // Purple
    FAM: '#ff9100', // Orange
    ECO: '#00e5ff', // Cyan (School)
    SOC: '#ff0080'  // Pink (Social/Comportement)
};

export const CAT_ICONS: Record<StatKey, string> = {
    MNT: '🧠',
    PHY: '💪',
    ENV: '🏠',
    PRJ: '🚀',
    FAM: '❤️',
    ECO: '📚',
    SOC: '🤝'
};