import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '../../store/battleStore';

export function BattleLog() {
  const battleLog = useBattleStore((s) => s.battleLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [battleLog.length]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto space-y-0.5 pr-1"
    >
      <AnimatePresence initial={false}>
        {battleLog.slice(0, 30).map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            className="text-[10px] font-display px-2 py-0.5 rounded bg-navy/30"
            style={{ color: entry.color ?? '#a89f8f' }}
          >
            <span className="text-ivory-muted/40 mr-1.5">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {entry.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
