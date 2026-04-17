import { motion } from 'framer-motion';
import { ScrollText, TrendingUp, TrendingDown, GitBranch, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { useBattleStore } from '../store/battleStore';
import { getAssetBySymbol } from '../data/assets';
import { getCharacter } from '../data/characters';
import { computeBranchedTimelines } from '../engines/branchedTimeline';

export function Chronicles() {
  const { closedPositions: tradingClosed, tradeCount, winCount, lossCount, totalPnl } = useTradingStore();
  const battleClosed = useBattleStore((s) => s.closedPositions);

  const allClosed = [...battleClosed, ...tradingClosed];
  const totalCount = tradeCount + battleClosed.length;
  const timelines = computeBranchedTimelines(battleClosed);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h2
          className="text-glow"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.1em', color: 'var(--color-exp-gold)', textTransform: 'uppercase' }}
        >
          The Chronicles
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-ivory-muted)' }}>
          Every encounter, every decision, every scar left upon the ledger.
        </p>
      </motion.div>

      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(196,164,109,0.3), transparent)' }} />

      {/* Summary */}
      <div className="flex items-center justify-center gap-6" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-serif)' }}>
        <span style={{ color: 'var(--color-ivory-muted)' }}>{totalCount} engagements</span>
        <span style={{ color: 'var(--color-teal)' }}>{winCount} victories</span>
        <span style={{ color: 'var(--color-crimson)' }}>{lossCount} defeats</span>
        <span style={{ color: totalPnl >= 0 ? 'var(--color-exp-gold)' : 'var(--color-crimson)' }}>
          Net: {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
        </span>
      </div>

      {/* Branched Timelines */}
      {timelines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <GitBranch size={11} style={{ color: 'var(--color-violet)' }} />
            <p className="exp-section-title" style={{ marginBottom: 0, borderBottom: 'none', color: 'var(--color-violet)' }}>Branched Timelines</p>
            <span style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.4rem' }}>
              What-If Analysis
            </span>
          </div>
          <p style={{ fontSize: '0.6rem', color: 'rgba(224,216,200,0.3)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
            Counterfactual outcomes — what would have happened if you traded differently?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {timelines.map(branch => {
              const SentimentIcon = branch.sentiment === 'better' ? ArrowUpRight
                : branch.sentiment === 'worse' ? ArrowDownRight
                : Minus;
              const sentimentColor = branch.sentiment === 'better' ? 'var(--color-teal)'
                : branch.sentiment === 'worse' ? 'var(--color-crimson)'
                : '#555';

              return (
                <motion.div
                  key={branch.id}
                  whileHover={{ y: -1 }}
                  className="exp-card"
                  style={{ borderLeft: `2px solid ${sentimentColor}` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.72rem', color: 'var(--color-ivory)' }}>{branch.label}</span>
                    <SentimentIcon size={12} style={{ color: sentimentColor }} />
                  </div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--color-ivory-muted)', marginBottom: '0.5rem' }}>{branch.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hypothetical</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: branch.hypotheticalPnl >= 0 ? 'var(--color-teal)' : 'var(--color-crimson)' }}>
                        {branch.hypotheticalPnl >= 0 ? '+' : ''}{branch.hypotheticalPnl.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delta</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: sentimentColor }}>
                        {branch.delta >= 0 ? '+' : ''}{branch.delta.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actual</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: branch.actualPnl >= 0 ? 'var(--color-teal)' : 'var(--color-crimson)' }}>
                        {branch.actualPnl >= 0 ? '+' : ''}{branch.actualPnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Trade list */}
      {allClosed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <ScrollText size={40} style={{ color: 'rgba(196,164,109,0.2)', margin: '0 auto 1rem' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ivory-muted)', fontStyle: 'italic' }}>
            The Chronicle is empty.
          </p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(224,216,200,0.3)', marginTop: '0.5rem', fontFamily: 'var(--font-serif)' }}>
            Begin your expedition to write the first entry.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          <p className="exp-section-title">Trade History</p>
          {allClosed.map((p, i) => {
            const asset = getAssetBySymbol(p.symbol);
            const character = getCharacter(p.characterId);
            const isProfitable = p.pnl >= 0;
            const duration = p.closeTime ? ((p.closeTime - p.openTime) / 1000).toFixed(0) : '--';

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="exp-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-0.5 rounded-full"
                      style={{ height: '28px', background: isProfitable ? 'var(--color-teal)' : 'var(--color-crimson)' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {p.direction === 'STRIKE_UP'
                          ? <TrendingUp size={10} style={{ color: 'var(--color-teal)' }} />
                          : <TrendingDown size={10} style={{ color: 'var(--color-crimson)' }} />}
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.75rem', color: 'var(--color-ivory)' }}>
                          {asset?.gameName ?? p.symbol}
                        </span>
                        <span style={{
                          fontSize: '0.55rem', padding: '0.05rem 0.3rem',
                          color: p.direction === 'STRIKE_UP' ? 'var(--color-teal)' : 'var(--color-crimson)',
                          background: p.direction === 'STRIKE_UP' ? 'rgba(13,148,136,0.08)' : 'rgba(196,30,58,0.08)',
                        }}>
                          {p.direction === 'STRIKE_UP' ? 'UP' : 'DOWN'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5" style={{ fontSize: '0.6rem', color: 'var(--color-ivory-muted)' }}>
                        {character && <span style={{ color: character.accentColor }}>{character.name}</span>}
                        <span>Stake: {p.stake.toFixed(2)}</span>
                        <span>{p.entryPrice.toFixed(2)} → {p.currentPrice.toFixed(2)}</span>
                        <span>{duration}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: isProfitable ? 'var(--color-teal)' : 'var(--color-crimson)' }}>
                      {isProfitable ? '+' : ''}{p.pnl.toFixed(2)}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: isProfitable ? 'rgba(13,148,136,0.5)' : 'rgba(196,30,58,0.5)' }}>
                      {isProfitable ? '+' : ''}{p.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
