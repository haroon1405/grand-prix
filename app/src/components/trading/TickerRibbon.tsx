import { motion } from 'framer-motion';
import { useMarketStore } from '../../store/marketStore';
import { useUIStore } from '../../store/uiStore';
import { ASSETS } from '../../data/assets';

export function TickerRibbon() {
  const markets = useMarketStore((s) => s.markets);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);
  const setPage = useUIStore((s) => s.setPage);

  const items = [...ASSETS, ...ASSETS];

  return (
    <div className="w-full overflow-hidden bg-navy/40 border-b border-ash/10 h-7 shrink-0">
      <motion.div
        className="flex items-center gap-6 h-full whitespace-nowrap"
        animate={{ x: [0, -50 * ASSETS.length] }}
        transition={{
          x: {
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {items.map((asset, i) => {
          const market = markets[asset.symbol];
          if (!market) return null;
          const isPositive = market.change >= 0;

          return (
            <button
              key={`${asset.symbol}-${i}`}
              onClick={() => {
                setSelectedSymbol(asset.symbol);
                setPage('expedition');
              }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <span className="text-[10px] font-display text-ivory-muted">{asset.gameName}</span>
              <span className="font-tabular text-[11px] text-ivory">{market.lastPrice.toFixed(2)}</span>
              <span className={`font-tabular text-[10px] ${isPositive ? 'text-teal' : 'text-crimson'}`}>
                {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
