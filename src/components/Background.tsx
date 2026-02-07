import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const Background = () => {
  const currentDay = useGameStore((state) => state.currentDay);
  const visualDegradation = useGameStore((state) => state.visualDegradation);

  // Layer-based degradation: Background fades, UI takes over
  // 0-10%: Beautiful background (Day 1-5)
  // 10-70%: Background fading (Day 6-20)
  // 70-100%: Almost gone (Day 21-30)

  const backgroundLayer = {
    opacity: Math.max(0.1, 1 - visualDegradation * 0.01),
    blur: visualDegradation * 0.4,
    saturation: Math.max(10, 100 - visualDegradation * 1.2),
    brightness: Math.max(40, 100 - visualDegradation * 0.5),
  };

  const getBackgroundColor = () => {
    if (currentDay <= 5) {
      return '#5fcde4'; // Cyan - Dream phase
    } else if (currentDay <= 20) {
      return '#8b6eca'; // Purple - Reality phase
    } else {
      return '#3e3e5e'; // Dark - Burnout phase
    }
  };

  // Show rich illustrations in early game
  const showIllustrations = visualDegradation < 30;
  const showDecorations = visualDegradation < 20;

  return (
    <>
      {/* Main background layer */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: getBackgroundColor(),
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.03) 2px,
              rgba(0, 0, 0, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.03) 2px,
              rgba(0, 0, 0, 0.03) 4px
            )
          `,
        }}
        animate={{
          opacity: backgroundLayer.opacity,
          filter: `blur(${backgroundLayer.blur}px) saturate(${backgroundLayer.saturation}%) brightness(${backgroundLayer.brightness}%)`,
        }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
        }}
      />

      {/* Illustration layer - Day 1-5 only */}
      {showIllustrations && (
        <motion.div
          className="absolute inset-0 -z-9 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: Math.max(0, 1 - visualDegradation * 0.033),
            scale: 1,
          }}
          transition={{ duration: 1.2 }}
        >
          {/* Placeholder illustration - will be replaced with actual art */}
          <div className="relative w-full h-full max-w-md max-h-md flex items-center justify-center">
            {/* Main illustration placeholder */}
            <div className="absolute inset-0 m-auto w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border-4 border-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl md:text-8xl mb-4">🎮</div>
                <div className="text-white/60 font-pixel text-xs md:text-sm">
                  {currentDay <= 5 ? '꿈꾸는 시간' : currentDay <= 20 ? '현실의 시간' : '마감의 시간'}
                </div>
              </div>
            </div>

            {/* Floating particles */}
            <motion.div
              className="absolute top-[20%] left-[20%] w-24 h-24 bg-cyan-400/40 rounded-full blur-md border-2 border-cyan-300/30"
              animate={{
                y: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-[20%] right-[20%] w-28 h-28 bg-purple-400/40 rounded-full blur-md border-2 border-purple-300/30"
              animate={{
                y: [0, 30, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
            <motion.div
              className="absolute top-[50%] right-[15%] w-20 h-20 bg-pink-400/40 rounded-full blur-md border-2 border-pink-300/30"
              animate={{
                x: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Decorative elements - fade out early */}
      {showDecorations && (
        <motion.div
          className="absolute inset-0 -z-5 pointer-events-none overflow-hidden"
          animate={{
            opacity: Math.max(0, 1 - visualDegradation * 0.05),
          }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-[10%] left-[10%] text-4xl opacity-30">⭐</div>
          <div className="absolute top-[20%] right-[15%] text-5xl opacity-25">💭</div>
          <div className="absolute bottom-[25%] left-[15%] text-4xl opacity-20">✨</div>
          <div className="absolute bottom-[15%] right-[20%] text-5xl opacity-30">🎮</div>
          <div className="absolute top-[40%] left-[5%] text-3xl opacity-20">💡</div>
          <div className="absolute top-[60%] right-[10%] text-4xl opacity-25">🎨</div>
        </motion.div>
      )}
    </>
  );
};
