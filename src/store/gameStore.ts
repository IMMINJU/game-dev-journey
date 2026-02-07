import { create } from 'zustand';
import type { GameState, Choice, EndingType } from '../types/game';

interface GameStore extends GameState {
  // Actions
  nextDay: () => void;
  makeChoice: (choice: Choice) => void;
  resetGame: () => void;
  completeGame: (ending: EndingType) => void;
  setGenre: (genre: 'fantasy' | 'cyberpunk' | 'postapoc') => void;

  // Computed values
  getVisualConfig: () => {
    backgroundOpacity: number;
    backgroundBlur: number;
    saturation: number;
    uiComplexity: 'minimal' | 'normal' | 'cluttered';
    textVerbosity: 'poetic' | 'concise' | 'minimal';
  };
}

const initialState: GameState = {
  currentDay: 1,
  visualDegradation: 0,
  choices: [],
  stats: {
    quality: 100,
    progress: 0,
    energy: 100,
    bugCount: 0,
  },
  isComplete: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  nextDay: () => {
    set((state) => {
      const newDay = state.currentDay + 1;

      // Check for ending conditions on Day 30
      if (newDay > 30) {
        const { stats, choices } = state;
        let ending: EndingType;

        // Count choice types
        const compromiseCount = choices.filter(c => c.type === 'compromise').length;
        const perfectionismCount = choices.filter(c => c.type === 'perfectionism').length;

        // Miracle ending: high quality + high progress + few compromises
        if (stats.quality >= 80 && stats.progress >= 95 && compromiseCount < 5) {
          ending = 'miracle';
        }
        // Abandon ending: gave up before day 15
        else if (state.currentDay < 15) {
          ending = 'abandon';
        }
        // Perfectionism ending: very high quality but low progress, or many delays
        else if (perfectionismCount > compromiseCount * 2 || (stats.quality > 70 && stats.progress < 70)) {
          ending = 'perfectionism';
        }
        // Compromise ending: default
        else {
          ending = 'compromise';
        }

        return {
          currentDay: newDay,
          isComplete: true,
          ending,
        };
      }

      return {
        currentDay: newDay,
      };
    });
  },

  makeChoice: (choice: Choice) => {
    set((state) => {
      // Bug count logic: compromise choices increase bugs, perfectionism reduces them
      let bugDelta = 0;
      if (choice.type === 'compromise') {
        bugDelta = Math.floor(Math.random() * 5) + 3; // 3-7 bugs
      } else if (choice.type === 'perfectionism') {
        bugDelta = -Math.floor(Math.random() * 3) - 1; // -1 to -3 bugs
      } else {
        bugDelta = Math.floor(Math.random() * 3); // 0-2 bugs
      }

      // Energy penalty: low energy causes more bugs and quality loss
      let energyPenalty = 0;
      let qualityPenalty = 0;
      if (state.stats.energy <= 20) {
        energyPenalty = Math.floor(Math.random() * 5) + 3; // 3-7 extra bugs when exhausted
        qualityPenalty = -5; // -5 quality when exhausted
      } else if (state.stats.energy <= 50) {
        energyPenalty = Math.floor(Math.random() * 3) + 1; // 1-3 extra bugs when tired
        qualityPenalty = -2; // -2 quality when tired
      }

      const newStats = {
        quality: Math.max(0, Math.min(100, state.stats.quality + choice.impact.quality + qualityPenalty)),
        progress: Math.max(0, Math.min(100, state.stats.progress + choice.impact.progress)),
        energy: Math.max(0, Math.min(100, state.stats.energy + choice.impact.energy)),
        bugCount: Math.max(0, state.stats.bugCount + bugDelta + energyPenalty),
      };

      // Meta choice effect: compromise choices increase degradation more
      // This creates a feedback loop where choosing speed/compromise makes the game itself feel more rushed
      let degradationDelta = choice.impact.visualDegradation;
      if (choice.type === 'compromise') {
        degradationDelta += 2; // Extra degradation penalty for compromise
      } else if (choice.type === 'perfectionism') {
        degradationDelta -= 1; // Slight degradation reduction for perfectionism
      }

      // Low energy increases degradation (tired = sloppy work)
      if (state.stats.energy <= 20) {
        degradationDelta += 3;
      } else if (state.stats.energy <= 50) {
        degradationDelta += 1;
      }

      const newDegradation = Math.max(
        0,
        Math.min(100, state.visualDegradation + degradationDelta)
      );

      return {
        choices: [...state.choices, choice],
        stats: newStats,
        visualDegradation: newDegradation,
      };
    });
  },

  resetGame: () => {
    set(initialState);
  },

  completeGame: (ending: EndingType) => {
    set({
      isComplete: true,
      ending,
    });
  },

  setGenre: (genre: 'fantasy' | 'cyberpunk' | 'postapoc') => {
    set({ selectedGenre: genre });
  },

  getVisualConfig: () => {
    const degradation = get().visualDegradation;
    const day = get().currentDay;

    // Visual degradation calculation
    // Act 1 (Day 1-5): 0-10% degradation
    // Act 2 (Day 6-20): 10-70% degradation
    // Act 3 (Day 21-30): 70-95% degradation

    const backgroundOpacity = 1 - degradation * 0.009; // 100% -> 10%
    const backgroundBlur = degradation * 0.2; // 0px -> 20px
    const saturation = 100 - degradation; // 100% -> 0%

    let uiComplexity: 'minimal' | 'normal' | 'cluttered' = 'minimal';
    if (degradation > 30 && degradation <= 70) {
      uiComplexity = 'normal';
    } else if (degradation > 70) {
      uiComplexity = 'cluttered';
    }

    let textVerbosity: 'poetic' | 'concise' | 'minimal' = 'poetic';
    if (degradation > 30 && degradation <= 70) {
      textVerbosity = 'concise';
    } else if (degradation > 70) {
      textVerbosity = 'minimal';
    }

    return {
      backgroundOpacity,
      backgroundBlur,
      saturation,
      uiComplexity,
      textVerbosity,
    };
  },
}));
