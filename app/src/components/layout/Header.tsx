import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Shield, Heart, X, Wifi, WifiOff } from 'lucide-react';
import { useMarketStore } from '../../store/marketStore';
import { useTradingStore } from '../../store/tradingStore';
import { useUIStore } from '../../store/uiStore';
import { MOOD_DESCRIPTIONS } from '../../data/lore';
import { getCharacter } from '../../data/characters';

export function Header() {
  const { globalMood, dataMode } = useMarketStore();
  const { capital, totalPnl, exposure, resolve, positions } = useTradingStore();
  const { selectedCharacter, notifications, dismissNotification } = useUIStore();
  const mood = MOOD_DESCRIPTIONS[globalMood];
  const character = getCharacter(selectedCharacter);

  const isProfitable = totalPnl >= 0;

  return (
    <header className="shrink-0 h-12 bg-navy/60 border-b border-ash/20 flex items-center gap-3 px-3 backdrop-blur-sm overflow-hidden">
      {/* Mood indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-2 h-2 rounded-full animate-pulse-glow shrink-0"
          style={{
            backgroundColor:
              globalMood === 'calm' ? '#7c9bb5'
              : globalMood === 'stirring' ? '#c9a959'
              : globalMood === 'volatile' ? '#c45e3a'
              : globalMood === 'tempest' ? '#c41e3a'
              : '#7c3aed',
          }}
        />
        <span className="text-[11px] font-display text-ivory-muted tracking-wider whitespace-nowrap hidden md:inline">
          {mood.title}
        </span>
      </div>

      {character && (
        <span className="text-[10px] text-ivory-muted/60 font-display whitespace-nowrap hidden lg:inline">
          as <span style={{ color: character.accentColor }}>{character.name}</span>
        </span>
      )}

      {/* Data mode badge */}
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider shrink-0 border ${
        dataMode === 'live'
          ? 'bg-teal/10 text-teal border-teal/20'
          : dataMode === 'synthetic'
          ? 'bg-gold/10 text-gold border-gold/20'
          : 'bg-surface text-ivory-muted border-ash/20'
      }`}>
        {dataMode === 'live' ? <Wifi size={9} /> : <WifiOff size={9} />}
        <span>{dataMode === 'live' ? 'LIVE' : dataMode === 'synthetic' ? 'SIM' : '...'}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Resources — wrap into a compact row */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <Wallet size={13} className="text-gold" />
          <span className="font-tabular text-[12px] text-gold">
            {capital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isProfitable ? (
            <TrendingUp size={13} className="text-emerald" />
          ) : (
            <TrendingDown size={13} className="text-crimson" />
          )}
          <span className={`font-tabular text-[12px] ${isProfitable ? 'text-emerald' : 'text-crimson'}`}>
            {isProfitable ? '+' : ''}{totalPnl.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1 hidden sm:flex">
          <Shield size={13} className={exposure > 0.7 ? 'text-crimson' : 'text-ivory-muted'} />
          <span className={`font-tabular text-[11px] ${exposure > 0.7 ? 'text-crimson' : 'text-ivory-muted'}`}>
            {(exposure * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-1 hidden sm:flex">
          <Heart size={13} className={resolve < 30 ? 'text-crimson' : 'text-teal'} />
          <span className={`font-tabular text-[11px] ${resolve < 30 ? 'text-crimson' : 'text-teal'}`}>
            {resolve.toFixed(0)}
          </span>
        </div>

        {positions.length > 0 && (
          <span className="text-[10px] text-ivory-muted bg-surface px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {positions.length} open
          </span>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.slice(0, 1).map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`
              flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-display shrink-0 max-w-[200px]
              ${n.type === 'success' ? 'bg-teal/10 text-teal border border-teal/20'
                : n.type === 'danger' ? 'bg-crimson/10 text-crimson border border-crimson/20'
                : n.type === 'lore' ? 'bg-violet/10 text-violet border border-violet/20'
                : 'bg-surface text-ivory-muted border border-ash/20'}
            `}
          >
            <span className="truncate">{n.message}</span>
            <button onClick={() => dismissNotification(n.id)} className="cursor-pointer shrink-0">
              <X size={10} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </header>
  );
}
