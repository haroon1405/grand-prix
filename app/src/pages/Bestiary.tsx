import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { ASSETS } from '../data/assets';
import { REGIONS } from '../data/lore';
import { MiniChart } from '../components/charts/MiniChart';

export function Bestiary() {
  const { markets, setSelectedSymbol } = useMarketStore();
  const { setPage } = useUIStore();

  const tradeAsset = (symbol: string) => {
    setSelectedSymbol(symbol);
    setPage('expedition');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl text-gold font-light tracking-wide">
          The Bestiary
        </h2>
        <p className="text-ivory-muted text-sm font-display italic mt-1">
          Every Nevron, Gradient, and Gommage manifestation catalogued by past expeditions.
        </p>
      </motion.div>

      {/* Group by region */}
      {REGIONS.filter(r => r.assets.length > 0).map((region, ri) => (
        <motion.div
          key={region.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ri * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} style={{ color: region.colorAccent }} />
            <h3 className="font-display text-lg" style={{ color: region.colorAccent }}>
              {region.name}
            </h3>
            <span className="text-[10px] text-ivory-muted bg-surface px-2 py-0.5 rounded-full">
              Difficulty {region.difficulty}/5
            </span>
          </div>
          <p className="text-xs text-ivory-muted mb-3">{region.description}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {region.assets.map(symbolId => {
              const asset = ASSETS.find(a => a.symbol === symbolId);
              const market = markets[symbolId];
              if (!asset || !market) return null;
              const isPositive = market.change >= 0;

              return (
                <motion.div
                  key={asset.symbol}
                  whileHover={{ scale: 1.005 }}
                  className="bg-surface/30 border border-ash/20 rounded-xl p-4 cursor-pointer
                    hover:border-gold/20 transition-all"
                  onClick={() => tradeAsset(asset.symbol)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.iconColor }} />
                        <h4 className="font-display text-base text-ivory">{asset.gameName}</h4>
                        <span className="text-[10px] text-ivory-muted bg-navy px-1.5 py-0.5 rounded">
                          {asset.gameCategory}
                        </span>
                      </div>
                      <p className="text-xs text-ivory-muted mt-1">{asset.description}</p>
                    </div>
                    <MiniChart symbol={asset.symbol} width={100} height={40} />
                  </div>

                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-ash/10">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-ivory-muted">Price</p>
                        <p className="font-tabular text-sm text-ivory">{market.lastPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ivory-muted">Change</p>
                        <p className={`font-tabular text-sm flex items-center gap-1 ${isPositive ? 'text-teal' : 'text-crimson'}`}>
                          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ivory-muted">Volatility</p>
                        <p className="font-tabular text-sm text-ivory flex items-center gap-1">
                          <Zap size={10} className="text-gold" />
                          {(market.volatilityScore * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-ivory-muted/40 font-display italic mt-2">
                    "{asset.loreText}"
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
