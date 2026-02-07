import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { daysData } from '../data/days';
import type { DayChoice } from '../types/game';
import { TypingGame } from './minigames/TypingGame';
import { GenreSelect } from './minigames/GenreSelect';
import { BugCatcher } from './minigames/BugCatcher';
import { TaskOrder } from './minigames/TaskOrder';
import { QAChecklist } from './minigames/QAChecklist';
import { BuildTest } from './minigames/BuildTest';
import { audioManager } from '../utils/audio';

export const Day = () => {
  const currentDay = useGameStore((state) => state.currentDay);
  const makeChoice = useGameStore((state) => state.makeChoice);
  const nextDay = useGameStore((state) => state.nextDay);
  const visualDegradation = useGameStore((state) => state.visualDegradation);
  const selectedGenre = useGameStore((state) => state.selectedGenre);

  // Calculate visual config locally
  const textVerbosity: 'poetic' | 'concise' | 'minimal' =
    visualDegradation > 70 ? 'minimal' : visualDegradation > 30 ? 'concise' : 'poetic';

  // Text degradation effects
  const textOpacity = Math.max(0.7, 1 - visualDegradation * 0.003); // 70% ~ 100%
  const textBlur = visualDegradation > 50 ? (visualDegradation - 50) * 0.1 : 0; // blur after 50% degradation

  const [showMinigame, setShowMinigame] = useState(false);
  const [minigameCompleted, setMinigameCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dayData = daysData.find((d) => d.day === currentDay);

  // Reset minigame state when day changes
  useEffect(() => {
    setShowMinigame(false);
    setMinigameCompleted(false);
    setSelectedIndex(0);
  }, [currentDay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showMinigame || isTransitioning) return;

      const choices = dayData?.choices || [];
      if (choices.length === 0) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        audioManager.playSFX('click');
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : choices.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        audioManager.playSFX('click');
        setSelectedIndex(prev => (prev < choices.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleChoice(choices[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMinigame, isTransitioning, selectedIndex, dayData]);

  if (!dayData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Day {currentDay} - Coming soon...</p>
      </div>
    );
  }

  // Get description based on genre
  const description = typeof dayData.description === 'function'
    ? dayData.description(selectedGenre)
    : dayData.description;

  const handleChoice = (choice: DayChoice) => {
    // Disable clicking during transition
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Check if this is abandon choice
    if (choice.type === 'abandon') {
      audioManager.playSFX('error');
      const completeGame = useGameStore.getState().completeGame;
      completeGame('abandon');
      setIsTransitioning(false);
      return;
    }

    // Play sound
    audioManager.playSFX('click');

    makeChoice({
      day: currentDay,
      type: choice.type,
      description: choice.text,
      impact: choice.impact,
    });

    // Longer delay before moving to next day for better UX
    setTimeout(() => {
      audioManager.playSFX('day-transition');
      nextDay();
      setShowMinigame(false);
      setMinigameCompleted(false);
      setIsTransitioning(false);
    }, 800);
  };

  const handleMinigameComplete = (skipped?: boolean) => {
    setMinigameCompleted(true);
    setShowMinigame(false);

    // Play sound
    if (skipped) {
      audioManager.playSFX('error');
    } else {
      audioManager.playSFX('success');
    }

    // If skipped, apply negative impact
    if (skipped && dayData?.minigameSkipImpact) {
      makeChoice({
        day: currentDay,
        type: 'compromise',
        description: '스킵함',
        impact: dayData.minigameSkipImpact,
      });
    }

    // If no choices (minigame-only day), auto-proceed to next day
    if (dayData && dayData.choices.length === 0) {
      setTimeout(() => {
        audioManager.playSFX('day-transition');
        nextDay();
      }, 1000);
    }
  };

  const handleGenreSelect = (genre: string) => {
    const setGenre = useGameStore.getState().setGenre;
    setGenre(genre as 'fantasy' | 'cyberpunk' | 'postapoc');
    handleMinigameComplete(false);
  };

  // Show minigame if day has one and it hasn't been completed yet
  if (dayData && dayData.minigame && !minigameCompleted && showMinigame) {
    if (dayData.minigame?.startsWith('typing')) {
      const difficulty = (dayData.minigame.split('-')[1] || 'easy') as 'easy' | 'medium' | 'hard';
      return (
        <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
          <TypingGame onComplete={handleMinigameComplete} difficulty={difficulty} />
        </div>
      );
    }
    if (dayData.minigame === 'genre-select') {
      return (
        <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
          <GenreSelect onSelect={handleGenreSelect} />
        </div>
      );
    }
    if (dayData.minigame?.startsWith('bugfix-')) {
      const difficulty = dayData.minigame.split('-')[1] as 'easy' | 'medium' | 'hard';
      return (
        <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
          <BugCatcher onComplete={handleMinigameComplete} difficulty={difficulty} />
        </div>
      );
    }
    if (dayData.minigame?.startsWith('taskorder-')) {
      const taskCount = parseInt(dayData.minigame.split('-')[1]);
      return (
        <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
          <TaskOrder onComplete={handleMinigameComplete} taskCount={taskCount} />
        </div>
      );
    }
    if (dayData.minigame?.startsWith('qa-')) {
      const itemCount = parseInt(dayData.minigame.split('-')[1]);
      return (
        <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
          <QAChecklist onComplete={handleMinigameComplete} itemCount={itemCount} />
        </div>
      );
    }
    if (dayData.minigame?.startsWith('build-')) {
      const buildTime = parseInt(dayData.minigame.split('-')[1]);
      return (
        <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
          <BuildTest onComplete={handleMinigameComplete} buildTime={buildTime} />
        </div>
      );
    }
  }

  // Text size based on verbosity
  const getTitleSize = () => {
    switch (textVerbosity) {
      case 'poetic':
        return 'text-3xl md:text-5xl';
      case 'concise':
        return 'text-2xl md:text-4xl';
      case 'minimal':
        return 'text-xl md:text-3xl';
    }
  };

  const getDescriptionSize = () => {
    switch (textVerbosity) {
      case 'poetic':
        return 'text-base md:text-lg';
      case 'concise':
        return 'text-sm md:text-base';
      case 'minimal':
        return 'text-xs md:text-sm';
    }
  };

  // Act 1: Rich, beautiful layout (0-30% degradation)
  if (visualDegradation < 30) {
    return (
      <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
        <motion.div
          className="max-w-xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative illustration placeholder */}
          <motion.div
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-2xl flex items-center justify-center text-6xl backdrop-blur-sm border-2 border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            🎮
          </motion.div>

          {/* Title - poetic and large */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-center text-white drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {dayData.title}
          </motion.h1>

          {/* Description - full and detailed */}
          <motion.div
            className="text-base md:text-lg mb-8 md:mb-12 text-center whitespace-pre-line leading-relaxed text-white/90 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {description}
          </motion.div>

          {/* Choices - Retro game menu style */}
          {dayData.minigame && !minigameCompleted ? (
            <motion.div
              className="bg-gray-900/80 border-4 border-cyan-400/80 rounded p-6 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={() => setShowMinigame(true)}
                className="w-full text-left text-white text-base md:text-lg p-4 md:p-3 min-h-[48px] hover:bg-cyan-400/20 transition-colors rounded"
              >
                <motion.span
                  className="inline-block mr-3 text-cyan-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ▶
                </motion.span>
                시작하기
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="bg-gray-900/80 border-4 border-cyan-400/80 rounded p-6 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {dayData.choices.map((choice, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <motion.button
                    key={choice.id}
                    onClick={() => {
                      setSelectedIndex(index);
                      handleChoice(choice);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onTouchStart={() => setSelectedIndex(index)}
                    disabled={isTransitioning}
                    className={`w-full text-left text-white text-base md:text-lg p-4 md:p-3 min-h-[48px] rounded transition-colors ${
                      isSelected ? 'bg-cyan-400/20' : 'hover:bg-cyan-400/10'
                    } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <motion.span
                      className="inline-block mr-3 text-cyan-400"
                      animate={isSelected ? { opacity: [1, 0.3, 1] } : { opacity: 0 }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      ▶
                    </motion.span>
                    <span className={!isSelected ? 'ml-8' : ''}>{choice.text}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Act 2: Simplified layout (30-70% degradation)
  if (visualDegradation < 70) {
    return (
      <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
        <motion.div
          className="max-w-xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title - concise */}
          <motion.h1
            className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: textOpacity }}
            transition={{ delay: 0.2 }}
          >
            {dayData.title}
          </motion.h1>

          {/* Description - shorter */}
          <motion.div
            className="text-sm md:text-base mb-6 md:mb-8 text-center whitespace-pre-line leading-normal text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {description}
          </motion.div>

          {/* Choices - Retro style with degraded border */}
          {dayData.minigame && !minigameCompleted ? (
            <motion.div
              className="bg-gray-900/70 border-4 border-gray-400 rounded p-4 backdrop-blur-sm"
              style={{ borderStyle: 'dashed' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => setShowMinigame(true)}
                className="w-full text-left text-white text-sm md:text-base p-4 md:p-2 min-h-[48px] hover:bg-gray-400/20 transition-colors"
              >
                <motion.span
                  className="inline-block mr-2 text-gray-400"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  ▶
                </motion.span>
                시작하기
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="bg-gray-900/70 border-4 border-gray-400 rounded p-4 backdrop-blur-sm"
              style={{ borderStyle: 'dashed' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {dayData.choices.map((choice, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <motion.button
                    key={choice.id}
                    onClick={() => {
                      setSelectedIndex(index);
                      handleChoice(choice);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onTouchStart={() => setSelectedIndex(index)}
                    disabled={isTransitioning}
                    className={`w-full text-left text-white text-sm md:text-base p-4 md:p-2 min-h-[48px] transition-colors ${
                      isSelected ? 'bg-gray-400/20' : 'hover:bg-gray-400/10'
                    } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <motion.span
                      className="inline-block mr-2 text-gray-400"
                      animate={isSelected ? { opacity: [1, 0.5, 1] } : { opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      ▶
                    </motion.span>
                    <span className={!isSelected ? 'ml-6' : ''}>{choice.text}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Act 3: Minimal/broken retro style (70-100% degradation)
  return (
    <div className="flex items-center justify-center h-full w-full p-4 md:p-8">
      <motion.div
        className="max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Title */}
        <motion.h1
          className="text-xl md:text-2xl font-bold mb-3 text-center text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {dayData.title}
        </motion.h1>

        {/* Description */}
        <motion.div
          className="text-sm md:text-base mb-6 text-center whitespace-pre-line text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.div>

        {/* Choices box */}
        <motion.div
          className="bg-gray-950/60 border-2 border-gray-600 rounded p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
        {/* Choices */}
        {dayData.minigame && !minigameCompleted ? (
          <button
            onClick={() => setShowMinigame(true)}
            className="w-full text-left text-gray-400 text-xs md:text-sm p-4 md:p-2 min-h-[48px] transition-colors hover:bg-gray-600/10"
          >
            <motion.span
              className="inline-block mr-2 text-gray-600"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ▶
            </motion.span>
            START_TASK
          </button>
        ) : (
          <div>
            {dayData.choices.map((choice, index) => {
              const isSelected = index === selectedIndex;
              return (
                <motion.button
                  key={choice.id}
                  onClick={() => {
                    setSelectedIndex(index);
                    handleChoice(choice);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  disabled={isTransitioning}
                  className={`w-full text-left text-gray-400 text-xs md:text-sm p-4 md:p-2 min-h-[48px] transition-colors ${
                    isSelected ? 'bg-gray-600/20' : 'hover:bg-gray-600/10'
                  } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <motion.span
                    className="inline-block mr-2 text-gray-600"
                    animate={isSelected ? { opacity: [1, 0.3, 1] } : { opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ▶
                  </motion.span>
                  <span className={!isSelected ? 'ml-4' : ''}>{choice.text}</span>
                </motion.button>
              );
            })}
          </div>
        )}
        </motion.div>
      </motion.div>
    </div>
  );
};
