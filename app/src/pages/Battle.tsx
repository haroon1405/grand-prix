import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Wallet, ArrowLeft, Trophy, Skull, Volume2, VolumeX, Zap } from 'lucide-react';
import { useBattleStore } from '../store/battleStore';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { useTiltStore } from '../store/tiltStore';
import { usePowerUpStore } from '../store/powerUpStore';
import { useSettingsStore } from '../store/settingsStore';
import { PriceChart } from '../components/charts/PriceChart';
import { CharacterCard } from '../components/battle/CharacterCard';
import { AttackButton } from '../components/battle/AttackButton';
import { PaintressBar } from '../components/battle/PaintressBar';
import { BattleLog } from '../components/battle/BattleLog';
import { PowerUpBar } from '../components/battle/PowerUpBar';
import { getAttacksForCharacter } from '../data/attacks';
import { getAssetBySymbol } from '../data/assets';
import { TILT_ZONE_COLORS, TILT_ZONE_LABELS } from '../engines/tiltDetection';
import { PAINTRESS_ATTACKS } from '../data/attacks';
import { CHAOS_SCORE_MULTIPLIER } from '../engines/chaosEngine';

const BATTLE_CHARACTERS = ['gustave', 'maelle', 'lune', 'sciel', 'verso'];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatCountdown(expiryTime: number): string {
  const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s}s`;
}

export function Battle() {
  const battleSymbol = useUIStore((s) => s.battleSymbol);
  const setPage = useUIStore((s) => s.setPage);
  const market = useMarketStore((s) => s.markets[battleSymbol ?? '']);

  const {
    phase, teamCapital, roundTimer, activeCharacterId, positions,
    paintressHP, paintressMaxHP, paintressNextAttack, voidInkUntil,
    trendHint, forecastHint, chaosActive, chaosHeadline, timerFrozen,
    revealedPaintressAttack, sessionPnl,
    startBattle, selectCharacter, executeAttack, updatePositions, resetBattle,
    sellEarly,
  } = useBattleStore();

  const tiltScore = useTiltStore((s) => s.score);
  const tiltZone = useTiltStore((s) => s.zone);
  const { soundEnabled, toggleSound } = useSettingsStore();
  const credits = usePowerUpStore((s) => s.credits);

  const asset = getAssetBySymbol(battleSymbol ?? '');
  const attacks = getAttacksForCharacter(activeCharacterId);
  const currentPrice = market?.lastPrice ?? 0;

  const [, setTick] = useState(0);
  useEffect(() => {
    if (phase !== 'trading') return;
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'trading' && currentPrice > 0) {
      updatePositions(currentPrice);
    }
  }, [currentPrice, phase]);

  if (!battleSymbol || !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ivory-muted)', fontStyle: 'italic' }}>
          Select a market from The Continent to begin.
        </p>
        <button className="exp-button" style={{ width: '200px', height: '44px' }} onClick={() => setPage('continent')}>
          Return to The Continent
        </button>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 300, color: 'var(--color-exp-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            className="text-glow"
          >
            The Expedition Begins
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ivory-muted)' }}>
            Trading <span style={{ color: 'var(--color-exp-gold)' }}>{asset.gameName}</span>
            <span style={{ color: 'rgba(224,216,200,0.35)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              ({asset.symbol})
            </span>
          </p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(224,216,200,0.4)', maxWidth: '360px', lineHeight: 1.6, fontFamily: 'var(--font-serif)' }}>
            Your team of 5 expeditioners will face The Paintress in a 10-minute battle.
            Trades are timed contracts — they auto-settle at expiry (85% payout on wins).
          </p>
        </motion.div>
        <div className="flex gap-3">
          <button
            className="exp-button exp-button-primary"
            style={{ width: '180px', height: '48px', fontSize: '0.85rem' }}
            onClick={() => startBattle(battleSymbol)}
          >
            <Zap size={14} style={{ marginBottom: '2px' }} />
            Begin Battle
          </button>
          <button
            className="exp-button"
            style={{ width: '160px', height: '48px', fontSize: '0.75rem' }}
            onClick={() => setPage('continent')}
          >
            <ArrowLeft size={13} style={{ marginBottom: '2px' }} />
            Back to Continent
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'victory' || phase === 'defeat') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          {phase === 'victory' ? (
            <>
              <Trophy size={52} style={{ color: 'var(--color-exp-gold)', margin: '0 auto' }} className="text-glow" />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                className="text-glow"
                data-color="var(--color-exp-gold)"
              >
                <span style={{ color: 'var(--color-exp-gold)' }}>Victory!</span>
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ivory-muted)', fontStyle: 'italic' }}>
                The Paintress has been defeated.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-teal)' }}>
                Final Capital: {teamCapital.toFixed(2)} · P&L: {sessionPnl >= 0 ? '+' : ''}{sessionPnl.toFixed(2)}
              </p>
            </>
          ) : (
            <>
              <Skull size={52} style={{ color: 'var(--color-crimson)', margin: '0 auto' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--color-crimson)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Defeat
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ivory-muted)', fontStyle: 'italic' }}>
                The Paintress endures.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-ivory-muted)' }}>
                Paintress HP: {Math.round(paintressHP)} / {paintressMaxHP}
              </p>
            </>
          )}
        </motion.div>
        <div className="flex gap-3">
          <button
            className="exp-button exp-button-primary"
            style={{ width: '160px', height: '44px' }}
            onClick={() => { resetBattle(); startBattle(battleSymbol); }}
          >
            Fight Again
          </button>
          <button
            className="exp-button"
            style={{ width: '160px', height: '44px' }}
            onClick={() => { resetBattle(); setPage('continent'); }}
          >
            Return to Continent
          </button>
        </div>
      </div>
    );
  }

  const timerColor = roundTimer < 60 ? 'var(--color-crimson)' : roundTimer < 180 ? '#c45e3a' : 'var(--color-exp-gold)';
  const isVoidInk = Date.now() < voidInkUntil;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Chaos banner */}
      <AnimatePresence>
        {chaosHeadline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="shrink-0 text-center px-4 py-2"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <p style={{ fontSize: '0.6rem', color: 'var(--color-violet)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Gommage Omen</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.85rem', color: 'var(--color-ivory)' }}>{chaosHeadline.text}</p>
            <p style={{ fontSize: '0.55rem', color: 'var(--color-ivory-muted)', marginTop: '0.15rem' }}>Source: {chaosHeadline.source}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {chaosActive && !chaosHeadline && (
        <div className="shrink-0 text-center px-3 py-1 animate-pulse-glow"
          style={{ fontSize: '0.65rem', color: 'var(--color-violet)', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', fontFamily: 'var(--font-serif)' }}>
          OMEN ACTIVE — {CHAOS_SCORE_MULTIPLIER}x Score Multiplier
        </div>
      )}

      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(196,164,109,0.1)' }}>
        {/* Timer */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Timer size={12} style={{ color: timerColor }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: timerColor }}>
            {formatTime(roundTimer)}
          </span>
          {timerFrozen && <span style={{ fontSize: '0.55rem', background: 'rgba(196,164,109,0.15)', color: 'var(--color-exp-gold)', padding: '0.1rem 0.3rem' }} className="animate-pulse-glow">FROZEN</span>}
        </div>

        {/* Tilt meter */}
        <div className="flex items-center gap-1.5 shrink-0" title={`Tilt: ${Math.round(tiltScore)}/100`}>
          <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${tiltScore}%`, height: '100%', background: TILT_ZONE_COLORS[tiltZone], transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-serif)', color: TILT_ZONE_COLORS[tiltZone] }}>
            {TILT_ZONE_LABELS[tiltZone]}
          </span>
        </div>

        {/* Paintress HP */}
        <div className="flex-1 max-w-sm">
          <PaintressBar />
        </div>

        {/* Paintress next attack */}
        <div className="shrink-0 text-center">
          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-serif)', color: 'var(--color-violet)' }}>
            Next: {paintressNextAttack}s
          </span>
          {revealedPaintressAttack && (
            <div style={{ fontSize: '0.55rem', color: 'var(--color-exp-gold)' }}>
              ({PAINTRESS_ATTACKS.find(a => a.id === revealedPaintressAttack)?.name})
            </div>
          )}
        </div>

        {/* Capital */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Wallet size={12} style={{ color: 'var(--color-exp-gold)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-exp-gold)' }}>
            {teamCapital.toFixed(0)}
          </span>
        </div>

        {/* P&L */}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: sessionPnl >= 0 ? 'var(--color-teal)' : 'var(--color-crimson)', flexShrink: 0 }}>
          {sessionPnl >= 0 ? '+' : ''}{sessionPnl.toFixed(2)}
        </span>

        {isVoidInk && (
          <span style={{ fontSize: '0.6rem', background: 'rgba(124,58,237,0.15)', color: 'var(--color-violet)', border: '1px solid rgba(124,58,237,0.3)', padding: '0.15rem 0.4rem' }} className="animate-pulse-glow">
            VOID INK
          </span>
        )}

        {/* Credits */}
        <div className="flex items-center gap-1 shrink-0">
          <Zap size={10} style={{ color: 'rgba(196,164,109,0.5)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(196,164,109,0.5)' }}>{credits}</span>
        </div>

        {/* Sound */}
        <button onClick={toggleSound} className="shrink-0 cursor-pointer" style={{ color: 'rgba(224,216,200,0.4)', border: 'none', background: 'transparent' }}>
          {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
        </button>
      </div>

      {/* Hints */}
      {trendHint.direction && Date.now() < trendHint.expiresAt && (
        <div className="shrink-0 text-center px-3 py-1" style={{ fontSize: '0.65rem', color: 'var(--color-violet)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', fontFamily: 'var(--font-serif)' }}>
          Pattern Read: Trend points <strong>{trendHint.direction}</strong>
        </div>
      )}
      {forecastHint.direction && Date.now() < forecastHint.expiresAt && (
        <div className="shrink-0 text-center px-3 py-1" style={{ fontSize: '0.65rem', color: 'var(--color-violet)', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', fontFamily: 'var(--font-serif)' }}>
          Arcane Forecast: Momentum favors <strong>{forecastHint.direction}</strong>
        </div>
      )}

      {/* Main 3-column battle layout */}
      <div className="flex-1 min-h-0 flex gap-2">
        {/* Left: Character cards */}
        <div className="w-[88px] shrink-0 flex flex-col gap-1 overflow-y-auto">
          {BATTLE_CHARACTERS.map(id => (
            <CharacterCard
              key={id}
              characterId={id}
              isActive={activeCharacterId === id}
              onClick={() => selectCharacter(id)}
            />
          ))}
        </div>

        {/* Center: Chart + battle log */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.8rem', color: 'var(--color-exp-gold)' }}>{asset.gameName}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ivory-muted)', marginLeft: '0.5rem' }}>{asset.symbol}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--color-ivory)' }}>
              {currentPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex-1 min-h-[160px]">
            <PriceChart symbol={battleSymbol} />
          </div>

          <div className="h-[100px] shrink-0 overflow-hidden" style={{ border: '1px solid rgba(196,164,109,0.1)', background: 'rgba(0,0,0,0.2)', borderRadius: '2px', padding: '0.5rem' }}>
            <BattleLog />
          </div>
        </div>

        {/* Right: Attacks + power-ups + positions */}
        <div className="w-[240px] shrink-0 flex flex-col gap-2 overflow-y-auto">
          <div className="space-y-1">
            <p className="exp-section-title">
              Attacks — {activeCharacterId.charAt(0).toUpperCase() + activeCharacterId.slice(1)}
            </p>
            {attacks.map(atk => (
              <AttackButton
                key={atk.id}
                attack={atk}
                onExecute={(id, dir) => executeAttack(id, currentPrice, dir)}
              />
            ))}
          </div>

          <PowerUpBar />

          {positions.length > 0 && (
            <div className="space-y-1">
              <p className="exp-section-title">Open Positions ({positions.length})</p>
              {positions.map(p => {
                const isProfitable = p.pnl >= 0;
                const hasExpiry = p.expiryTime && p.expiryTime > Date.now();

                return (
                  <div
                    key={p.id}
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${isProfitable ? 'rgba(13,148,136,0.2)' : 'rgba(196,30,58,0.2)'}`,
                      padding: '0.4rem 0.5rem',
                      borderRadius: '2px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: p.direction === 'STRIKE_UP' ? 'var(--color-teal)' : 'var(--color-crimson)', fontFamily: 'var(--font-serif)' }}>
                        {p.direction === 'STRIKE_UP' ? 'RISE' : 'FALL'}
                      </span>
                      <div className="flex items-center gap-2">
                        {hasExpiry && (
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ivory-muted)' }}>
                            {formatCountdown(p.expiryTime!)}
                          </span>
                        )}
                        <span style={{ fontFamily: 'var(--font-mono)', color: isProfitable ? 'var(--color-teal)' : 'var(--color-crimson)' }}>
                          {isProfitable ? '+' : ''}{p.pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5" style={{ color: 'var(--color-ivory-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                      <span>{p.stake.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <span>{p.entryPrice.toFixed(2)} → {p.currentPrice.toFixed(2)}</span>
                        {hasExpiry && (
                          <button
                            onClick={() => sellEarly(p.id, currentPrice)}
                            className="cursor-pointer"
                            style={{ fontSize: '0.55rem', background: 'rgba(196,164,109,0.08)', color: 'var(--color-exp-gold)', border: '1px solid rgba(196,164,109,0.2)', padding: '0.1rem 0.3rem' }}
                          >
                            SELL
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
