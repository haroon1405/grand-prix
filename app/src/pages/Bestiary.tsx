import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, MapPin, Swords } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { ASSETS } from '../data/assets';
import { REGIONS } from '../data/lore';
import { MiniChart } from '../components/charts/MiniChart';

export function Bestiary() {
  const { markets, setSelectedSymbol } = useMarketStore();
  const { setPage, setBattleSymbol } = useUIStore();

  const tradeAsset = (symbol: string) => {
    setSelectedSymbol(symbol);
    setBattleSymbol(symbol);
    setPage('battle');
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h2
          className="text-glow"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.1em', color: 'var(--color-exp-gold)', textTransform: 'uppercase' }}
        >
          The Bestiary
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-ivory-muted)' }}>
          Every Nevron, Gradient, and Gommage catalogued by past expeditions.
        </p>
      </motion.div>

      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(196,164,109,0.3), transparent)' }} />

      {REGIONS.filter(r => r.assets.length > 0).map((region, ri) => (
        <motion.div
          key={region.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ri * 0.08 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={11} style={{ color: region.colorAccent }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: region.colorAccent }}>
              {region.name}
            </h3>
            <span style={{
              fontSize: '0.55rem', color: 'var(--color-ivory-muted)',
              background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.4rem',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Difficulty {region.difficulty}/5
            </span>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--color-ivory-muted)', marginBottom: '0.75rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
            {region.description}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {region.assets.map(symbolId => {
              const asset = ASSETS.find(a => a.symbol === symbolId);
              const market = markets[symbolId];
              if (!asset || !market) return null;
              const isPositive = market.change >= 0;

              return (
                <motion.div
                  key={asset.symbol}
                  whileHover={{ y: -1 }}
                  className="exp-card cursor-pointer"
                  onClick={() => tradeAsset(asset.symbol)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: asset.iconColor }} />
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.8rem', color: 'var(--color-ivory)' }}>{asset.gameName}</h4>
                        <span style={{
                          fontSize: '0.55rem', color: 'var(--color-ivory-muted)',
                          background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.35rem',
                        }}>
                          {asset.gameCategory}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--color-ivory-muted)', marginTop: '0.25rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                        {asset.description}
                      </p>
                    </div>
                    <MiniChart symbol={asset.symbol} width={90} height={36} />
                  </div>

                  <div className="flex items-end justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(196,164,109,0.08)' }}>
                    <div className="flex items-center gap-4">
                      <div>
                        <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ivory)' }}>{market.lastPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Change</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isPositive ? 'var(--color-teal)' : 'var(--color-crimson)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                          {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Volatility</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ivory)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={9} style={{ color: 'var(--color-exp-gold)' }} />
                          {(market.volatilityScore * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" style={{ fontSize: '0.6rem', color: 'rgba(196,164,109,0.4)', fontFamily: 'var(--font-serif)' }}>
                      <Swords size={9} />
                      <span>Engage</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.6rem', color: 'rgba(224,216,200,0.2)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginTop: '0.5rem' }}>
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
