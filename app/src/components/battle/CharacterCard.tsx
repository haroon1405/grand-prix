import { motion } from 'framer-motion';
import { getCharacter } from '../../data/characters';

interface CharacterCardProps {
  characterId: string;
  isActive: boolean;
  onClick: () => void;
}

export function CharacterCard({ characterId, isActive, onClick }: CharacterCardProps) {
  const char = getCharacter(characterId);
  if (!char) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        w-full p-2.5 rounded-lg border text-left cursor-pointer transition-all
        ${isActive
          ? 'border-gold/50 bg-gold/10 glow-gold'
          : 'border-ash/20 bg-navy/40 hover:border-ash-light/40'}
      `}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm mb-1.5 mx-auto"
        style={{
          backgroundColor: char.color + '30',
          color: char.accentColor,
          borderColor: isActive ? char.accentColor : 'transparent',
          borderWidth: 2,
          borderStyle: 'solid',
        }}
      >
        {char.name[0]}
      </div>

      {/* Name */}
      <p className="font-display text-xs text-center truncate" style={{ color: isActive ? char.accentColor : '#f0e6d3' }}>
        {char.name}
      </p>
      <p className="text-[9px] text-ivory-muted text-center truncate">{char.title}</p>
    </motion.button>
  );
}
