import { motion } from 'framer-motion';
import {
  Map,
  Swords,
  Tent,
  BookOpen,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { CharacterAvatar } from '../ui/CharacterAvatar';
import { CHARACTERS } from '../../data/characters';

type Page = 'continent' | 'expedition' | 'camp' | 'bestiary' | 'chronicles';

const NAV_ITEMS: { id: Page; label: string; gameName: string; icon: typeof Map }[] = [
  { id: 'continent', label: 'Dashboard', gameName: 'The Continent', icon: Map },
  { id: 'expedition', label: 'Trade', gameName: 'The Expedition', icon: Swords },
  { id: 'camp', label: 'Portfolio', gameName: 'The Camp', icon: Tent },
  { id: 'bestiary', label: 'Assets', gameName: 'The Bestiary', icon: BookOpen },
  { id: 'chronicles', label: 'History', gameName: 'The Chronicles', icon: ScrollText },
];

export function Sidebar() {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar, selectedCharacter, setCharacter } = useUIStore();

  return (
    <motion.aside
      className="h-full bg-navy/80 border-r border-ash/20 flex flex-col overflow-hidden"
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-ash/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="text-gold font-display font-bold text-sm">33</span>
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="font-display text-gold text-sm font-semibold leading-tight">
                Expedition 33
              </h1>
              <p className="text-ivory-muted text-[10px]">The Last Market</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ id, gameName, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <motion.button
              key={id}
              onClick={() => setPage(id)}
              whileHover={{ x: 2 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 cursor-pointer text-left
                ${isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-ivory-muted hover:text-ivory hover:bg-surface/50 border border-transparent'
                }
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-display text-sm tracking-wide">{gameName}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Character selector */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-ash/20">
          <p className="text-ivory-muted text-[10px] uppercase tracking-widest font-display mb-2">
            Expeditioner
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CHARACTERS.map(c => (
              <CharacterAvatar
                key={c.id}
                characterId={c.id}
                size="sm"
                selected={selectedCharacter === c.id}
                onClick={() => setCharacter(c.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="p-3 border-t border-ash/20 text-ivory-muted hover:text-gold transition-colors cursor-pointer"
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
