export type ChoiceType = 'compromise' | 'perfectionism' | 'skip' | 'neutral' | 'abandon';

export type EndingType = 'compromise' | 'perfectionism' | 'abandon' | 'miracle';

export type TextVerbosity = 'poetic' | 'concise' | 'minimal';

export type UIComplexity = 'minimal' | 'normal' | 'cluttered';

export interface Choice {
  day: number;
  type: ChoiceType;
  description: string;
  impact: {
    visualDegradation: number; // 0-100
    progress: number; // 0-100
    quality: number; // 0-100
    energy: number; // 0-100
  };
}

export interface GameStats {
  quality: number; // 0-100
  progress: number; // 0-100
  energy: number; // 0-100
  bugCount: number;
}

export interface VisualConfig {
  backgroundOpacity: number; // 0-1
  backgroundBlur: number; // 0-20 (px)
  saturation: number; // 0-100 (%)
  uiComplexity: UIComplexity;
  textVerbosity: TextVerbosity;
}

export interface GameState {
  currentDay: number; // 1-30
  visualDegradation: number; // 0-100
  choices: Choice[];
  stats: GameStats;
  isComplete: boolean;
  ending?: EndingType;
  selectedGenre?: 'fantasy' | 'cyberpunk' | 'postapoc';
}

export interface DayContent {
  day: number;
  act: 1 | 2 | 3;
  title: string;
  description: string | ((genre?: 'fantasy' | 'cyberpunk' | 'postapoc') => string);
  minigame?: string;
  minigameSkipImpact?: Choice['impact']; // Impact if player skips minigame
  choices: DayChoice[];
}

export interface DayChoice {
  id: string;
  text: string;
  type: ChoiceType;
  impact: Choice['impact'];
}
