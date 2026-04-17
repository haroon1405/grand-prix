import { motion } from 'framer-motion';
import { getCharacter } from '../../data/characters';

interface CharacterAvatarProps {
  characterId: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function CharacterAvatar({ characterId, size = 'md', selected = false, onClick }: CharacterAvatarProps) {
  const character = getCharacter(characterId);
  if (!character) return null;

  const initial = character.name[0].toUpperCase();

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${sizeMap[size]}
        rounded-full flex items-center justify-center font-display font-bold
        cursor-pointer transition-all duration-200 border-2
        ${selected ? 'border-gold shadow-[0_0_12px_rgba(201,169,89,0.3)]' : 'border-ash/40 hover:border-ash-light'}
      `}
      style={{
        backgroundColor: character.color + '30',
        color: character.accentColor,
        borderColor: selected ? character.accentColor : undefined,
      }}
      title={`${character.name} — ${character.title}`}
    >
      {initial}
    </motion.div>
  );
}
