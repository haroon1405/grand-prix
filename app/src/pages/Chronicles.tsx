import { motion } from 'framer-motion';
import { ScrollText, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { getAssetBySymbol } from '../data/assets';
import { getCharacter } from '../data/characters';

export function Chronicles() {
  const { closedPositions, tradeCount, winCount, lossCount, totalPnl } = useTradingStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl text-gold font-light tracking-wide">
          The Chronicles
        </h2>
        <p className="text-ivory-muted text-sm font-display italic mt-1">
          A record of every encounter, every decision, every scar left upon the ledger.
        </p>
      </motion.div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <span className="text-ivory-muted">{tradeCount} engagements</span>
        <span className="text-emerald">{winCount} victories</span>
        <span className="text-crimson">{lossCount} defeats</span>
        <span className={totalPnl >= 0 ? 'text-gold' : 'text-crimson'}>
          Net: {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
        </span>
      </div>

      {/* Trade list */}
      {closedPositions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <ScrollText size={48} className="text-ash mx-auto mb-4" />
          <p className="font-display text-ivory-muted">The Chronicle is empty.</p>
          <p className="text-xs text-ivory-muted/50 mt-1">
            Begin your expedition to write the first entry.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {closedPositions.map((p, i) => {
            const asset = getAssetBySymbol(p.symbol);
            const character = getCharacter(p.characterId);
            const isProfitable = p.pnl >= 0;
            const duration = p.closeTime ? ((p.closeTime - p.openTime) / 1000).toFixed(0) : '—';

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface/30 border border-ash/15 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${isProfitable ? 'bg-teal' : 'bg-crimson'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        {p.direction === 'STRIKE_UP'
                          ? <TrendingUp size={12} className="text-teal" />
                          : <TrendingDown size={12} className="text-crimson" />
                        }
                        <span className="font-display text-sm text-ivory">
                          {asset?.gameName ?? p.symbol}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          p.direction === 'STRIKE_UP' ? 'bg-teal/10 text-teal' : 'bg-crimson/10 text-crimson'
                        }`}>
                          {p.direction === 'STRIKE_UP' ? 'STRIKE UP' : 'STRIKE DOWN'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-ivory-muted">
                        {character && <span style={{ color: character.accentColor }}>{character.name}</span>}
                        <span>Stake: {p.stake.toFixed(2)}</span>
                        <span>{p.entryPrice.toFixed(2)} &rarr; {p.currentPrice.toFixed(2)}</span>
                        <span>{duration}s</span>
                        <span className={`${
                          p.status === 'liquidated' ? 'text-crimson' : ''
                        }`}>
                          {p.status === 'liquidated' ? 'BRACED (SL)' : p.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-tabular text-sm ${isProfitable ? 'text-emerald' : 'text-crimson'}`}>
                      {isProfitable ? '+' : ''}{p.pnl.toFixed(2)}
                    </p>
                    <p className={`font-tabular text-[10px] ${isProfitable ? 'text-emerald/60' : 'text-crimson/60'}`}>
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
