import { motion } from 'framer-motion';
import { Swords, Shield, TrendingUp, TrendingDown, Eye, Sparkles, Clock, Scissors, Zap, Star } from 'lucide-react';
import { Attack } from '../../types/battle';
import { useBattleStore } from '../../store/battleStore';

interface AttackButtonProps {
  attack: Attack;
  onExecute: (attackId: string, direction?: 'buy' | 'sell') => void;
}

const ATTACK_ICONS: Record<string, typeof Swords> = {
  strike_up: TrendingUp,
  strike_down: TrendingDown,
  brace: Shield,
  calibrated_strike: Swords,
  iron_resolve: Shield,
  riposte: Zap,
  crimson_lunge: Swords,
  pattern_read: Eye,
  arcane_forecast: Sparkles,
  foretell: Clock,
  harvest: Scissors,
  perfection: Star,
  eternal_strike: Swords,
};

export function AttackButton({ attack, onExecute }: AttackButtonProps) {
  const isAvailable = useBattleStore((s) => s.isAttackAvailable(attack.id));
  const cooldownEnd = useBattleStore((s) => s.cooldowns[attack.id] ?? 0);
  const now = Date.now();
  const cooldownRemaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));

  const Icon = ATTACK_ICONS[attack.id] ?? Swords;

  const needsDirection = attack.tradeAction === 'buy' && attack.id !== 'riposte';

  const colorClass = attack.type === 'unique'
    ? 'border-violet/30 hover:border-violet/50 text-violet'
    : attack.id === 'strike_up'
    ? 'border-teal/30 hover:border-teal/50 text-teal'
    : attack.id === 'strike_down'
    ? 'border-crimson/30 hover:border-crimson/50 text-crimson'
    : 'border-gold/30 hover:border-gold/50 text-gold';

  return (
    <div className="space-y-1">
      {needsDirection ? (
        <div className="flex gap-1">
          <motion.button
            whileHover={isAvailable ? { scale: 1.02 } : {}}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            onClick={() => isAvailable && onExecute(attack.id, 'buy')}
            disabled={!isAvailable}
            className={`
              flex-1 flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs
              transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
              bg-teal/5 border-teal/30 hover:border-teal/50 text-teal
            `}
          >
            <TrendingUp size={12} />
            <div className="min-w-0">
              <p className="font-display text-[11px] truncate">{attack.name} <span className="text-[9px] opacity-60">Rise</span></p>
            </div>
          </motion.button>
          <motion.button
            whileHover={isAvailable ? { scale: 1.02 } : {}}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            onClick={() => isAvailable && onExecute(attack.id, 'sell')}
            disabled={!isAvailable}
            className={`
              flex-1 flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs
              transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
              bg-crimson/5 border-crimson/30 hover:border-crimson/50 text-crimson
            `}
          >
            <TrendingDown size={12} />
            <div className="min-w-0">
              <p className="font-display text-[11px] truncate">{attack.name} <span className="text-[9px] opacity-60">Fall</span></p>
            </div>
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={isAvailable ? { scale: 1.02 } : {}}
          whileTap={isAvailable ? { scale: 0.98 } : {}}
          onClick={() => isAvailable && onExecute(attack.id)}
          disabled={!isAvailable}
          className={`
            w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs
            transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
            ${colorClass} bg-surface/30
          `}
        >
          <Icon size={14} className="shrink-0" />
          <div className="min-w-0 text-left flex-1">
            <p className="font-display text-[11px] truncate">{attack.name}</p>
            <p className="text-[9px] text-ivory-muted truncate">{attack.loreDescription}</p>
          </div>
          {attack.stakeMultiplier > 1 && (
            <span className="text-[9px] bg-surface px-1 py-0.5 rounded shrink-0">
              {attack.stakeMultiplier}x
            </span>
          )}
        </motion.button>
      )}

      {/* Cooldown indicator */}
      {cooldownRemaining > 0 && (
        <div className="text-[9px] text-ivory-muted/50 text-center">
          {cooldownRemaining}s
        </div>
      )}
    </div>
  );
}
