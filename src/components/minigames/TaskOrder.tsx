import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface TaskOrderProps {
  onComplete: (skipped: boolean) => void;
  taskCount: number; // 5, 7, or 10
}

const TASK_TEMPLATES = [
  '기획서 작성',
  '프로토타입 제작',
  '코어 시스템 구현',
  '그래픽 에셋 제작',
  '사운드 추가',
  '1차 플레이테스트',
  '피드백 반영',
  '버그 수정',
  '폴리싱',
  '최종 빌드',
  'QA 테스트',
  '마케팅 준비',
  '출시',
];

export const TaskOrder = ({ onComplete, taskCount }: TaskOrderProps) => {
  const correctOrder = TASK_TEMPLATES.slice(0, taskCount);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Shuffle tasks on mount
  useEffect(() => {
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    setCurrentOrder(shuffled);
  }, []);

  // Timer and skip option
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip after 20 seconds or 3 attempts
    if (timeElapsed >= 20 || attempts >= 3) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, attempts]);

  const handleDragStart = (task: string) => {
    setDraggedItem(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTask: string) => {
    if (!draggedItem) return;

    const draggedIndex = currentOrder.indexOf(draggedItem);
    const targetIndex = currentOrder.indexOf(targetTask);

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setCurrentOrder(newOrder);
    setDraggedItem(null);
  };

  const handleCheck = () => {
    const isCorrect = currentOrder.every((task, index) => task === correctOrder[index]);

    if (isCorrect) {
      audioManager.playSFX('success');
      onComplete(false);
    } else {
      audioManager.playSFX('error');
      setAttempts(prev => prev + 1);
      // Visual feedback: shake animation
      const container = document.getElementById('task-container');
      container?.classList.add('shake');
      setTimeout(() => container?.classList.remove('shake'), 500);
    }
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  const correctCount = currentOrder.filter((task, index) => task === correctOrder[index]).length;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`
        .shake {
          animation: shake 0.5s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-4 pb-4 border-b-2 border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-2">📋 개발 순서 정렬</h2>
          <div className="text-sm text-gray-600">
            올바른 개발 순서로 정렬하세요
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {correctCount} / {taskCount} 올바른 위치
            </span>
            <span className="text-xs text-gray-500">
              시도: {attempts}회
            </span>
          </div>
        </div>

        {/* Task List */}
        <div id="task-container" className="space-y-2 mb-4">
          {currentOrder.map((task, index) => {
            const isCorrect = task === correctOrder[index];
            return (
              <motion.div
                key={task}
                draggable
                onDragStart={() => handleDragStart(task)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(task)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all ${
                  isCorrect
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                } ${draggedItem === task ? 'opacity-50' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">☰</span>
                <span className="flex-1 text-gray-800">{task}</span>
                <span className="text-xl">{isCorrect ? '✓' : index + 1}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Help text */}
        {attempts > 0 && (
          <motion.div
            className="text-xs text-gray-500 mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            💡 드래그해서 순서를 바꾸세요
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCheck}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
          >
            확인하기
          </button>

          {showSkipOption && (
            <motion.button
              onClick={handleSkip}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded transition-colors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              건너뛰기 (품질 -15)
            </motion.button>
          )}
        </div>

        {/* Timer */}
        <div className="mt-3 text-xs text-gray-400 text-center">
          {timeElapsed}초 경과...
        </div>
      </div>
    </motion.div>
  );
};
