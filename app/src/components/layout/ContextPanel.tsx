import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserX, Zap, TrendingUp, TrendingDown, Activity, BookOpen } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useBattleStore } from '../../store/battleStore';
import { useTradingStore } from '../../store/tradingStore';
import { useMarketStore } from '../../store/marketStore';
import { ASSETS } from '../../data/assets';

export function ContextPanel() {
  const currentPage = useUIStore((s) => s.currentPage);

  if (currentPage === 'battle') return <BattleContextPanel />;
  if (currentPage === 'camp') return <CampContextPanel />;
  if (currentPage === 'bestiary') return <BestiaryContextPanel />;
  return <DefaultContextPanel />;
}

function BattleContextPanel() {
  const {
    closedPositions,
    sessionPnl,
    consecutiveWins,
    phase,
  } = useBattleStore();

  const recentMoves = closedPositions.slice(0, 5);

  return (
    <aside className="exp-sidebar-villain flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={12} style={{ color: 'var(--color-exp-red)' }} />
        <p className="exp-section-title" style={{ color: 'var(--color-exp-red)', marginBottom: 0, borderBottomColor: 'rgba(139,0,0,0.2)' }}>
          The Phantom Shadow
        </p>
      </div>

      <p style={{
        fontSize: '0.6rem',
        fontStyle: 'italic',
        opacity: 0.45,
        lineHeight: 1.5,
        marginBottom: '0.75rem',
        fontFamily: 'var(--font-serif)',
      }}>
        Your anti-self replicates your patterns in architectural reverse.
      </p>

      <div className="space-y-2 flex-1">
        {recentMoves.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 opacity-25"
            style={{ border: '1px solid rgba(139,0,0,0.15)', background: 'rgba(139,0,0,0.04)' }}
          >
            <UserX size={24} style={{ color: 'var(--color-exp-red)' }} />
            <p style={{ fontSize: '0.6rem', marginTop: '0.5rem', color: 'var(--color-exp-red)' }}>No Mirror Echoes</p>
          </div>
        ) : (
          <AnimatePresence>
            {recentMoves.map((pos, i) => {
              const mirrorDir = pos.direction === 'STRIKE_UP' ? 'SHADOW FALL' : 'SHADOW RISE';
              const isMirrorWin = pos.pnl < 0; // Shadow wins when you lose
              return (
                <motion.div
                  key={pos.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1 - i * 0.15, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '0.5rem 0.625rem',
                    borderLeft: '2px solid var(--color-exp-red)',
                    background: 'rgba(139,0,0,0.06)',
                    marginBottom: '0.25rem',
                  }}
                >
                  <p style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(139,0,0,0.6)', marginBottom: '0.2rem' }}>
                    {mirrorDir}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isMirrorWin ? 'var(--color-exp-red)' : 'rgba(224,216,200,0.4)' }}>
                    {pos.entryPrice.toFixed(2)} · {isMirrorWin ? '+' : ''}{(-pos.pnl).toFixed(2)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Threat indicator */}
      <div
        className="mt-auto flex flex-col items-center pt-3"
        style={{ borderTop: '1px solid rgba(139,0,0,0.15)' }}
      >
        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            border: '1px solid rgba(139,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              width: '30px', height: '30px',
              background: 'var(--color-exp-red)',
              borderRadius: '50%',
              filter: 'blur(12px)',
              opacity: phase === 'trading' ? 0.5 : 0.2,
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, transparent 0, rgba(0,0,0,0.7) 70%)',
            }} />
          </div>
        </div>
        <p className="exp-label" style={{ color: 'var(--color-exp-red)', marginTop: '0.5rem', fontSize: '0.55rem' }}>
          {phase === 'trading'
            ? `Paradox Threat: ${consecutiveWins >= 3 ? 'HIGH' : 'ACTIVE'}`
            : 'Dormant'}
        </p>
        {sessionPnl !== 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginTop: '0.25rem',
            color: sessionPnl < 0 ? 'var(--color-exp-red)' : 'rgba(224,216,200,0.3)',
          }}>
            Shadow P&L: {sessionPnl < 0 ? '+' : ''}{(-sessionPnl).toFixed(2)}
          </p>
        )}
      </div>
    </aside>
  );
}

