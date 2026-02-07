import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface TypingGameProps {
  onComplete: (skipped?: boolean) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const CODE_SNIPPETS = {
  easy: [
    'function start() {',
    '  game.init();',
    '}',
    'const player = new Player();',
    'player.move(10, 20);',
  ],
  medium: [
    'function updateGame(deltaTime) {',
    '  player.update(deltaTime);',
    '  enemies.forEach(e => e.update());',
    '  checkCollisions();',
    '  if (player.health <= 0) gameOver();',
    '}',
    'const config = { width: 800, height: 600 };',
  ],
  hard: [
    'class Enemy extends Entity {',
    '  constructor(x, y, health) {',
    '    super(x, y);',
    '    this.health = health;',
    '    this.speed = Math.random() * 2 + 1;',
    '  }',
    '  update(deltaTime) {',
    '    const dx = player.x - this.x;',
    '    const dy = player.y - this.y;',
    '    const distance = Math.sqrt(dx*dx + dy*dy);',
    '    this.x += (dx/distance) * this.speed;',
    '    this.y += (dy/distance) * this.speed;',
    '  }',
    '}',
  ],
};

export const TypingGame = ({ onComplete, difficulty = 'easy' }: TypingGameProps) => {
  const snippets = CODE_SNIPPETS[difficulty];
  const [currentLine, setCurrentLine] = useState(0);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(true);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [errors, setErrors] = useState(0);

  const targetText = snippets[currentLine];

  // Timer and skip option
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip after time or errors
    const skipThreshold = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40;
    if (timeElapsed >= skipThreshold || errors >= 3) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, errors, difficulty]);

  useEffect(() => {
    if (input.trim() === targetText.trim()) {
      audioManager.playSFX('complete');
      setTimeout(() => {
        if (currentLine < snippets.length - 1) {
          setCurrentLine(currentLine + 1);
          setInput('');
          setIsCorrect(true);
        } else {
          audioManager.playSFX('success');
          onComplete(false);
        }
      }, 300);
    }
  }, [input, currentLine, targetText, onComplete, snippets.length]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prevLength = input.trim().length;
    const newLength = value.trim().length;

    setInput(value);
    const correct = targetText.trim().startsWith(value.trim());
    setIsCorrect(correct);

    // Count errors (when typing gets incorrectly longer)
    if (!correct && newLength > prevLength) {
      audioManager.playSFX('bug');
      setErrors(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  const difficultyLabel = {
    easy: '초급',
    medium: '중급',
    hard: '고급',
  }[difficulty];

  const penaltyAmount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 20;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-900 text-green-400 rounded-lg font-mono text-sm md:text-base overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400">💻 코드 작성</span>
            <span className="text-xs text-gray-500">({difficultyLabel})</span>
          </div>
          <div className="text-xs text-gray-400">
            <span className="mr-3">줄: {currentLine + 1}/{snippets.length}</span>
            <span className="mr-3">오류: {errors}</span>
            <span>{timeElapsed}초</span>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Already typed lines */}
          {snippets.slice(0, currentLine).map((line, i) => (
            <div key={i} className="opacity-50">
              {line}
            </div>
          ))}

          {/* Current line target */}
          <div className="my-2">
            <span className="opacity-30">{targetText}</span>
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              autoFocus
              className={`w-full bg-transparent outline-none text-base ${
                isCorrect ? 'text-green-400' : 'text-red-500'
              }`}
              style={{ fontSize: '16px' }}
              spellCheck={false}
              placeholder="// 위의 코드를 입력하세요..."
            />
            <motion.div
              className="absolute -left-2 top-0 w-1 h-6 bg-green-400"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </div>

          {/* Remaining lines */}
          {snippets.slice(currentLine + 1).map((line, i) => (
            <div key={i + currentLine + 1} className="opacity-30 mt-1">
              {line}
            </div>
          ))}
        </div>

        {/* Skip button */}
        {showSkipOption && (
          <motion.div
            className="px-4 pb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleSkip}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded transition-colors text-sm"
            >
              건너뛰기 (품질 -{penaltyAmount})
            </button>
          </motion.div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        💡 공백과 들여쓰기는 무시됩니다
      </div>
    </motion.div>
  );
};
