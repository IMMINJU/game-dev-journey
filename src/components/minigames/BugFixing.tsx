import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BugFixingProps {
  onComplete: (skipped: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard'; // Day에 따라 난이도 증가
}

const BUGS = {
  easy: [
    { code: 'if (player.health = 0)', correct: 'if (player.health == 0)', hint: '= vs ==' },
    { code: 'array[10]', correct: 'array[9]', hint: 'index out of bounds' },
    { code: 'for (i = 0; i <= 10; i++)', correct: 'for (i = 0; i < 10; i++)', hint: 'off by one' },
  ],
  medium: [
    { code: 'enemy.attack(player)', correct: 'enemy.attack(player);', hint: 'missing semicolon' },
    { code: 'let item = null\nitem.use()', correct: 'let item = null\nif (item) item.use()', hint: 'null reference' },
    { code: 'function update() {\n  update()\n}', correct: 'function update() {\n  // fixed recursion\n}', hint: 'infinite recursion' },
    { code: 'var speed = 10', correct: 'const speed = 10', hint: 'use const' },
    { code: 'if (x > 5 && x < 3)', correct: 'if (x > 5 || x < 3)', hint: 'logic error' },
  ],
  hard: [
    { code: 'async load() { data.parse() }', correct: 'async load() { await data.parse() }', hint: 'missing await' },
    { code: 'array.map(x => x * 2)\nreturn array', correct: 'return array.map(x => x * 2)', hint: 'map returns new array' },
    { code: 'setInterval(update, 16)', correct: 'setInterval(update, 16); // memory leak risk', hint: 'cleanup needed' },
    { code: 'player.x += velocity', correct: 'player.x += velocity * deltaTime', hint: 'frame independent' },
    { code: 'if (score = 100)', correct: 'if (score === 100)', hint: 'assignment vs comparison' },
    { code: 'let pos = player.pos\npos.x = 10', correct: 'let pos = {...player.pos}\npos.x = 10', hint: 'shallow copy' },
  ],
};

export const BugFixing = ({ onComplete, difficulty }: BugFixingProps) => {
  const bugs = BUGS[difficulty];
  const totalBugs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 6;

  const [currentBug, setCurrentBug] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const bug = bugs[currentBug % bugs.length];

  // Show skip option after some time (longer for easy, shorter for hard)
  useEffect(() => {
    const skipThreshold = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 10;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    if (timeElapsed >= skipThreshold && difficulty !== 'easy') {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, difficulty]);

  const handleSubmit = () => {
    if (input.trim() === bug.correct.trim()) {
      if (currentBug + 1 >= totalBugs) {
        onComplete(false); // Completed without skip
      } else {
        setCurrentBug(currentBug + 1);
        setInput('');
        setShowHint(false);
        setTimeElapsed(0);
        setShowSkipOption(false);
      }
    }
  };

  const handleSkip = () => {
    onComplete(true); // Skipped
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl">버그 수정 중...</h2>
          <span className="text-sm text-gray-400">
            {currentBug + 1} / {totalBugs}
          </span>
        </div>

        {/* Bug Code */}
        <div className="bg-red-900/20 border-2 border-red-500 p-4 rounded mb-4 font-mono text-sm">
          <div className="text-red-400 mb-2">❌ ERROR:</div>
          <pre className="text-red-300">{bug.code}</pre>
        </div>

        {/* Hint Button */}
        {!showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="text-xs text-gray-400 hover:text-gray-200 mb-2"
          >
            💡 힌트 보기
          </button>
        )}

        {/* Hint */}
        {showHint && (
          <motion.div
            className="bg-yellow-900/20 border border-yellow-600 p-2 rounded mb-4 text-sm text-yellow-300"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            💡 {bug.hint}
          </motion.div>
        )}

        {/* Input */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-2">수정된 코드를 입력하세요:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-800 text-green-400 p-3 rounded font-mono text-sm border border-gray-700 focus:border-green-500 outline-none min-h-[80px]"
            placeholder="// 수정된 코드..."
            autoFocus
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded transition-colors"
          >
            수정 완료
          </button>

          {/* Skip option appears after waiting */}
          {showSkipOption && (
            <motion.button
              onClick={handleSkip}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              나중에 수정 (품질 -10)
            </motion.button>
          )}
        </div>

        {/* Timer indicator */}
        {difficulty !== 'easy' && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            {timeElapsed}초 경과...
          </div>
        )}
      </div>
    </motion.div>
  );
};
