
export type StatKey = 'MNT' | 'PHY' | 'ENV' | 'PRJ' | 'FAM' | 'ECO';

export type SchoolStatKey = 'ECR' | 'LEC' | 'MAT' | 'SPO' | 'COM';

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
  minLevel?: number; // Level required to unlock
  done: boolean;
}

export interface AppState {
  // Profile
  onboardingComplete: boolean;
  age: number;
  gender: 'M' | 'F' | 'O';
  avatar: string;
  customSport?: string;

  level: number;
  xp: number;
  
  // Brawl Mechanics
  boxes: number;
  tasksDoneTotal: number;
  streak: number;
  tasksSinceLastBox: number;

  quests: Quest[];
  stats: Record<StatKey, StatDef>;
  schoolStats: Record<SchoolStatKey, StatDef>;
}

export type QuestPreset = Omit<Quest, 'id' | 'done'>;

// Helper to get color by category for UI
export const CAT_COLORS: Record<StatKey, string> = {
    MNT: '#0091ff', // Blue
    PHY: '#d32f2f', // Red
    ENV: '#68fd56', // Green
    PRJ: '#d15eff', // Purple
    FAM: '#ff9100', // Orange
    ECO: '#00e5ff'  // Cyan (School)
};

export const CAT_ICONS: Record<StatKey, string> = {
    MNT: '🧠',
    PHY: '💪',
    ENV: '🏠',
    PRJ: '🚀',
    FAM: '❤️',
    ECO: '📚'
};
