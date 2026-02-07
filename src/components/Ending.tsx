import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { EndingType } from '../types/game';

interface EndingContent {
  title: string;
  description: string;
  review?: string;
  reflection: string;
}

const ENDINGS: Record<EndingType, EndingContent> = {
  compromise: {
    title: '타협의 출시',
    description: `게임이 출시되었습니다.

처음 기획했던 것의 30%만 구현되었습니다.
버그가 조금 있습니다.
하지만... 작동은 합니다.`,
    review: '"괜찮은 인디게임" ⭐⭐⭐\n"아쉬운 부분이 많지만 가능성은 보임"',
    reflection: `출시했다.
하지만 이게... 내가 꿈꿨던 건 아니야.

...다음엔 더 잘 만들 수 있겠지?`,
  },
  perfectionism: {
    title: '완벽주의의 끝',
    description: `Day 30 → Day 40 → Day 60...

계속 연기합니다.
"버그 수정..."
"한 번만 더..."
"이제 거의..."`,
    reflection: `당신은 지쳤습니다.

게임은 여전히 미완성입니다.
완벽을 추구하다가... 아무것도 완성하지 못했습니다.`,
  },
  abandon: {
    title: '중도 포기',
    description: `당신은 책상을 정리합니다.

미완성의 기획서,
작성 중이던 코드,
그려지다 만 스케치.

모두 서랍 속으로.`,
    reflection: `...언젠가 다시 꺼내볼까요?

새로운 꿈을 꿀 수 있을까요?`,
  },
  miracle: {
    title: '기적적 완성',
    description: `드디어... 완성되었습니다!

처음 상상했던 그대로.
모든 기능이 작동합니다.
버그도 거의 없습니다.`,
    review: '"걸작" ⭐⭐⭐⭐⭐\n"올해 최고의 인디 게임"\n"감동적이고 완벽한 게임 디자인"',
    reflection: `완성했습니다.

하지만... 당신은 완전히 지쳤습니다.
다시는 게임을 만들고 싶지 않네요.

...적어도 당분간은.`,
  },
};

interface EndingProps {
  ending: EndingType;
}

export const Ending = ({ ending }: EndingProps) => {
  const resetGame = useGameStore((state) => state.resetGame);
  const content = ENDINGS[ending];

  return (
    <div className="flex items-start justify-center h-full w-full p-4 md:p-8 overflow-y-auto">
      <motion.div
        className="max-w-xl w-full text-center my-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {content.title}
        </motion.h1>

        {/* Description */}
        <motion.div
          className="text-lg md:text-xl mb-8 whitespace-pre-line leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {content.description}
        </motion.div>

        {/* Review (if exists) */}
        {content.review && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg mb-8 italic text-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
          >
            {content.review}
          </motion.div>
        )}

        {/* Reflection */}
        <motion.div
          className="text-base md:text-lg mb-12 whitespace-pre-line leading-relaxed text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {content.reflection}
        </motion.div>

        {/* Comparison (for compromise ending) */}
        {ending === 'compromise' && (
          <motion.div
            className="grid grid-cols-2 gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm font-bold mb-2">처음 기획</div>
              <div className="text-xs space-y-1">
                <div>✓ 오픈월드</div>
                <div>✓ 멀티플레이어</div>
                <div>✓ 크래프팅</div>
                <div>✓ 풀 3D</div>
                <div>✓ 50+ 시간 플레이</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm font-bold mb-2">실제 출시</div>
              <div className="text-xs space-y-1">
                <div>✗ 리니어</div>
                <div>✗ 싱글플레이어</div>
                <div>✗ 크래프팅 삭제</div>
                <div>✗ 2D</div>
                <div>✓ 10 시간 플레이</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reset button */}
        <motion.button
          onClick={resetGame}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105 active:scale-95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          whileHover={{ y: -4 }}
        >
          다시 시작
        </motion.button>
      </motion.div>
    </div>
  );
};
