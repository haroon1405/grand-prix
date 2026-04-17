import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { ASSETS } from '../data/assets';
import { MOOD_DESCRIPTIONS, LOADING_QUOTES } from '../data/lore';
import { MiniChart } from '../components/charts/MiniChart';
import { useState } from 'react';

export function Dashboard() {
  const { markets, globalMood, setSelectedSymbol } = useMarketStore();
  const { setPage, setBattleSymbol } = useUIStore();
  const mood = MOOD_DESCRIPTIONS[globalMood];
  const [quote] = useState(() => LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]);

  const handleSelectAsset = (symbol: string) => {
    setSelectedSymbol(symbol);
    setBattleSymbol(symbol);
    setPage('battle');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.75rem',
          fontWeight: 300,
          letterSpacing: '0.1em',
          color: 'var(--color-exp-gold)',
          textTransform: 'uppercase',
        }}
          className="text-glow"
        >
          The Continent
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-ivory-muted)' }}>
          {mood.ambiance}
        </p>
      </motion.div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(196,164,109,0.3), transparent)' }} />

      {/* Market grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={12} style={{ color: 'var(--color-exp-gold)' }} />
          <p className="exp-section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Market Omens</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ASSETS.map((asset, index) => {
            const market = markets[asset.symbol];
            if (!market) return null;
            const isPositive = market.change >= 0;

            return (
              <motion.button
                key={asset.symbol}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                whileHover={{ y: -2 }}
                onClick={() => handleSelectAsset(asset.symbol)}
                className="text-left cursor-pointer exp-card group"
                style={{ outline: 'none' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: asset.iconColor }}
                      />
                      <span style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.72rem',
                        color: 'var(--color-ivory)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {asset.gameName}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-ivory-muted)' }}>
                      {asset.symbol}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <MiniChart symbol={asset.symbol} width={72} height={28} />
                  </div>
                </div>

                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-ivory)' }}>
                      {market.lastPrice.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isPositive
                        ? <TrendingUp size={9} style={{ color: 'var(--color-teal)' }} />
                        : <TrendingDown size={9} style={{ color: 'var(--color-crimson)' }} />}
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                        color: isPositive ? 'var(--color-teal)' : 'var(--color-crimson)',
                      }}>
                        {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={9} style={{ color: 'rgba(196,164,109,0.4)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(196,164,109,0.4)' }}>
                      {(market.volatilityScore * 100).toFixed(0)}%
                    </span>
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
        transition={{ delay: 0.6 }}
        className="text-center py-4"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.7rem', color: 'rgba(224,216,200,0.25)' }}
      >
        {quote}
      </motion.p>
    </div>
  );
}
