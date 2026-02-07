import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface BuildTestProps {
  onComplete: (skipped: boolean) => void;
  buildTime: number; // Seconds to wait (increases with day)
}

type Difficulty = 'easy' | 'medium' | 'hard';

const getDifficulty = (buildTime: number): Difficulty => {
  if (buildTime <= 10) return 'easy';
  if (buildTime <= 15) return 'medium';
  return 'hard';
};

const BUILD_STAGES = [
  '프로젝트 파일 읽는 중...',
  '의존성 검사 중...',
  '리소스 컴파일 중...',
  '코드 최적화 중...',
  '에셋 패키징 중...',
  '빌드 검증 중...',
  '최종 파일 생성 중...',
];

const BUILD_ERRORS = [
  'Warning: Unused variable "tempData"',
  'Warning: Missing texture compression',
  'Warning: Audio file bitrate too high',
  'Warning: Shader compilation slow',
  'Info: Build size: 247MB',
  'Info: Estimated load time: 8.3s',
];

export const BuildTest = ({ onComplete, buildTime }: BuildTestProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [buildAttempts, setBuildAttempts] = useState(1);
  const [hasFailed, setHasFailed] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const difficulty = getDifficulty(buildTime);
  const maxErrors = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2;

  useEffect(() => {
    if (hasFailed && !isRebuilding) return; // Paused after failure

    // Failure chance based on difficulty
    const failureChance = difficulty === 'hard' ? 0.3 : difficulty === 'medium' ? 0.2 : 0;
    const failurePoint = 60 + Math.random() * 30; // Fail between 60-90%

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Check for failure (only if we haven't exceeded max errors)
        if (!hasFailed && errorCount < maxErrors && prev >= failurePoint && Math.random() < failureChance) {
          clearInterval(progressInterval);
          setHasFailed(true);
          setErrorCount(c => c + 1);
          audioManager.playSFX('error');
          setLogs(prevLogs => [
            ...prevLogs,
            '',
            '❌ ERROR: Build failed!',
            'Error: Missing asset reference',
            'Error: Shader compilation failed',
            'Build process terminated.',
          ]);
          return prev;
        }

        if (prev >= 100) {
          clearInterval(progressInterval);
          audioManager.playSFX('success');
          setTimeout(() => onComplete(false), 500);
          return 100;
        }
        return prev + (100 / buildTime) * 0.1;
      });
    }, 100);

    // Stage updates
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < BUILD_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, (buildTime * 1000) / BUILD_STAGES.length);

    // Random log messages
    const logInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomLog = BUILD_ERRORS[Math.floor(Math.random() * BUILD_ERRORS.length)];
        setLogs(prev => [...prev, randomLog]);
      }
    }, 1500);

    // Timer for skip option
    const timerInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip option after 40% of build time
    const skipTimeout = setTimeout(() => {
      setShowSkipOption(true);
    }, buildTime * 1000 * 0.4);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(logInterval);
      clearInterval(timerInterval);
      clearTimeout(skipTimeout);
    };
  }, [buildTime, onComplete, hasFailed, isRebuilding, errorCount, maxErrors, difficulty]);

  const handleRebuild = () => {
    audioManager.playSFX('click');
    setIsRebuilding(true);
    setBuildAttempts(prev => prev + 1);
    setHasFailed(false);
    setProgress(0);
    setCurrentStage(0);
    setLogs(prev => [...prev, '', '🔄 Rebuilding...', '']);
    setTimeout(() => setIsRebuilding(false), 100);
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl font-mono">
            {hasFailed ? '❌ 빌드 실패' : '빌드 테스트 중...'}
          </h2>
          <div className="text-right text-sm text-gray-400 font-mono">
            <div>{timeElapsed}s / {buildTime}s</div>
            <div className="text-xs">시도: {buildAttempts}회</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-mono text-gray-400">
              {BUILD_STAGES[currentStage]}
            </span>
            <span className="text-sm font-mono text-cyan-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Build stages indicator */}
        <div className="mb-4 space-y-1">
          {BUILD_STAGES.map((stage, index) => (
            <div
              key={index}
              className={`text-xs font-mono flex items-center ${
                index < currentStage
                  ? 'text-green-500'
                  : index === currentStage
                  ? 'text-cyan-400'
                  : 'text-gray-600'
              }`}
            >
              <span className="mr-2">
                {index < currentStage ? '✓' : index === currentStage ? '▶' : '○'}
              </span>
              {stage}
            </div>
          ))}
        </div>

        {/* Console logs */}
        <div className="bg-black rounded p-3 mb-4 h-32 overflow-y-auto font-mono text-xs">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              className={`${
                log.startsWith('Warning') ? 'text-yellow-400' : 'text-gray-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {log}
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-600">빌드 로그가 여기에 표시됩니다...</div>
          )}
        </div>

        {/* Buttons */}
        {hasFailed ? (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleRebuild}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
            >
              🔄 다시 빌드하기
            </button>
            {showSkipOption && (
              <motion.button
                onClick={handleSkip}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                포기 (품질 -20)
              </motion.button>
            )}
          </motion.div>
        ) : showSkipOption ? (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              disabled
              className="flex-1 bg-gray-700 text-gray-500 py-3 rounded cursor-not-allowed"
            >
              대기 중...
            </button>
            <motion.button
              onClick={handleSkip}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              빌드 중단 (품질 -20)
            </motion.button>
          </motion.div>
        ) : (
          <div className="text-center text-sm text-gray-500 font-mono">
            빌드를 기다리는 중... 다른 작업을 할 수 없습니다.
          </div>
        )}
      </div>
    </motion.div>
  );
};
