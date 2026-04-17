import { motion } from 'framer-motion';
import { useBattleStore } from '../../store/battleStore';

export function PaintressBar() {
  const { paintressHP, paintressMaxHP, phase } = useBattleStore();
  const percent = (paintressHP / paintressMaxHP) * 100;

  const barColor = percent > 60 ? '#7c3aed' : percent > 30 ? '#c45e3a' : '#c41e3a';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs text-violet tracking-wider">The Paintress</span>
        <span className="font-tabular text-xs text-ivory">
          {Math.round(paintressHP)} / {paintressMaxHP}
        </span>
      </div>
      <div className="h-3 bg-navy rounded-full overflow-hidden border border-ash/20">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: barColor }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-ink-flow" />
        </motion.div>
      </div>
      {phase === 'paintress_attack' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-violet text-center font-display italic animate-pulse-glow"
        >
          The Paintress strikes...
        </motion.p>
      )}
    </div>
  );
}
