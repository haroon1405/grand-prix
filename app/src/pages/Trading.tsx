import { AnimatePresence } from 'framer-motion';
import { useMarketStore } from '../store/marketStore';
import { useTradingStore } from '../store/tradingStore';
import { PriceChart } from '../components/charts/PriceChart';
import { OrderPanel } from '../components/trading/OrderPanel';
import { PositionCard } from '../components/trading/PositionCard';
import { ASSETS } from '../data/assets';
import { getAssetBySymbol } from '../data/assets';

export function Trading() {
  const { selectedSymbol, setSelectedSymbol, markets } = useMarketStore();
  const positions = useTradingStore((s) => s.positions);
  const asset = getAssetBySymbol(selectedSymbol);
  const market = markets[selectedSymbol];

  const openPositionsForSymbol = positions.filter(p => p.symbol === selectedSymbol);
  const otherPositions = positions.filter(p => p.symbol !== selectedSymbol);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Asset selector strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 pb-1 -mx-1 px-1">
        {ASSETS.map(a => {
          const m = markets[a.symbol];
          const isActive = a.symbol === selectedSymbol;
          const isPositive = m && m.change >= 0;

          return (
            <button
              key={a.symbol}
              onClick={() => setSelectedSymbol(a.symbol)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap
                transition-all cursor-pointer border shrink-0
                ${isActive
                  ? 'bg-gold/10 border-gold/30 text-gold'
                  : 'bg-navy/50 border-ash/20 text-ivory-muted hover:border-ash-light hover:text-ivory'}
              `}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a.iconColor }} />
              <span className="font-display">{a.gameName}</span>
              {m && (
                <span className={`font-tabular text-[10px] ${isPositive ? 'text-teal' : 'text-crimson'}`}>
                  {isPositive ? '+' : ''}{m.changePercent.toFixed(2)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main trading layout — stacks on small screens, side-by-side on large */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">
        {/* Left: Chart + positions */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">
          {/* Chart header */}
          {asset && market && (
            <div className="flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <h2 className="font-display text-lg text-gold truncate">{asset.gameName}</h2>
                <p className="text-[11px] text-ivory-muted truncate">{asset.description}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="font-tabular text-xl text-ivory">{market.lastPrice.toFixed(2)}</p>
                <p className={`font-tabular text-xs ${market.change >= 0 ? 'text-teal' : 'text-crimson'}`}>
                  {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({market.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          )}

          {/* Chart — fills available vertical space */}
          <div className="flex-1 min-h-[200px]">
            <PriceChart symbol={selectedSymbol} />
          </div>

          {/* Open positions */}
          {positions.length > 0 && (
            <div className="space-y-2 shrink-0 max-h-[200px] overflow-y-auto">
              <h3 className="font-display text-sm text-ivory-muted">
                Open Positions ({positions.length})
              </h3>
              <AnimatePresence>
                {openPositionsForSymbol.map(p => (
                  <PositionCard key={p.id} position={p} />
                ))}
                {otherPositions.map(p => (
                  <PositionCard key={p.id} position={p} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right: Order panel */}
        <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 overflow-y-auto">
          <OrderPanel />
        </div>
      </div>
    </div>
  );
}
