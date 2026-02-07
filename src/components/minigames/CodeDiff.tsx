import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface CodeDiffProps {
  onComplete: (skipped: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Cell {
  hasBug: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  nearbyBugs: number;
}

const GRID_CONFIG = {
  easy: { rows: 5, cols: 5, bugs: 5 },
  medium: { rows: 6, cols: 6, bugs: 8 },
  hard: { rows: 8, cols: 8, bugs: 12 },
};

const DIFF_PAIRS: Record<'easy' | 'medium' | 'hard', any[]> = {
  easy: [
    {
      correct: [
        'function init() {',
        '  player.health = 100;',
        '  player.x = 0;',
        '  player.y = 0;',
        '}',
      ],
      buggy: [
        'function init() {',
        '  player.health = 0;',
        '  player.x = 0;',
        '  player.y = 0;',
        '}',
      ],
      diffLines: [1],
    },
    {
      correct: [
        'if (key === "Space") {',
        '  player.jump();',
        '  playSound("jump");',
        '}',
      ],
      buggy: [
        'if (key === "Space") {',
        '  player.jump();',
        '  playSound("jmp");',
        '}',
      ],
      diffLines: [2],
    },
    {
      correct: [
        'for (let i = 0; i < 10; i++) {',
        '  spawnEnemy(i);',
        '}',
      ],
      buggy: [
        'for (let i = 0; i <= 10; i++) {',
        '  spawnEnemy(i);',
        '}',
      ],
      diffLines: [0],
    },
  ],
  medium: [
    {
      correct: [
        'function update(dt) {',
        '  player.x += player.vx * dt;',
        '  player.y += player.vy * dt;',
        '  checkCollision();',
        '  updateCamera();',
        '}',
      ],
      buggy: [
        'function update(dt) {',
        '  player.x += player.vx * dt;',
        '  player.y += player.vx * dt;',
        '  checkCollision();',
        '  updateCamera();',
        '}',
      ],
      diffLines: [2],
    },
    {
      correct: [
        'class Enemy {',
        '  update() {',
        '    this.x += this.speed;',
        '    if (this.x > 800) {',
        '      this.x = -50;',
        '    }',
        '  }',
        '}',
      ],
      buggy: [
        'class Enemy {',
        '  update() {',
        '    this.x += this.speed;',
        '    if (this.x > 800) {',
        '      this.x = 50;',
        '    }',
        '  }',
        '}',
      ],
      diffLines: [4],
    },
  ],
  hard: [
    {
      correct: [
        'function loadSave(data) {',
        '  try {',
        '    const parsed = JSON.parse(data);',
        '    player.health = parsed.health;',
        '    player.level = parsed.level;',
        '    return true;',
        '  } catch (e) {',
        '    console.error(e);',
        '    return false;',
        '  }',
        '}',
      ],
      buggy: [
        'function loadSave(data) {',
        '  try {',
        '    const parsed = JSON.parse(data);',
        '    player.health = parsed.health;',
        '    player.level = parsed.level;',
        '    return true;',
        '  } catch (e) {',
        '    console.error(e);',
        '    return true;',
        '  }',
        '}',
      ],
      diffLines: [8],
    },
    {
      correct: [
        'function checkWin() {',
        '  const alive = enemies.filter(',
        '    e => e.health > 0',
        '  );',
        '  if (alive.length === 0) {',
        '    showVictory();',
        '  }',
        '}',
      ],
      buggy: [
        'function checkWin() {',
        '  const alive = enemies.filter(',
        '    e => e.health >= 0',
        '  );',
        '  if (alive.length === 0) {',
        '    showVictory();',
        '  }',
        '}',
      ],
      diffLines: [2],
    },
  ],
};

export const CodeDiff = ({ onComplete, difficulty }: CodeDiffProps) => {
  const pairs = DIFF_PAIRS[difficulty];
  const totalDiffs = pairs.reduce((sum, pair) => sum + pair.diffLines.length, 0);

  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [foundDiffs, setFoundDiffs] = useState<number[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);

  const currentPair = pairs[currentPairIndex];

  // Timer and skip option
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip after 40 seconds or 10 wrong clicks
    if (timeElapsed >= 40 || wrongClicks >= 10) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, wrongClicks]);

  // Check if current pair is complete
  useEffect(() => {
    if (foundDiffs.length === currentPair.diffLines.length) {
      audioManager.playSFX('complete');

      // Move to next pair or complete
      setTimeout(() => {
        if (currentPairIndex < pairs.length - 1) {
          setCurrentPairIndex(prev => prev + 1);
          setFoundDiffs([]);
        } else {
          audioManager.playSFX('success');
          onComplete(false);
        }
      }, 800);
    }
  }, [foundDiffs, currentPair, currentPairIndex, pairs.length, onComplete]);

  const handleLineClick = (lineIndex: number) => {
    // Check if this line is a diff
    if (currentPair.diffLines.includes(lineIndex)) {
      if (!foundDiffs.includes(lineIndex)) {
        audioManager.playSFX('click');
        setFoundDiffs(prev => [...prev, lineIndex]);
        setTotalFound(prev => prev + 1);
      }
    } else {
      // Wrong click
      audioManager.playSFX('bug');
      setWrongClicks(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl text-white mb-2">🔍 버그 찾기: 코드 비교</h2>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>발견: {totalFound} / {totalDiffs}</span>
            <span>케이스: {currentPairIndex + 1} / {pairs.length}</span>
            <span>{timeElapsed}초 | 오류: {wrongClicks}회</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            💡 오른쪽 코드에서 버그가 있는 줄을 클릭하세요
          </div>
        </div>

        {/* Code Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Correct Code (Left) */}
          <div className="bg-green-950/30 rounded-lg border-2 border-green-700/50 p-4">
            <div className="text-xs text-green-400 mb-2 font-bold">✓ 정상 코드</div>
            <div className="font-mono text-xs space-y-1">
              {currentPair.correct.map((line, index) => (
                <div
                  key={index}
                  className="text-gray-300 leading-relaxed"
                >
                  <span className="text-gray-600 mr-2">{index + 1}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Buggy Code (Right) */}
          <div className="bg-red-950/30 rounded-lg border-2 border-red-700/50 p-4">
            <div className="text-xs text-red-400 mb-2 font-bold">✗ 버그 코드</div>
            <div className="font-mono text-xs space-y-1">
              {currentPair.buggy.map((line, index) => {
                const isDiff = currentPair.diffLines.includes(index);
                const isFound = foundDiffs.includes(index);

                return (
                  <motion.div
                    key={index}
                    onClick={() => handleLineClick(index)}
                    className={`leading-relaxed cursor-pointer transition-colors rounded px-2 py-0.5 ${
                      isFound
                        ? 'bg-yellow-500/30 text-yellow-200 border-l-4 border-yellow-400'
                        : isDiff
                        ? 'hover:bg-red-500/20 text-gray-300'
                        : 'text-gray-300 hover:bg-gray-700/30'
                    }`}
                    whileHover={!isFound ? { x: 2 } : {}}
                  >
                    <span className="text-gray-600 mr-2">{index + 1}</span>
                    {line}
                    {isFound && <span className="ml-2 text-yellow-400">← 버그!</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>진행률</span>
            <span>{Math.round((totalFound / totalDiffs) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalFound / totalDiffs) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {showSkipOption && (
            <motion.button
              onClick={handleSkip}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              나중에 수정 (품질 -{difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20})
            </motion.button>
          )}
          {!showSkipOption && (
            <div className="flex-1 text-center text-sm text-gray-400 py-3">
              차이점을 찾아보세요...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
