import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface BugCatcherProps {
  onComplete: (skipped: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Bug {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  health: number;
  maxHealth: number;
}

const BUG_EMOJIS = ['🐛', '🐜', '🐞', '🦟', '🕷️', '🪲'];

export const BugCatcher = ({ onComplete, difficulty }: BugCatcherProps) => {
  const bugCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [caught, setCaught] = useState(0);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Initialize bugs
  useEffect(() => {
    const newBugs: Bug[] = [];
    const healthByDifficulty = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 5;

    for (let i = 0; i < bugCount; i++) {
      newBugs.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 80 + 10,
        emoji: BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)],
        speed: (Math.random() + 0.5) * (difficulty === 'hard' ? 4 : difficulty === 'medium' ? 3 : 2),
        health: healthByDifficulty,
        maxHealth: healthByDifficulty,
      });
    }
    setBugs(newBugs);
  }, [bugCount, difficulty]);

  // Move bugs
  useEffect(() => {
    const interval = setInterval(() => {
      setBugs(prevBugs =>
        prevBugs.map(bug => {
          let newX = bug.x + (Math.random() - 0.5) * bug.speed;
          let newY = bug.y + (Math.random() - 0.5) * bug.speed;

          // Keep bugs within bounds (10-90%)
          newX = Math.max(10, Math.min(90, newX));
          newY = Math.max(10, Math.min(90, newY));

          return {
            ...bug,
            x: newX,
            y: newY,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Timer and skip option
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    const skipThreshold = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10;
    if (timeElapsed >= skipThreshold) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, difficulty]);

  // Check completion
  useEffect(() => {
    console.log('BugCatcher - caught:', caught, 'bugCount:', bugCount, 'bugs.length:', bugs.length);
    if (caught >= bugCount) {
      console.log('BugCatcher - Completing game!');
      setTimeout(() => {
        onComplete(false);
      }, 500);
    }
  }, [caught, bugCount, onComplete, bugs.length]);

  const handleCatch = (id: number) => {
    // Check if bug still exists
    const bugExists = bugs.find(b => b.id === id);
    if (!bugExists) {
      console.log('Bug', id, 'already removed, ignoring click');
      return;
    }

    audioManager.playSFX('bug');

    const newHealth = bugExists.health - 1;
    console.log('Bug clicked:', id, 'current health:', bugExists.health, 'newHealth:', newHealth);

    if (newHealth <= 0) {
      // Bug is dead, remove it
      audioManager.playSFX('complete');
      console.log('Bug killed! Removing bug', id);

      setBugs(prevBugs => prevBugs.filter(b => b.id !== id));
      setCaught(prev => {
        console.log('Increasing caught count from', prev, 'to', prev + 1);
        return prev + 1;
      });
    } else {
      // Bug still alive, just reduce health
      setBugs(prevBugs =>
        prevBugs.map(b => b.id === id ? { ...b, health: newHealth } : b)
      );
    }
  };

  const handleSkip = () => {
    onComplete(true);
  };

  return (
    <motion.div
      className="w-full h-full max-w-4xl max-h-[80vh] mx-auto p-4 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl text-white">🐛 버그 잡기</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">잡은 버그</div>
            <div className="text-2xl text-green-400 font-bold">
              {caught} / {bugCount}
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 relative bg-gray-950 rounded-lg border-2 border-gray-700 overflow-hidden min-h-[400px]">
          {bugs.map(bug => (
            <motion.div
              key={bug.id}
              className="absolute z-10"
              style={{
                left: `${bug.x}%`,
                top: `${bug.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, rotate: 360 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="relative text-4xl cursor-pointer hover:scale-125 active:scale-90 transition-transform bg-transparent border-none p-2 m-0 min-w-[48px] min-h-[48px] flex items-center justify-center touch-manipulation select-none"
                onClick={() => handleCatch(bug.id)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <motion.span
                  animate={bug.health < bug.maxHealth ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {bug.emoji}
                </motion.span>
                {/* Health bar */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <motion.div
                    className="h-full bg-red-500"
                    animate={{ width: `${(bug.health / bug.maxHealth) * 100}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </button>
            </motion.div>
          ))}

          {/* Debug: Show bug count */}
          <div className="absolute top-2 left-2 text-xs text-gray-500 pointer-events-none">
            버그 수: {bugs.length}
          </div>

          {/* Instructions overlay (fades out) */}
          {caught === 0 && timeElapsed < 3 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 2 }}
            >
              <div className="text-white text-center">
                <div className="text-3xl mb-2">🐛</div>
                <div className="text-lg">버그를 클릭해서 잡으세요!</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          {showSkipOption && (
            <motion.button
              onClick={handleSkip}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              나중에 처리 (품질 -{difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 25})
            </motion.button>
          )}
          {!showSkipOption && (
            <div className="flex-1 text-center text-sm text-gray-400 py-3">
              {timeElapsed}초 경과...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