function CampContextPanel() {
  const { capital, startingCapital, totalPnl, tradeCount, winCount } = useTradingStore();
  const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

  const stats = [
    { label: 'Starting Capital', value: startingCapital.toFixed(0), color: 'var(--color-ivory-muted)' },
    { label: 'Current Capital', value: capital.toFixed(2), color: 'var(--color-exp-gold)' },
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'var(--color-teal)' : 'var(--color-crimson)' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: 'var(--color-exp-gold)' },
    { label: 'Engagements', value: String(tradeCount), color: 'var(--color-ivory)' },
  ];

  return (
    <aside className="exp-sidebar flex flex-col">
      <p className="exp-section-title">Expedition Status</p>
      <div className="space-y-3">
        {stats.map(stat => (
          <div key={stat.label}>
            <p className="exp-label">{stat.label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: stat.color, marginTop: '0.15rem' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(196,164,109,0.08)' }}>
        <p className="exp-section-title">Camp Intel</p>
        <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.45, lineHeight: 1.6 }}>
          The Camp is a place of rest and reflection. Study your chronicle before the next engagement.
        </p>
      </div>
    </aside>
  );
}

function BestiaryContextPanel() {
  const markets = useMarketStore((s) => s.markets);

  const topVolatile = ASSETS
    .map(a => ({ asset: a, market: markets[a.symbol] }))
    .filter(x => x.market)
    .sort((a, b) => (b.market?.volatilityScore ?? 0) - (a.market?.volatilityScore ?? 0))
    .slice(0, 5);

  return (
    <aside className="exp-sidebar flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={11} style={{ color: 'var(--color-exp-gold)' }} />
        <p className="exp-section-title" style={{ marginBottom: 0 }}>Most Volatile</p>
      </div>

      <div className="space-y-2">
        {topVolatile.map(({ asset, market }) => {
          const isPositive = (market?.change ?? 0) >= 0;
          return (
            <div
              key={asset.symbol}
              style={{
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(196,164,109,0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: asset.iconColor }} />
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.68rem', color: 'var(--color-ivory)' }}>
                    {asset.gameName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isPositive ? <TrendingUp size={9} style={{ color: 'var(--color-teal)' }} /> : <TrendingDown size={9} style={{ color: 'var(--color-crimson)' }} />}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: isPositive ? 'var(--color-teal)' : 'var(--color-crimson)',
                  }}>
                    {isPositive ? '+' : ''}{market?.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ivory)' }}>
                  {market?.lastPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-1">
                  <Zap size={8} style={{ color: 'var(--color-exp-gold)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(196,164,109,0.5)' }}>
                    {((market?.volatilityScore ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(196,164,109,0.08)' }}>
        <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.4, lineHeight: 1.6 }}>
          Every Nevron, Gradient, and Gommage catalogued by past expeditions.
        </p>
      </div>
    </aside>
  );
}

function DefaultContextPanel() {
  const markets = useMarketStore((s) => s.markets);
  const { globalMood } = useMarketStore();
  const { setPage } = useUIStore();

  const topMovers = ASSETS
    .map(a => ({ asset: a, market: markets[a.symbol] }))
    .filter(x => x.market)
    .sort((a, b) => Math.abs(b.market?.changePercent ?? 0) - Math.abs(a.market?.changePercent ?? 0))
    .slice(0, 6);

  return (
    <aside className="exp-sidebar flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={11} style={{ color: 'var(--color-exp-gold)' }} />
        <p className="exp-section-title" style={{ marginBottom: 0 }}>Market Omens</p>
      </div>

      <div className="space-y-1.5 flex-1">
        {topMovers.map(({ asset, market }) => {
          const isPositive = (market?.change ?? 0) >= 0;
          return (
            <motion.button
              key={asset.symbol}
              whileHover={{ x: 2 }}
              onClick={() => {
                useUIStore.getState().setBattleSymbol(asset.symbol);
                setPage('battle');
              }}
              className="w-full text-left cursor-pointer"
              style={{
                padding: '0.4rem 0.5rem',
                background: 'transparent',
                border: '1px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,164,109,0.15)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: asset.iconColor }} />
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.65rem', color: 'var(--color-ivory)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                    {asset.gameName}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  color: isPositive ? 'var(--color-teal)' : 'var(--color-crimson)',
                }}>
                  {isPositive ? '+' : ''}{market?.changePercent.toFixed(2)}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(196,164,109,0.08)' }}>
        <p className="exp-label" style={{ marginBottom: '0.25rem' }}>Global Mood</p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.72rem', color: 'var(--color-exp-gold)', textTransform: 'capitalize' }}>
          {globalMood}
        </p>
        <p style={{ fontSize: '0.6rem', fontStyle: 'italic', opacity: 0.4, marginTop: '0.2rem', lineHeight: 1.5, fontFamily: 'var(--font-serif)' }}>
          Click any omen to begin the engagement.
        </p>
      </div>
    </aside>
  );
}
