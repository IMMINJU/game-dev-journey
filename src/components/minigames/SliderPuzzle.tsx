import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface SliderPuzzleProps {
  onComplete: (skipped: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CODE_SNIPPETS = {
  easy: [
    'init()',
    'loadAssets()',
    'startGame()',
    'updateLoop()',
    'render()',
    'cleanup()',
    'exit()',
    '', // empty tile
  ],
  medium: [
    'setupConfig()',
    'connectDB()',
    'loadPlayer()',
    'spawnEnemies()',
    'startPhysics()',
    'enableInput()',
    'beginLoop()',
    'saveState()',
    'shutdown()',
    'disconnect()',
    '', // empty tile
  ],
  hard: [
    'parseArgs()',
    'validateConfig()',
    'initEngine()',
    'loadResources()',
    'createWorld()',
    'spawnEntities()',
    'registerEvents()',
    'startSystems()',
    'runGameLoop()',
    'handleInput()',
    'updatePhysics()',
    'renderFrame()',
    'saveProgress()',
    'cleanupMemory()',
    'exitGame()',
    '', // empty tile
  ],
};

export const SliderPuzzle = ({ onComplete, difficulty }: SliderPuzzleProps) => {
  const correctOrder = CODE_SNIPPETS[difficulty];

  const [tiles, setTiles] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Initialize shuffled puzzle
  useEffect(() => {
    const shuffled = shuffle([...correctOrder]);
    setTiles(shuffled);
  }, []);

  // Timer and skip option
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip after 30 seconds or 50 moves
    if (timeElapsed >= 30 || moves >= 50) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, moves]);

  // Check if solved
  useEffect(() => {
    if (tiles.length > 0 && isSolved()) {
      setTimeout(() => {
        audioManager.playSFX('success');
        onComplete(false);
      }, 500);
    }
  }, [tiles]);

  const shuffle = (array: string[]): string[] => {
    const arr = array.filter(t => t !== ''); // Remove empty tile
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const isSolved = (): boolean => {
    const nonEmptyCorrect = correctOrder.filter(t => t !== '');
    return tiles.every((tile, index) => tile === nonEmptyCorrect[index]);
  };

  const handleDragStart = (tile: string) => {
    setDraggedItem(tile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTile: string) => {
    if (!draggedItem) return;

    audioManager.playSFX('click');
    const draggedIndex = tiles.indexOf(draggedItem);
    const targetIndex = tiles.indexOf(targetTile);

    const newTiles = [...tiles];
    newTiles.splice(draggedIndex, 1);
    newTiles.splice(targetIndex, 0, draggedItem);

    setTiles(newTiles);
    setDraggedItem(null);
    setMoves(prev => prev + 1);
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  const correctNonEmpty = correctOrder.filter(t => t !== '');
  const correctCount = tiles.filter((tile, index) => tile === correctNonEmpty[index]).length;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl text-white mb-2">🔧 버그 수정: 실행 순서 정렬</h2>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>올바른 위치: {correctCount} / {tiles.length}</span>
            <span>이동: {moves}회 | {timeElapsed}초</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            💡 드래그해서 올바른 순서로 정렬하세요
          </div>
        </div>

        {/* Solution preview */}
        <div className="bg-gray-950 rounded p-3 mb-4">
          <div className="text-xs text-gray-500 mb-1">올바른 순서:</div>
          <div className="text-xs text-gray-400 font-mono">
            {correctNonEmpty.slice(0, 3).join(' → ')} → ...
          </div>
        </div>

        {/* Draggable List */}
        <div className="space-y-2 mb-6">
          {tiles.map((tile, index) => {
            const isCorrect = tile === correctNonEmpty[index];

            return (
              <motion.div
                key={`${tile}-${index}`}
                draggable
                onDragStart={() => handleDragStart(tile)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(tile)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-move transition-all font-mono text-sm ${
                  isCorrect
                    ? 'bg-green-900/30 border-green-500 text-green-300'
                    : 'bg-gray-700 border-gray-600 text-white hover:border-blue-400'
                } ${draggedItem === tile ? 'opacity-50' : ''}`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-gray-500 text-xl">☰</span>
                <span className="flex-1">{tile}</span>
                <span className="text-xs text-gray-400">{index + 1}</span>
                {isCorrect && <span className="text-green-400">✓</span>}
              </motion.div>
            );
          })}
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
              퍼즐을 풀어보세요...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
