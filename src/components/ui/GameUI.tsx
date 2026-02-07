import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ProgressBar } from './ProgressBar';

export const GameUI = () => {
  const stats = useGameStore((state) => state.stats);
  const currentDay = useGameStore((state) => state.currentDay);
  const visualDegradation = useGameStore((state) => state.visualDegradation);

  // UI becomes MORE prominent as degradation increases (inverse of background)
  const uiOpacity = Math.min(1, 0.5 + visualDegradation * 0.006); // 50% to 100%
  const uiScale = Math.min(1.2, 1 + visualDegradation * 0.002); // 1.0 to 1.2 scale

  // UI visibility based on degradation
  const showProgressBars = currentDay > 3;
  const showBugCount = currentDay > 6;
  const showDeadline = currentDay > 10;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-2 right-2 md:top-4 md:right-4 w-auto md:w-80 space-y-2 md:space-y-3 pointer-events-none z-20"
        initial={{ opacity: 0, x: 50 }}
        animate={{
          opacity: uiOpacity,
          x: 0,
          scale: uiScale,
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Day counter - always visible */}
        <div className="bg-[#2a2a3e]/90 border-2 border-[#5fcde4] p-2 md:p-4 shadow-lg">
          <div className="text-sm md:text-xl font-pixel text-[#5fcde4]">DAY {currentDay}</div>
          <div className="text-xs md:text-sm text-[#8b6eca] font-pixel">OF 30</div>
        </div>

        {/* Progress bars - appear after Day 3 */}
        {showProgressBars && (
          <motion.div
            className="bg-[#2a2a3e]/90 border-2 border-[#8b6eca] p-2 md:p-4 shadow-lg space-y-2 md:space-y-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProgressBar label="PROG" value={stats.progress} icon=">" />
            <ProgressBar label="QUAL" value={stats.quality} icon="*" />
            <ProgressBar label="ENRG" value={stats.energy} icon="+" />
          </motion.div>
        )}

        {/* Bug count - appears after Day 6 */}
        {showBugCount && (
          <motion.div
            className="bg-[#2a2a3e]/90 border-2 border-[#ff6b9d] p-2 md:p-4 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-pixel text-[#ff6b9d]">X BUGS</span>
              <span className="text-sm md:text-xl font-pixel text-[#ff6b9d]">
                {stats.bugCount}
              </span>
            </div>
          </motion.div>
        )}

        {/* Deadline - appears after Day 10 */}
        {showDeadline && (
          <motion.div
            className="bg-[#2a2a3e]/90 border-2 border-[#feca57] p-2 md:p-4 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-pixel text-[#feca57]">! LEFT</span>
              <span className="text-sm md:text-xl font-pixel text-[#feca57]">
                {30 - currentDay}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
