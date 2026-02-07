import { useState } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '../../utils/audio';

export const AudioControl = () => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (isMuted) {
      audioManager.unmuteAll();
    } else {
      audioManager.muteAll();
    }
    setIsMuted(!isMuted);
  };

  return (
    <motion.button
      onClick={toggleMute}
      className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95 z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      whileHover={{ y: -2 }}
    >
      <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
    </motion.button>
  );
};
