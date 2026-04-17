import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, X, Volume2, VolumeX, Activity, Award } from 'lucide-react';
import { useMarketStore } from '../../store/marketStore';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProgressionStore } from '../../store/progressionStore';
import { useTradingStore } from '../../store/tradingStore';
import { MOOD_DESCRIPTIONS } from '../../data/lore';

export function Header() {
  const { globalMood, dataMode } = useMarketStore();
  const { notifications, dismissNotification } = useUIStore();
  const { soundEnabled, toggleSound } = useSettingsStore();
  const { rankLabel } = useProgressionStore();
  const capital = useTradingStore((s) => s.capital);
  const mood = MOOD_DESCRIPTIONS[globalMood];

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const moodColor =
    globalMood === 'calm' ? '#7c9bb5'
    : globalMood === 'stirring' ? '#c4a46d'
    : globalMood === 'volatile' ? '#c45e3a'
    : globalMood === 'tempest' ? '#c41e3a'
    : '#7c3aed';

  return (
    <header
      className="col-span-3 flex items-center justify-between px-5"
      style={{
        borderBottom: '1px solid rgba(196,164,109,0.15)',
        background: 'rgba(5,6,8,0.95)',
      }}
    >
      {/* Left: Branding */}
      <div className="flex flex-col">
        <h1
          className="text-glow"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-exp-gold)',
            lineHeight: 1.1,
          }}
        >
          Expedition 33
        </h1>
        <p className="exp-label" style={{ marginTop: '1px' }}>
          {mood.title} · Volatility Rift Protocol
        </p>
      </div>

      {/* Center: Mood + data mode + notifications */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Mood indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
            style={{ backgroundColor: moodColor }}
          />
          <Activity size={10} style={{ color: moodColor }} />
        </div>

        {/* Data mode badge */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest"
          style={{
            background: dataMode === 'live' ? 'rgba(13,148,136,0.08)' : 'rgba(196,164,109,0.08)',
            borderColor: dataMode === 'live' ? 'rgba(13,148,136,0.3)' : 'rgba(196,164,109,0.3)',
            color: dataMode === 'live' ? 'var(--color-teal)' : 'var(--color-exp-gold)',
          }}
        >
          {dataMode === 'live' ? <Wifi size={8} /> : <WifiOff size={8} />}
          <span>{dataMode === 'live' ? 'LIVE' : dataMode === 'synthetic' ? 'SIM' : '...'}</span>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notifications.slice(0, 2).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2 py-0.5 border text-[10px] max-w-[200px]"
              style={{
                fontFamily: 'var(--font-serif)',
                background: n.type === 'success' ? 'rgba(13,148,136,0.08)'
                  : n.type === 'danger' ? 'rgba(196,30,58,0.08)'
                  : n.type === 'lore' ? 'rgba(124,58,237,0.08)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: n.type === 'success' ? 'rgba(13,148,136,0.3)'
                  : n.type === 'danger' ? 'rgba(196,30,58,0.3)'
                  : n.type === 'lore' ? 'rgba(124,58,237,0.3)'
                  : 'rgba(196,164,109,0.2)',
                color: n.type === 'success' ? 'var(--color-teal)'
                  : n.type === 'danger' ? 'var(--color-crimson)'
                  : n.type === 'lore' ? 'var(--color-violet)'
                  : 'var(--color-ivory-muted)',
              }}
            >
              <span className="truncate">{n.message}</span>
              <button onClick={() => dismissNotification(n.id)} className="shrink-0 cursor-pointer opacity-60 hover:opacity-100">
                <X size={8} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Right: Stats + controls */}
      <div className="flex items-center gap-4">
        {/* Balance */}
        <div className="flex flex-col items-end">
          <span className="exp-label">Oils</span>
          <span
            className="font-tabular text-sm"
            style={{ color: 'var(--color-exp-gold)' }}
          >
            {capital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Rank */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 border text-[9px]"
          style={{
            fontFamily: 'var(--font-serif)',
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(196,164,109,0.2)',
            color: 'var(--color-exp-gold)',
          }}
        >
          <Award size={9} />
          <span>{rankLabel}</span>
        </div>

        {/* Time */}
        <div className="text-right">
          <p
            className="font-mono text-[10px]"
            style={{ color: 'rgba(224,216,200,0.5)' }}
          >
            {currentTime.toLocaleTimeString()}
          </p>
          <p
            className="font-mono text-[8px]"
            style={{ color: 'rgba(224,216,200,0.25)' }}
          >
            Year 33, Day {Math.floor((Date.now() / 86400000) % 365)}
          </p>
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="cursor-pointer transition-opacity hover:opacity-100"
          style={{ color: 'var(--color-ivory-muted)', opacity: 0.5 }}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>
    </header>
  );
}
