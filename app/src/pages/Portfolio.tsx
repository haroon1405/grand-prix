import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Award, Shield, Heart, Trophy } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { useProgressionStore } from '../store/progressionStore';
import { PositionCard } from '../components/trading/PositionCard';
import { getAssetBySymbol } from '../data/assets';
import { getCharacter } from '../data/characters';
import { BADGE_DEFINITIONS } from '../engines/achievements';

export function Portfolio() {
  const {
    capital, startingCapital, totalPnl, exposure, resolve,
    positions, closedPositions, tradeCount, winCount, lossCount,
  } = useTradingStore();
  const { totalXp, rank, rankLabel, badges, xpHistory } = useProgressionStore();

  const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
  const capitalChange = capital - startingCapital;
  const capitalChangePercent = (capitalChange / startingCapital) * 100;

  return (
    <div className="space-y-5">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h2
          className="text-glow"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.1em', color: 'var(--color-exp-gold)', textTransform: 'uppercase' }}
        >
          The Camp
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-ivory-muted)' }}>
          Rest, regroup, reflect on the expedition's progress.
        </p>
      </motion.div>

      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(196,164,109,0.3), transparent)' }} />

      {/* Rank & XP */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="exp-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${rank.color}` }}
            >
              <Award size={16} style={{ color: rank.color }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: rank.color }}>{rankLabel}</p>
              <p style={{ fontSize: '0.6rem', color: 'var(--color-ivory-muted)' }}>Level {rank.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-exp-gold)' }}>{totalXp.toLocaleString()}</p>
            <p style={{ fontSize: '0.6rem', color: 'var(--color-ivory-muted)' }}>Total XP</p>
          </div>
        </div>

        <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${rank.progress}%`, background: rank.color, transition: 'width 0.5s' }} />
        </div>
        <div className="flex justify-between mt-1" style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'rgba(224,216,200,0.3)' }}>
          <span>{rank.currentThreshold.toLocaleString()}</span>
          <span>{rank.progress}%</span>
          <span>{rank.nextThreshold.toLocaleString()}</span>
        </div>

        {xpHistory.length > 0 && (
          <div className="mt-3 space-y-1">
            {xpHistory.slice(0, 3).map((entry, i) => (
              <div key={i} className="flex items-center justify-between" style={{ fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--color-ivory-muted)' }}>{entry.reason}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-exp-gold)' }}>+{entry.amount} XP</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={11} style={{ color: 'var(--color-exp-gold)' }} />
          <p className="exp-section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Achievements</p>
          <span style={{
            fontSize: '0.6rem', color: 'var(--color-ivory-muted)',
            background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '2px',
          }}>
            {badges.filter(b => b.tier > 0).length}/{BADGE_DEFINITIONS.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BADGE_DEFINITIONS.map(def => {
            const progress = badges.find(b => b.badgeId === def.id);
            const currentTier = progress?.tier ?? 0;
            const count = progress?.count ?? 0;
            const nextTarget = currentTier < 3 ? def.tiers[currentTier].target : def.tiers[2].target;
            const tierLabel = currentTier > 0 ? def.tiers[currentTier - 1].label : 'Locked';
            const tierColor = currentTier === 3 ? '#c4a46d' : currentTier === 2 ? '#b0b0b0' : currentTier === 1 ? '#cd7f32' : '#555';
            const pct = Math.min(100, (count / nextTarget) * 100);

            return (
              <div
                key={def.id}
                className="exp-card"
                style={{ opacity: currentTier > 0 ? 1 : 0.5 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.68rem', color: 'var(--color-ivory)' }}>{def.name}</span>
                  <span style={{ fontSize: '0.55rem', color: tierColor }}>{tierLabel}</span>
                </div>
                <p style={{ fontSize: '0.6rem', color: 'var(--color-ivory-muted)', marginBottom: '0.4rem' }}>{def.description}</p>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: tierColor, transition: 'width 0.4s' }} />
                </div>
                <p style={{ fontSize: '0.55rem', color: 'rgba(224,216,200,0.3)', marginTop: '0.2rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {count}/{nextTarget}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Capital stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <Wallet size={12} />, label: 'Capital', value: capital.toFixed(2), color: 'var(--color-exp-gold)', sub: `${capitalChangePercent >= 0 ? '+' : ''}${capitalChangePercent.toFixed(2)}% since start` },
          { icon: totalPnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />, label: 'P&L', value: `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'var(--color-teal)' : 'var(--color-crimson)', sub: '' },
          { icon: <Shield size={12} />, label: 'Exposure', value: `${(exposure * 100).toFixed(0)}%`, color: exposure > 0.7 ? 'var(--color-crimson)' : 'var(--color-ivory)', sub: '' },
          { icon: <Heart size={12} />, label: 'Resolve', value: `${resolve.toFixed(0)}/100`, color: resolve < 30 ? 'var(--color-crimson)' : 'var(--color-teal)', sub: '' },
        ].map(({ icon, label, value, color, sub }) => (
          <div key={label} className="exp-card">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color }}>{icon}</span>
              <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-ivory-muted)' }}>{label}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color }}>{value}</p>
            {sub && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(224,216,200,0.35)', marginTop: '0.2rem' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="exp-card">
        <p className="exp-section-title">Expedition Statistics</p>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Trades', value: tradeCount, color: 'var(--color-ivory)' },
            { label: 'Victories', value: winCount, color: 'var(--color-teal)' },
            { label: 'Defeats', value: lossCount, color: 'var(--color-crimson)' },
            { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: 'var(--color-exp-gold)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color }}>{value}</p>
              <p style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ivory-muted)', marginTop: '0.2rem' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open positions */}
      {positions.length > 0 && (
        <div className="space-y-2">
          <p className="exp-section-title">Active Expeditions ({positions.length})</p>
          <AnimatePresence>
            {positions.map(p => <PositionCard key={p.id} position={p} />)}
          </AnimatePresence>
        </div>
      )}

      {/* Closed positions */}
      {closedPositions.length > 0 && (
        <div className="space-y-2">
          <p className="exp-section-title" style={{ marginTop: '0.5rem' }}>Recent History</p>
          <div className="space-y-1">
            {closedPositions.slice(0, 20).map(p => {
              const asset = getAssetBySymbol(p.symbol);
              const character = getCharacter(p.characterId);
              const isProfitable = p.pnl >= 0;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,164,109,0.08)' }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '0.65rem', color: p.direction === 'STRIKE_UP' ? 'var(--color-teal)' : 'var(--color-crimson)' }}>
                      {p.direction === 'STRIKE_UP' ? 'UP' : 'DOWN'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.72rem', color: 'var(--color-ivory)' }}>
                      {asset?.gameName ?? p.symbol}
                    </span>
                    {character && (
                      <span style={{ fontSize: '0.6rem', color: character.accentColor }}>{character.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ivory-muted)' }}>
                      {p.entryPrice.toFixed(2)} → {p.currentPrice.toFixed(2)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: isProfitable ? 'var(--color-teal)' : 'var(--color-crimson)' }}>
                      {isProfitable ? '+' : ''}{p.pnl.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
