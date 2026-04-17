import { motion } from 'framer-motion';
import { useMarketStore } from '../../store/marketStore';
import { useUIStore } from '../../store/uiStore';
import { ASSETS } from '../../data/assets';

export function TickerRibbon() {
  const markets = useMarketStore((s) => s.markets);
  const items = [...ASSETS, ...ASSETS, ...ASSETS];

  return (
    <div
      className="w-full overflow-hidden h-full flex items-center"
      style={{ background: 'rgba(5,6,8,0.95)' }}
    >
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap"
        animate={{ x: [0, -60 * ASSETS.length] }}
        transition={{ x: { duration: 50, repeat: Infinity, ease: 'linear' } }}
      >
        {items.map((asset, i) => {
          const market = markets[asset.symbol];
          if (!market) return null;
          const isPositive = market.change >= 0;

          return (
            <button
              key={`${asset.symbol}-${i}`}
              onClick={() => {
                useUIStore.getState().setBattleSymbol(asset.symbol);
                useUIStore.getState().setPage('battle');
              }}
              className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
              style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0' }}
            >
              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: asset.iconColor }} />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.65rem',
                  color: 'rgba(224,216,200,0.45)',
                  letterSpacing: '0.03em',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-exp-gold)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(224,216,200,0.45)')}
              >
                {asset.gameName}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(224,216,200,0.7)' }}>
                {market.lastPrice.toFixed(2)}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: isPositive ? 'var(--color-teal)' : 'var(--color-crimson)',
              }}>
                {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
              </span>

              {/* Separator */}
              <span style={{ color: 'rgba(196,164,109,0.15)', fontSize: '0.6rem' }}>·</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
