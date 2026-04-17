import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { useTradingStore } from '../store/tradingStore';
import { useUIStore } from '../store/uiStore';
import { ASSETS } from '../data/assets';
import { MOOD_DESCRIPTIONS, LOADING_QUOTES } from '../data/lore';
import { MiniChart } from '../components/charts/MiniChart';
import { ResourceBar } from '../components/ui/ResourceBar';
import { useState } from 'react';

export function Dashboard() {
  const { markets, globalMood, setSelectedSymbol } = useMarketStore();
  const { capital, startingCapital, totalPnl, exposure, resolve, winCount, lossCount, tradeCount } = useTradingStore();
  const { setPage } = useUIStore();
  const mood = MOOD_DESCRIPTIONS[globalMood];
  const [quote] = useState(() => LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]);

  const winRate = tradeCount > 0 ? ((winCount / tradeCount) * 100).toFixed(1) : '—';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Atmospheric header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="font-display text-3xl text-gold font-light tracking-wide">
          The Continent
        </h2>
        <p className="text-ivory-muted text-sm font-display italic">{mood.ambiance}</p>
      </motion.div>

      {/* Portfolio overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface/50 border border-ash/20 rounded-xl p-4"
        >
          <p className="text-[10px] text-ivory-muted uppercase tracking-widest font-display">Capital</p>
          <p className="font-tabular text-2xl text-gold mt-1">{capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <ResourceBar label="" value={capital} max={startingCapital * 2} color="#c9a959" showValue={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface/50 border border-ash/20 rounded-xl p-4"
        >
          <p className="text-[10px] text-ivory-muted uppercase tracking-widest font-display">Total P&L</p>
          <p className={`font-tabular text-2xl mt-1 ${totalPnl >= 0 ? 'text-emerald' : 'text-crimson'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-ivory-muted">
            <span>W: {winCount}</span>
            <span>L: {lossCount}</span>
            <span>Rate: {winRate}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface/50 border border-ash/20 rounded-xl p-4"
        >
          <p className="text-[10px] text-ivory-muted uppercase tracking-widest font-display">Exposure</p>
          <p className={`font-tabular text-2xl mt-1 ${exposure > 0.7 ? 'text-crimson' : 'text-ivory'}`}>
            {(exposure * 100).toFixed(0)}%
          </p>
          <ResourceBar label="" value={exposure * 100} max={100} color={exposure > 0.7 ? '#c41e3a' : '#c9a959'} showValue={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-surface/50 border border-ash/20 rounded-xl p-4"
        >
          <p className="text-[10px] text-ivory-muted uppercase tracking-widest font-display">Resolve</p>
          <p className={`font-tabular text-2xl mt-1 ${resolve < 30 ? 'text-crimson' : 'text-teal'}`}>
            {resolve.toFixed(0)}
          </p>
          <ResourceBar label="" value={resolve} max={100} color={resolve < 30 ? '#c41e3a' : '#0d9488'} showValue={false} />
        </motion.div>
      </div>

      {/* Market grid */}
      <div>
        <h3 className="font-display text-lg text-ivory mb-3 flex items-center gap-2">
          <Activity size={16} className="text-gold" />
          Market Omens
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {ASSETS.map((asset, index) => {
            const market = markets[asset.symbol];
            if (!market) return null;
            const isPositive = market.change >= 0;

            return (
              <motion.button
                key={asset.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => {
                  setSelectedSymbol(asset.symbol);
                  setPage('expedition');
                }}
                className="bg-surface/30 border border-ash/20 rounded-xl p-4 text-left cursor-pointer
                  hover:border-gold/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: asset.iconColor }}
                      />
                      <span className="font-display text-sm text-ivory group-hover:text-gold transition-colors">
                        {asset.gameName}
                      </span>
                    </div>
                    <p className="text-[10px] text-ivory-muted">{asset.gameCategory} &middot; {asset.region.replace('_', ' ')}</p>
                  </div>
                  <MiniChart symbol={asset.symbol} width={80} height={32} />
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="font-tabular text-lg text-ivory">{market.lastPrice.toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      {isPositive ? <TrendingUp size={10} className="text-teal" /> : <TrendingDown size={10} className="text-crimson" />}
                      <span className={`font-tabular text-xs ${isPositive ? 'text-teal' : 'text-crimson'}`}>
                        {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-ivory-muted">
                    <Zap size={10} />
                    <span>Vol: {(market.volatilityScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-ivory-muted/40 font-display italic py-4"
      >
        {quote}
      </motion.p>
    </div>
  );
}
