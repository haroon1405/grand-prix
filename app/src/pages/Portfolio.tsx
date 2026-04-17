import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Award, Shield, Heart } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { PositionCard } from '../components/trading/PositionCard';
import { ResourceBar } from '../components/ui/ResourceBar';
import { getAssetBySymbol } from '../data/assets';
import { getCharacter } from '../data/characters';

export function Portfolio() {
  const {
    capital, startingCapital, totalPnl, exposure, resolve,
    positions, closedPositions, tradeCount, winCount, lossCount,
  } = useTradingStore();

  const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
  const capitalChange = capital - startingCapital;
  const capitalChangePercent = (capitalChange / startingCapital) * 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-3xl text-gold font-light tracking-wide text-center">
          The Camp
        </h2>
        <p className="text-ivory-muted text-sm font-display italic text-center mt-1">
          Review your expedition's progress. Rest, regroup, reflect.
        </p>
      </motion.div>

      {/* Resource overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface/50 border border-ash/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-gold" />
            <span className="text-xs text-ivory-muted uppercase tracking-widest font-display">Capital</span>
          </div>
          <p className="font-tabular text-xl text-gold">{capital.toFixed(2)}</p>
          <ResourceBar label="Reserves" value={capital} max={startingCapital * 2} color="#c9a959" />
        </div>

        <div className="bg-surface/50 border border-ash/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            {totalPnl >= 0 ? <TrendingUp size={16} className="text-emerald" /> : <TrendingDown size={16} className="text-crimson" />}
            <span className="text-xs text-ivory-muted uppercase tracking-widest font-display">P&L</span>
          </div>
          <p className={`font-tabular text-xl ${totalPnl >= 0 ? 'text-emerald' : 'text-crimson'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
          </p>
          <p className={`text-xs font-tabular ${capitalChangePercent >= 0 ? 'text-emerald/70' : 'text-crimson/70'}`}>
            {capitalChangePercent >= 0 ? '+' : ''}{capitalChangePercent.toFixed(2)}% since start
          </p>
        </div>

        <div className="bg-surface/50 border border-ash/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className={exposure > 0.7 ? 'text-crimson' : 'text-ivory-muted'} />
            <span className="text-xs text-ivory-muted uppercase tracking-widest font-display">Exposure</span>
          </div>
          <p className={`font-tabular text-xl ${exposure > 0.7 ? 'text-crimson' : 'text-ivory'}`}>
            {(exposure * 100).toFixed(0)}%
          </p>
          <ResourceBar label="Risk" value={exposure * 100} max={100} color={exposure > 0.7 ? '#c41e3a' : '#c9a959'} />
        </div>

        <div className="bg-surface/50 border border-ash/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className={resolve < 30 ? 'text-crimson' : 'text-teal'} />
            <span className="text-xs text-ivory-muted uppercase tracking-widest font-display">Resolve</span>
          </div>
          <p className={`font-tabular text-xl ${resolve < 30 ? 'text-crimson' : 'text-teal'}`}>
            {resolve.toFixed(0)}/100
          </p>
          <ResourceBar label="Morale" value={resolve} max={100} color={resolve < 30 ? '#c41e3a' : '#0d9488'} />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-surface/30 border border-ash/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-gold" />
          <h3 className="font-display text-sm text-ivory">Expedition Statistics</h3>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-tabular text-lg text-ivory">{tradeCount}</p>
            <p className="text-[10px] text-ivory-muted uppercase">Total Trades</p>
          </div>
          <div>
            <p className="font-tabular text-lg text-emerald">{winCount}</p>
            <p className="text-[10px] text-ivory-muted uppercase">Victories</p>
          </div>
          <div>
            <p className="font-tabular text-lg text-crimson">{lossCount}</p>
            <p className="text-[10px] text-ivory-muted uppercase">Defeats</p>
          </div>
          <div>
            <p className="font-tabular text-lg text-gold">{winRate.toFixed(1)}%</p>
            <p className="text-[10px] text-ivory-muted uppercase">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Open positions */}
      {positions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm text-ivory-muted">Active Expeditions ({positions.length})</h3>
          <AnimatePresence>
            {positions.map(p => (
              <PositionCard key={p.id} position={p} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Closed positions */}
      {closedPositions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-sm text-ivory-muted">The Chronicles (Recent)</h3>
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
                  className="flex items-center justify-between bg-navy/30 border border-ash/10 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${p.direction === 'STRIKE_UP' ? 'text-teal' : 'text-crimson'}`}>
                      {p.direction === 'STRIKE_UP' ? 'UP' : 'DOWN'}
                    </span>
                    <span className="font-display text-sm text-ivory">{asset?.gameName ?? p.symbol}</span>
                    {character && (
                      <span className="text-[10px]" style={{ color: character.accentColor }}>{character.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-tabular text-xs text-ivory-muted">
                      {p.entryPrice.toFixed(2)} &rarr; {p.currentPrice.toFixed(2)}
                    </span>
                    <span className={`font-tabular text-sm ${isProfitable ? 'text-emerald' : 'text-crimson'}`}>
                      {isProfitable ? '+' : ''}{p.pnl.toFixed(2)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      p.status === 'liquidated' ? 'bg-crimson/10 text-crimson' : isProfitable ? 'bg-teal/10 text-teal' : 'bg-ash/20 text-ivory-muted'
                    }`}>
                      {p.status === 'liquidated' ? 'BRACED' : isProfitable ? 'EXTRACTED' : 'CLOSED'}
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
