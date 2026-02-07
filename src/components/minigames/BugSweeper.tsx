import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface BugSweeperProps {
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

export const BugSweeper = ({ onComplete, difficulty }: BugSweeperProps) => {
  const config = GRID_CONFIG[difficulty];
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [bugsFound, setBugsFound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Initialize grid
  useEffect(() => {
    const newGrid = initializeGrid();
    setGrid(newGrid);
  }, []);

  // Timer and skip option
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip after 60 seconds
    if (timeElapsed >= 60) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, gameOver]);

  // Check win condition
  useEffect(() => {
    if (bugsFound === config.bugs && grid.length > 0) {
      setTimeout(() => {
        audioManager.playSFX('success');
        onComplete(false);
      }, 500);
    }
  }, [bugsFound, config.bugs, grid.length, onComplete]);

  const initializeGrid = (): Cell[][] => {
    // Create empty grid
    const newGrid: Cell[][] = [];
    for (let r = 0; r < config.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < config.cols; c++) {
        row.push({
          hasBug: false,
          isRevealed: false,
          isFlagged: false,
          nearbyBugs: 0,
        });
      }
      newGrid.push(row);
    }

    // Place bugs randomly
    let bugsPlaced = 0;
    while (bugsPlaced < config.bugs) {
      const r = Math.floor(Math.random() * config.rows);
      const c = Math.floor(Math.random() * config.cols);
      if (!newGrid[r][c].hasBug) {
        newGrid[r][c].hasBug = true;
        bugsPlaced++;
      }
    }

    // Calculate nearby bugs count
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!newGrid[r][c].hasBug) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (
                nr >= 0 &&
                nr < config.rows &&
                nc >= 0 &&
                nc < config.cols &&
                newGrid[nr][nc].hasBug
              ) {
                count++;
              }
            }
          }
          newGrid[r][c].nearbyBugs = count;
        }
      }
    }

    return newGrid;
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    const newGrid = [...grid.map(r => [...r])];

    if (newGrid[row][col].hasBug) {
      // Hit a bug - game over
      audioManager.playSFX('error');
      newGrid[row][col].isRevealed = true;
      setGrid(newGrid);
      setGameOver(true);

      // Show all bugs
      setTimeout(() => {
        const allRevealed = newGrid.map(r =>
          r.map(cell => (cell.hasBug ? { ...cell, isRevealed: true } : cell))
        );
        setGrid(allRevealed);
      }, 500);
    } else {
      // Safe cell
      audioManager.playSFX('click');
      revealSafeCells(newGrid, row, col);
      setGrid(newGrid);
    }
  };

  const revealSafeCells = (grid: Cell[][], row: number, col: number) => {
    if (
      row < 0 ||
      row >= config.rows ||
      col < 0 ||
      col >= config.cols ||
      grid[row][col].isRevealed ||
      grid[row][col].hasBug ||
      grid[row][col].isFlagged
    ) {
      return;
    }

    grid[row][col].isRevealed = true;

    // If no nearby bugs, reveal neighbors
    if (grid[row][col].nearbyBugs === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealSafeCells(grid, row + dr, col + dc);
        }
      }
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || grid[row][col].isRevealed) return;

    const newGrid = [...grid.map(r => [...r])];
    const wasFlagged = newGrid[row][col].isFlagged;
    newGrid[row][col].isFlagged = !wasFlagged;

    audioManager.playSFX('click');

    // Update bugs found count
    if (!wasFlagged && newGrid[row][col].hasBug) {
      setBugsFound(prev => prev + 1);
    } else if (wasFlagged && newGrid[row][col].hasBug) {
      setBugsFound(prev => prev - 1);
    }

    setGrid(newGrid);
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  const cellSize = difficulty === 'easy' ? 'w-12 h-12' : difficulty === 'medium' ? 'w-10 h-10' : 'w-8 h-8';
  const fontSize = difficulty === 'easy' ? 'text-base' : difficulty === 'medium' ? 'text-sm' : 'text-xs';

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl text-white mb-2">💣 버그 찾기: 지뢰찾기</h2>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>발견: {bugsFound} / {config.bugs}</span>
            <span>{timeElapsed}초</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            💡 좌클릭: 열기 | 우클릭: 깃발 표시 (버그 위치 마킹)
          </div>
          {gameOver && (
            <div className="text-red-400 text-sm mt-2 font-bold">
              💥 버그를 밟았습니다! 처음부터 다시...
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex justify-center mb-6">
          <div
            className="grid gap-1 bg-gray-950 p-2 rounded"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isRevealed = cell.isRevealed;
                const isFlagged = cell.isFlagged;
                const hasBug = cell.hasBug;
                const nearbyBugs = cell.nearbyBugs;

                return (
                  <motion.button
                    key={`${r}-${c}`}
                    onClick={() => revealCell(r, c)}
                    onContextMenu={(e) => toggleFlag(r, c, e)}
                    disabled={gameOver && !hasBug}
                    className={`${cellSize} ${fontSize} font-bold flex items-center justify-center rounded transition-all ${
                      isRevealed
                        ? hasBug
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                        : isFlagged
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-700'
                    } ${gameOver && hasBug && !isRevealed ? 'bg-red-500/50' : ''}`}
                    whileHover={!isRevealed && !gameOver ? { scale: 1.05 } : {}}
                    whileTap={!isRevealed && !gameOver ? { scale: 0.95 } : {}}
                  >
                    {isRevealed ? (
                      hasBug ? (
                        '🐛'
                      ) : nearbyBugs > 0 ? (
                        <span className={`${
                          nearbyBugs === 1 ? 'text-blue-400' :
                          nearbyBugs === 2 ? 'text-green-400' :
                          nearbyBugs === 3 ? 'text-red-400' :
                          nearbyBugs >= 4 ? 'text-purple-400' : ''
                        }`}>
                          {nearbyBugs}
                        </span>
                      ) : (
                        ''
                      )
                    ) : isFlagged ? (
                      '🚩'
                    ) : (
                      ''
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Reset button if game over */}
        {gameOver && (
          <motion.button
            onClick={() => {
              const newGrid = initializeGrid();
              setGrid(newGrid);
              setGameOver(false);
              setBugsFound(0);
              setTimeElapsed(0);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🔄 다시 시작
          </motion.button>
        )}

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
          {!showSkipOption && !gameOver && (
            <div className="flex-1 text-center text-sm text-gray-400 py-3">
              모든 버그를 찾으세요...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
