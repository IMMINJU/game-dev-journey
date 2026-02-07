import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

interface QAChecklistProps {
  onComplete: (skipped: boolean) => void;
  itemCount: number; // Day에 따라 체크 항목 증가 (10 -> 20 -> 30)
}

const QA_ITEMS = [
  '캐릭터 이동 테스트',
  '전투 시스템 작동 확인',
  '인벤토리 아이템 사용',
  'UI 버튼 반응 확인',
  '사운드 이펙트 재생',
  '배경 음악 루프',
  '세이브 기능 테스트',
  '로드 기능 테스트',
  '메뉴 화면 전환',
  '옵션 설정 저장',
  '해상도 변경 테스트',
  '풀스크린 모드 확인',
  '키보드 입력 반응',
  '마우스 클릭 인식',
  '게임패드 연결 확인',
  'NPC 대화 시스템',
  '퀘스트 진행 확인',
  '적 AI 동작 테스트',
  '아이템 드롭 확인',
  '경험치 획득 계산',
  '레벨업 시스템',
  '스킬 트리 작동',
  '장비 착용 확인',
  '상점 구매/판매',
  '미니맵 표시',
  '퀘스트 마커 위치',
  '튜토리얼 진행',
  '업적 시스템',
  '통계 기록 확인',
  '크레딧 화면 표시',
];

export const QAChecklist = ({ onComplete, itemCount }: QAChecklistProps) => {
  const items = QA_ITEMS.slice(0, itemCount);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [checkingIndex, setCheckingIndex] = useState<number | null>(null);

  // Show skip option after checking some items or waiting
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show skip after 15 seconds or after checking 30% of items
    if (timeElapsed >= 15 || checkedItems.size >= Math.floor(itemCount * 0.3)) {
      setShowSkipOption(true);
    }

    return () => clearInterval(timer);
  }, [timeElapsed, checkedItems.size, itemCount]);

  const handleCheck = (index: number) => {
    if (isChecking) return; // Prevent clicking during loading

    const isCurrentlyChecked = checkedItems.has(index);

    // If unchecking, do it immediately
    if (isCurrentlyChecked) {
      audioManager.playSFX('click');
      const newChecked = new Set(checkedItems);
      newChecked.delete(index);
      setCheckedItems(newChecked);
      return;
    }

    // If checking, add loading delay
    audioManager.playSFX('click');
    setIsChecking(true);
    setCheckingIndex(index);

    // Longer delay for more items (more tedious in late game)
    const delay = itemCount >= 20 ? 1500 : itemCount >= 15 ? 1000 : 800;

    setTimeout(() => {
      audioManager.playSFX('complete');
      const newChecked = new Set(checkedItems);
      newChecked.add(index);
      setCheckedItems(newChecked);
      setIsChecking(false);
      setCheckingIndex(null);

      // Complete if all checked
      if (newChecked.size === items.length) {
        setTimeout(() => {
          audioManager.playSFX('success');
          onComplete(false);
        }, 300);
      }
    }, delay);
  };

  const handleSkip = () => {
    audioManager.playSFX('warning');
    onComplete(true);
  };

  const progress = (checkedItems.size / items.length) * 100;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-4 pb-4 border-b-2 border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-2">QA 체크리스트</h2>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{checkedItems.size} / {items.length} 완료</span>
            <span>{Math.round(progress)}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Checklist - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
          {items.map((item, index) => {
            const isThisChecking = checkingIndex === index;
            const isChecked = checkedItems.has(index);

            return (
              <motion.label
                key={index}
                className={`flex items-center p-3 rounded transition-colors relative ${
                  isChecked
                    ? 'bg-green-50 border-2 border-green-500'
                    : isThisChecking
                    ? 'bg-yellow-50 border-2 border-yellow-400'
                    : 'bg-gray-50 border-2 border-gray-300 hover:bg-gray-100'
                } ${isChecking && !isChecked ? 'cursor-wait' : 'cursor-pointer'}`}
                whileHover={!isChecking ? { scale: 1.01 } : {}}
                whileTap={!isChecking ? { scale: 0.99 } : {}}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheck(index)}
                  disabled={isChecking && !isChecked}
                  className={`w-5 h-5 mr-3 ${isChecking && !isChecked ? 'cursor-wait' : 'cursor-pointer'}`}
                />
                <span
                  className={`text-sm flex-1 ${
                    isChecked ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {item}
                </span>
                {isThisChecking && (
                  <motion.span
                    className="text-yellow-600 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    테스트 중...
                  </motion.span>
                )}
              </motion.label>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
          <button
            disabled={checkedItems.size < items.length}
            className={`flex-1 py-3 rounded transition-colors ${
              checkedItems.size === items.length
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            테스트 완료
          </button>

          {/* Skip option */}
          {showSkipOption && (
            <motion.button
              onClick={handleSkip}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded transition-colors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              대충 확인함 (품질 -15)
            </motion.button>
          )}
        </div>

        {/* Timer */}
        <div className="mt-3 text-xs text-gray-400 text-center">
          {timeElapsed}초 소요 중... {checkedItems.size === 0 && '(체크를 시작하세요)'}
        </div>
      </div>
    </motion.div>
  );
};
