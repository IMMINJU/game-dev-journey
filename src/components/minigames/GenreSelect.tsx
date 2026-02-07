import { motion } from 'framer-motion';

interface GenreSelectProps {
  onSelect: (genre: string) => void;
}

const GENRES = [
  {
    id: 'fantasy',
    title: '판타지',
    description: '검과 마법의 세계',
    emoji: '⚔️',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'cyberpunk',
    title: '사이버펑크',
    description: '네온과 AI의 미래',
    emoji: '🌃',
    color: 'from-cyan-400 to-blue-400',
  },
  {
    id: 'postapoc',
    title: '포스트 아포칼립스',
    description: '폐허 속의 희망',
    emoji: '🌲',
    color: 'from-green-400 to-teal-400',
  },
];

export const GenreSelect = ({ onSelect }: GenreSelectProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.h2
        className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        어떤 세계를 만들까요?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {GENRES.map((genre, index) => (
          <motion.button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={`relative overflow-hidden rounded-xl p-4 md:p-8 text-white min-h-[120px] md:min-h-[200px] flex flex-col items-center justify-center text-center group`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.2, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-90 group-hover:opacity-100 transition-opacity`} />

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                className="text-4xl md:text-7xl mb-2 md:mb-4"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {genre.emoji}
              </motion.div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{genre.title}</h3>
              <p className="text-xs md:text-base opacity-90">{genre.description}</p>
            </div>

            {/* Hover effect */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.1 }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
