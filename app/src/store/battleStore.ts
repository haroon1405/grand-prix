import { create } from 'zustand';
import { BattlePhase, BattleLogEntry, ChaosHeadline } from '../types/battle';
import { Position } from '../types/trading';
import { ATTACK_MAP, PAINTRESS_ATTACKS, BASE_STAKE_PERCENT } from '../data/attacks';
import { resolveExpirySettlement, resolveEarlySellSettlement, getExpiryMs } from '../lib/tradeSettlement';
import { calculateEntryTilt, calculateExitTilt, applyTiltDecay, scoreToZone } from '../engines/tiltDetection';
import { getRandomHeadline, getNextChaosInterval, CHAOS_DISPLAY_DURATION_MS, CHAOS_EFFECT_DURATION_MS, CHAOS_SCORE_MULTIPLIER, resetChaosEngine } from '../engines/chaosEngine';
import { useTiltStore } from './tiltStore';
import { usePowerUpStore } from './powerUpStore';
import { useProgressionStore } from './progressionStore';
import { sfx } from '../lib/sounds';

const ROUND_DURATION = 600;
const PAINTRESS_MAX_HP = 1000;
const PAINTRESS_ATTACK_INTERVAL = 120;
const STARTING_CAPITAL = 10000;

interface BattleStore {
  symbol: string;
  teamCapital: number;
  paintressHP: number;
  paintressMaxHP: number;
  roundTimer: number;
  phase: BattlePhase;
  activeCharacterId: string;
  positions: Position[];
  closedPositions: Position[];
  battleLog: BattleLogEntry[];
  paintressNextAttack: number;
  consecutiveWins: number;
  cooldowns: Record<string, number>;
  voidInkUntil: number;
  lossReductionNext: number;
  trendHint: { direction: 'up' | 'down' | null; expiresAt: number };
  forecastHint: { direction: 'up' | 'down' | null; expiresAt: number };

  // Chaos
  chaosActive: boolean;
  chaosHeadline: ChaosHeadline | null;
  chaosTradesCount: number;

  // Power-up flags
  inkShieldActive: boolean;
  timerFrozen: boolean;
  timerFrozenUntil: number;
  revealedPaintressAttack: string | null;

  // Session stats for tilt
  sessionPnl: number;
  lastStake: number;

  // Timers
  _timerInterval: ReturnType<typeof setInterval> | null;
  _chaosTimer: ReturnType<typeof setTimeout> | null;
  _logId: number;

  // Actions
  startBattle: (symbol: string) => void;
  selectCharacter: (id: string) => void;
  executeAttack: (attackId: string, currentPrice: number, direction?: 'buy' | 'sell') => void;
  updatePositions: (currentPrice: number) => void;
  closePosition: (positionId: string, currentPrice: number, bonusPercent?: number) => void;
  sellEarly: (positionId: string, currentPrice: number) => void;
  paintressAttack: () => void;
  endBattle: (result: 'victory' | 'defeat') => void;
  resetBattle: () => void;
  addLog: (type: BattleLogEntry['type'], message: string, color?: string) => void;
  isAttackAvailable: (attackId: string) => boolean;
}

let posId = 0;

export const useBattleStore = create<BattleStore>((set, get) => ({
  symbol: '',
  teamCapital: STARTING_CAPITAL,
  paintressHP: PAINTRESS_MAX_HP,
  paintressMaxHP: PAINTRESS_MAX_HP,
  roundTimer: ROUND_DURATION,
  phase: 'setup',
  activeCharacterId: 'gustave',
  positions: [],
  closedPositions: [],
  battleLog: [],
  paintressNextAttack: PAINTRESS_ATTACK_INTERVAL,
  consecutiveWins: 0,
  cooldowns: {},
  voidInkUntil: 0,
  lossReductionNext: 0,
  trendHint: { direction: null, expiresAt: 0 },
  forecastHint: { direction: null, expiresAt: 0 },

  chaosActive: false,
  chaosHeadline: null,
  chaosTradesCount: 0,

  inkShieldActive: false,
  timerFrozen: false,
  timerFrozenUntil: 0,
  revealedPaintressAttack: null,

  sessionPnl: 0,
  lastStake: 0,

  _timerInterval: null,
  _chaosTimer: null,
  _logId: 0,

  startBattle: (symbol) => {
    const state = get();
    if (state._timerInterval) clearInterval(state._timerInterval);
    if (state._chaosTimer) clearTimeout(state._chaosTimer);

    // Reset tilt and power-ups
    useTiltStore.getState().reset();
    usePowerUpStore.getState().reset();
    resetChaosEngine();

    sfx.play('battle_start');

    const interval = setInterval(() => {
      const s = get();
      if (s.phase !== 'trading') return;

      // Check timer freeze
      if (s.timerFrozen && Date.now() < s.timerFrozenUntil) return;
      if (s.timerFrozen && Date.now() >= s.timerFrozenUntil) {
        set({ timerFrozen: false });
      }

      const newTimer = s.roundTimer - 1;
      const newPaintressNext = s.paintressNextAttack - 1;

      // Timer warning sound
      if (newTimer === 60) sfx.play('timer_warning');

      if (newTimer <= 0) {
        get().endBattle('defeat');
        return;
      }

      if (newPaintressNext <= 0) {
        get().paintressAttack();
        set({ paintressNextAttack: PAINTRESS_ATTACK_INTERVAL, roundTimer: newTimer });
      } else {
        set({ roundTimer: newTimer, paintressNextAttack: newPaintressNext });
      }

      // Tick power-ups
      usePowerUpStore.getState().tick();
    }, 1000);

    // Schedule first chaos event
    const scheduleChaos = () => {
      const timer = setTimeout(() => {
        const s = get();
        if (s.phase !== 'trading') return;

        const headline = getRandomHeadline();
        set({ chaosActive: true, chaosHeadline: headline });
        sfx.play('chaos_alert');
        get().addLog('system', `OMEN: ${headline.text}`, '#7c3aed');

        // Hide headline after display duration
        setTimeout(() => set({ chaosHeadline: null }), CHAOS_DISPLAY_DURATION_MS);

        // Deactivate chaos effect after duration
        setTimeout(() => set({ chaosActive: false }), CHAOS_EFFECT_DURATION_MS);

        // Schedule next chaos event
        scheduleChaos();
      }, getNextChaosInterval());

      set({ _chaosTimer: timer });
    };

    set({
      symbol,
      teamCapital: STARTING_CAPITAL,
      paintressHP: PAINTRESS_MAX_HP,
      roundTimer: ROUND_DURATION,
      phase: 'trading',
      activeCharacterId: 'gustave',
      positions: [],
      closedPositions: [],
      battleLog: [],
      paintressNextAttack: PAINTRESS_ATTACK_INTERVAL,
      consecutiveWins: 0,
      cooldowns: {},
      voidInkUntil: 0,
      lossReductionNext: 0,
      trendHint: { direction: null, expiresAt: 0 },
      forecastHint: { direction: null, expiresAt: 0 },
      chaosActive: false,
      chaosHeadline: null,
      chaosTradesCount: 0,
      inkShieldActive: false,
      timerFrozen: false,
      timerFrozenUntil: 0,
      revealedPaintressAttack: null,
      sessionPnl: 0,
      lastStake: 0,
      _timerInterval: interval,
    });

    get().addLog('system', 'The Paintress emerges. Expedition 33, engage!', '#c9a959');
    scheduleChaos();
  },

  selectCharacter: (id) => {
    sfx.play('character_switch');
    set({ activeCharacterId: id });
  },

  executeAttack: (attackId, currentPrice, directionOverride) => {
    const state = get();
    if (state.phase !== 'trading') return;

    const attack = ATTACK_MAP[attackId];
    if (!attack) return;

    if (!get().isAttackAvailable(attackId)) return;

    // Set cooldown
    set((s) => ({
      cooldowns: { ...s.cooldowns, [attackId]: Date.now() + attack.cooldownSeconds * 1000 },
    }));

    // Handle special attacks
    if (attack.tradeAction === 'close_all') {
      const positions = [...state.positions];
      for (const p of positions) {
        get().closePosition(p.id, currentPrice);
      }
      get().addLog('system', 'Brace! All positions closed.', '#c9a959');
      return;
    }

    if (attack.tradeAction === 'close_profitable') {
      const profitable = state.positions.filter(p => p.pnl > 0);
      for (const p of profitable) {
        get().closePosition(p.id, currentPrice, attack.bonusOnClose);
      }
      get().addLog('system', `Harvest! ${profitable.length} profitable positions reaped.`, '#0d9488');
      return;
    }

    if (attack.tradeAction === 'special') {
      if (attackId === 'pattern_read') {
        const recentTrend = Math.random() > 0.5 ? 'up' : 'down' as const;
        set({ trendHint: { direction: recentTrend, expiresAt: Date.now() + 30000 } });
        get().addLog('system', `Lune reads the stains: trend points ${recentTrend}.`, '#7c3aed');
      } else if (attackId === 'arcane_forecast') {
        const forecast = Math.random() > 0.5 ? 'up' : 'down' as const;
        set({ forecastHint: { direction: forecast, expiresAt: Date.now() + 60000 } });
        get().addLog('system', `Arcane Forecast: momentum favors ${forecast} for 60s.`, '#a78bfa');
      }
      return;
    }

    // Check win streak requirement
    if (attack.requiresWinStreak && state.consecutiveWins < attack.requiresWinStreak) {
      get().addLog('system', `${attack.name} requires ${attack.requiresWinStreak} consecutive wins. Current: ${state.consecutiveWins}.`, '#c41e3a');
      return;
    }

    // Calculate stake
    const baseStake = state.teamCapital * BASE_STAKE_PERCENT;
    const stake = +(baseStake * attack.stakeMultiplier).toFixed(2);

    if (stake > state.teamCapital || stake <= 0) {
      get().addLog('system', 'Insufficient capital for this attack.', '#c41e3a');
      return;
    }

    // Determine direction
    let direction: 'STRIKE_UP' | 'STRIKE_DOWN';
    if (directionOverride) {
      direction = directionOverride === 'buy' ? 'STRIKE_UP' : 'STRIKE_DOWN';
    } else if (attackId === 'riposte') {
      const lastLoss = state.closedPositions.find(p => p.pnl < 0);
      direction = lastLoss?.direction === 'STRIKE_UP' ? 'STRIKE_DOWN' : 'STRIKE_UP';
    } else {
      direction = attack.tradeAction === 'buy' ? 'STRIKE_UP' : 'STRIKE_DOWN';
    }

    // Store loss reduction if Iron Resolve
    if (attack.reduceLoss) {
      set({ lossReductionNext: attack.reduceLoss });
    }

    // Calculate expiry time based on attack duration
    const expiryMs = getExpiryMs(attack.defaultDuration, attack.defaultDurationUnit);
    const now = attack.isDelayed ? Date.now() + (attack.delaySeconds ?? 0) * 1000 : Date.now();

    const position: Position = {
      id: `bpos_${++posId}`,
      symbol: state.symbol,
      direction,
      entryPrice: currentPrice,
      currentPrice,
      stake,
      stakeLevel: attack.stakeMultiplier >= 3 ? 'RECKLESS' : attack.stakeMultiplier >= 2 ? 'HIGH' : 'MEDIUM',
      pnl: 0,
      pnlPercent: 0,
      stopLoss: attack.autoSL ? (stake * attack.autoSL) / 100 : undefined,
      takeProfit: attack.autoTP ? (stake * attack.autoTP) / 100 : undefined,
      openTime: now,
      expiryTime: expiryMs > 0 ? now + expiryMs : undefined,
      duration: attack.defaultDuration,
      durationUnit: attack.defaultDurationUnit,
      status: 'open',
      characterId: state.activeCharacterId,
    };

    set((s) => ({
      positions: [...s.positions, position],
      teamCapital: +(s.teamCapital - stake).toFixed(2),
      lastStake: stake,
    }));

    sfx.play('trade_place');

    // Update tilt on trade placement
    const tilt = useTiltStore.getState();
    const timeSinceLastTrade = tilt.lastTradeTimestamp ? Date.now() - tilt.lastTradeTimestamp : null;
    const timeSinceLastLoss = tilt.lastLossTimestamp ? Date.now() - tilt.lastLossTimestamp : null;
    const stakeEscalationRatio = state.lastStake > 0 ? stake / state.lastStake : 1.0;
    const lastClosed = state.closedPositions[0];
    const lastTradeWasLoss = lastClosed ? lastClosed.pnl < 0 : false;

    // Check revenge trading
    if (lastTradeWasLoss && timeSinceLastLoss !== null && timeSinceLastLoss < 90_000) {
      useTiltStore.getState().incrementRevengeFlags();
    }

    let baseScore = tilt.score;
    if (tilt.lastTradeTimestamp) {
      const minutesElapsed = (Date.now() - tilt.lastTradeTimestamp) / 60_000;
      if (minutesElapsed > 0) baseScore = applyTiltDecay(tilt.score, minutesElapsed);
    }

    const result = calculateEntryTilt({
      currentScore: baseScore,
      consecutiveLosses: tilt.consecutiveLosses,
      timeSinceLastTradeMs: timeSinceLastTrade,
      timeSinceLastLossMs: timeSinceLastLoss,
      stakeEscalationRatio,
      lastTradeWasLoss,
      isUnfamiliarAsset: false,
      sessionPnl: state.sessionPnl,
    });

    tilt.setScore(result.score);
    tilt.setZone?.(result.zone);
    tilt.addHistory({ timestamp: Date.now(), score: result.score, zone: result.zone });
    tilt.setLastTradeTimestamp(Date.now());

    // Tilt warning
    if (result.score >= 60 && tilt.score < 60) {
      sfx.play('tilt_warning');
      get().addLog('system', 'WARNING: Tilt rising! The Paintress grows stronger.', '#c41e3a');
    }

    const charName = state.activeCharacterId.charAt(0).toUpperCase() + state.activeCharacterId.slice(1);
    const durationLabel = attack.defaultDuration > 0
      ? ` (${attack.defaultDuration}${attack.defaultDurationUnit})`
      : '';
    get().addLog('trade_open', `${charName} uses ${attack.name}! ${direction === 'STRIKE_UP' ? 'Rise' : 'Fall'} — stake ${stake.toFixed(2)}${durationLabel}`, direction === 'STRIKE_UP' ? '#0d9488' : '#c41e3a');

    // Track character usage for achievement
    useProgressionStore.getState().incrementBadge('expedition_scholar');
  },

  updatePositions: (currentPrice) => {
    const state = get();
    if (state.phase !== 'trading' || state.positions.length === 0) return;

    const toClose: string[] = [];
    const toExpire: string[] = [];
    const now = Date.now();

    const updated = state.positions.map(p => {
      if (p.symbol !== state.symbol) return p;
      const dir = p.direction === 'STRIKE_UP' ? 1 : -1;
      const priceDiff = (currentPrice - p.entryPrice) * dir;
      const pnl = +(priceDiff / p.entryPrice * p.stake).toFixed(2);
      const pnlPercent = +(priceDiff / p.entryPrice * 100).toFixed(4);

      // Check SL/TP
      if (p.stopLoss && pnl <= -p.stopLoss) toClose.push(p.id);
      if (p.takeProfit && pnl >= p.takeProfit) toClose.push(p.id);

      // Check expiry
      if (p.expiryTime && now >= p.expiryTime) toExpire.push(p.id);

      return { ...p, currentPrice, pnl, pnlPercent };
    });

    set({ positions: updated });

    // Auto-close SL/TP hits
    for (const id of toClose) {
      get().closePosition(id, currentPrice);
    }

    // Auto-settle expired positions
    for (const id of toExpire) {
      const pos = get().positions.find(p => p.id === id);
      if (!pos) continue;
      const dir = pos.direction === 'STRIKE_UP' ? 1 : -1;
      const won = (currentPrice - pos.entryPrice) * dir > 0;
      const settlement = resolveExpirySettlement({ won, stake: pos.stake });

      // Apply modifiers
      let pnl = settlement.pnl;
      if (pnl < 0 && get().lossReductionNext > 0) {
        pnl = +(pnl * (1 - get().lossReductionNext)).toFixed(2);
      }
      if (pnl < 0 && Date.now() < get().voidInkUntil) {
        pnl = +(pnl * 2).toFixed(2);
      }

      const closed: Position = {
        ...pos,
        currentPrice,
        pnl,
        pnlPercent: +(pnl / pos.stake * 100).toFixed(2),
        closeTime: Date.now(),
        status: 'closed',
      };

      const isWin = pnl > 0;
      const newCapital = +(get().teamCapital + pos.stake + pnl).toFixed(2);
      let hpChange = isWin ? -(pnl * 2) : Math.abs(pnl) * 1;

      // Tilt bonus for Paintress
      const tiltScore = useTiltStore.getState().score;
      if (tiltScore >= 60 && !isWin) {
        hpChange = hpChange * 1.25; // Paintress heals more when player is tilted
      }

      const newHP = Math.max(0, Math.min(PAINTRESS_MAX_HP, get().paintressHP + hpChange));
      const newConsecWins = isWin ? get().consecutiveWins + 1 : 0;

      set((s) => ({
        positions: s.positions.filter(p => p.id !== id),
        closedPositions: [closed, ...s.closedPositions].slice(0, 50),
        teamCapital: Math.max(0, newCapital),
        paintressHP: newHP,
        consecutiveWins: newConsecWins,
        lossReductionNext: 0,
        sessionPnl: s.sessionPnl + pnl,
      }));

      // Sounds & progression
      sfx.play(isWin ? 'trade_win' : 'trade_loss');
      usePowerUpStore.getState().addCredits(1);

      // XP for trade
      useProgressionStore.getState().addXp(isWin ? 25 : 10, isWin ? 'Winning trade' : 'Trade completed');

      // Badge: Diamond Hands (held to expiry and won)
      if (isWin) {
        useProgressionStore.getState().incrementBadge('diamond_hands');
      }

      // Badge: Combo Master
      if (newConsecWins >= 3) {
        useProgressionStore.getState().incrementBadge('combo_master');
      }

      // Update tilt on resolution
      const tilt = useTiltStore.getState();
      const prevConsecLosses = tilt.consecutiveLosses;
      if (isWin) {
        if (tilt.consecutiveLosses > 0) tilt.setConsecutiveLosses(0);
      } else {
        tilt.setConsecutiveLosses(tilt.consecutiveLosses + 1);
        tilt.setLastLossTimestamp(Date.now());
      }

      const exitResult = calculateExitTilt({
        currentScore: tilt.score,
        won: isWin,
        heldToExpiry: true,
        consecutiveLosses: tilt.consecutiveLosses,
        previousConsecutiveLosses: prevConsecLosses,
        winStreak: newConsecWins,
        sessionPnl: get().sessionPnl,
      });

      tilt.setScore(exitResult.score);
      tilt.addHistory({ timestamp: Date.now(), score: exitResult.score, zone: exitResult.zone });

      // Log
      const dmg = pnl > 0 ? +(pnl * 2).toFixed(0) : 0;
      const heal = pnl < 0 ? +(Math.abs(pnl)).toFixed(0) : 0;
      if (pnl > 0) {
        get().addLog('paintress_damage', `Contract expired +${pnl.toFixed(2)}. Paintress takes ${dmg} damage!`, '#0d9488');
      } else {
        get().addLog('paintress_heal', `Contract expired ${pnl.toFixed(2)}. Paintress heals ${heal} HP.`, '#c41e3a');
      }

      // Check victory/defeat
      if (newHP <= 0) setTimeout(() => get().endBattle('victory'), 100);
      if (newCapital <= 0) setTimeout(() => get().endBattle('defeat'), 100);
    }
  },

  closePosition: (positionId, currentPrice, bonusPercent) => {
    set((s) => {
      const pos = s.positions.find(p => p.id === positionId);
      if (!pos) return s;

      const dir = pos.direction === 'STRIKE_UP' ? 1 : -1;
      const priceDiff = (currentPrice - pos.entryPrice) * dir;
      let pnl = +(priceDiff / pos.entryPrice * pos.stake).toFixed(2);

      if (pnl < 0 && s.lossReductionNext > 0) {
        pnl = +(pnl * (1 - s.lossReductionNext)).toFixed(2);
      }
      if (pnl < 0 && Date.now() < s.voidInkUntil) {
        pnl = +(pnl * 2).toFixed(2);
      }
      if (pnl > 0 && bonusPercent) {
        pnl = +(pnl * (1 + bonusPercent)).toFixed(2);
      }

      const closed: Position = {
        ...pos, currentPrice, pnl,
        pnlPercent: +(pnl / pos.stake * 100).toFixed(2),
        closeTime: Date.now(), status: 'closed',
      };

      const isWin = pnl > 0;
      const newCapital = +(s.teamCapital + pos.stake + pnl).toFixed(2);
      let hpChange = isWin ? -(pnl * 2) : Math.abs(pnl) * 1;

      const tiltScore = useTiltStore.getState().score;
      if (tiltScore >= 60 && !isWin) hpChange = hpChange * 1.25;

      const newHP = Math.max(0, Math.min(s.paintressMaxHP, s.paintressHP + hpChange));
      const newConsecWins = isWin ? s.consecutiveWins + 1 : 0;

      if (newHP <= 0) setTimeout(() => get().endBattle('victory'), 100);
      if (newCapital <= 0) setTimeout(() => get().endBattle('defeat'), 100);

      // Sound + credits
      sfx.play(isWin ? 'trade_win' : 'trade_loss');
      usePowerUpStore.getState().addCredits(1);
      useProgressionStore.getState().addXp(isWin ? 25 : 10, isWin ? 'Winning trade' : 'Trade completed');
      if (newConsecWins >= 3) useProgressionStore.getState().incrementBadge('combo_master');

      // Update tilt
      const tilt = useTiltStore.getState();
      const prevConsecLosses = tilt.consecutiveLosses;
      if (isWin) {
        if (tilt.consecutiveLosses > 0) tilt.setConsecutiveLosses(0);
      } else {
        tilt.setConsecutiveLosses(tilt.consecutiveLosses + 1);
        tilt.setLastLossTimestamp(Date.now());
      }
      const exitResult = calculateExitTilt({
        currentScore: tilt.score, won: isWin, heldToExpiry: false,
        consecutiveLosses: tilt.consecutiveLosses,
        previousConsecutiveLosses: prevConsecLosses,
        winStreak: newConsecWins, sessionPnl: s.sessionPnl + pnl,
      });
      tilt.setScore(exitResult.score);
      tilt.addHistory({ timestamp: Date.now(), score: exitResult.score, zone: exitResult.zone });

      return {
        positions: s.positions.filter(p => p.id !== positionId),
        closedPositions: [closed, ...s.closedPositions].slice(0, 50),
        teamCapital: Math.max(0, newCapital),
        paintressHP: newHP,
        consecutiveWins: newConsecWins,
        lossReductionNext: 0,
        sessionPnl: s.sessionPnl + pnl,
      };
    });

    // Log
    const pos = get().closedPositions[0];
    if (pos) {
      const dmg = pos.pnl > 0 ? +(pos.pnl * 2).toFixed(0) : 0;
      const heal = pos.pnl < 0 ? +(Math.abs(pos.pnl)).toFixed(0) : 0;
      if (pos.pnl > 0) {
        get().addLog('paintress_damage', `Position closed +${pos.pnl.toFixed(2)}. Paintress takes ${dmg} damage!`, '#0d9488');
      } else {
        get().addLog('paintress_heal', `Position closed ${pos.pnl.toFixed(2)}. Paintress heals ${heal} HP.`, '#c41e3a');
      }
    }
  },

  sellEarly: (positionId, currentPrice) => {
    const pos = get().positions.find(p => p.id === positionId);
    if (!pos) return;

    const dir = pos.direction === 'STRIKE_UP' ? 1 : -1;
    const priceDiff = (currentPrice - pos.entryPrice) * dir;
    const rawPnl = +(priceDiff / pos.entryPrice * pos.stake).toFixed(2);
    const settlement = resolveEarlySellSettlement({ currentPnl: rawPnl });

    get().addLog('system', `Early exit: ${settlement.pnl >= 0 ? '+' : ''}${settlement.pnl.toFixed(2)} (${rawPnl > 0 ? '70% haircut' : 'full loss'})`, '#c9a959');
    get().closePosition(positionId, currentPrice);
  },

  paintressAttack: () => {
    const state = get();

    // Check Ink Shield
    const shieldBlocked = usePowerUpStore.getState().consumeShield();
    if (shieldBlocked) {
      get().addLog('system', 'Ink Shield absorbed the attack!', '#c9a959');
      sfx.play('power_up');
      set({ phase: 'paintress_attack' });
      setTimeout(() => {
        if (get().phase === 'paintress_attack') set({ phase: 'trading' });
      }, 1500);
      return;
    }

    // Pick attack — use revealed if Gommage Lens active
    let attackDef;
    if (state.revealedPaintressAttack) {
      attackDef = PAINTRESS_ATTACKS.find(a => a.id === state.revealedPaintressAttack) ?? PAINTRESS_ATTACKS[Math.floor(Math.random() * PAINTRESS_ATTACKS.length)];
      set({ revealedPaintressAttack: null });
    } else {
      attackDef = PAINTRESS_ATTACKS[Math.floor(Math.random() * PAINTRESS_ATTACKS.length)];
    }

    set({ phase: 'paintress_attack' });
    sfx.play('paintress_attack');
    get().addLog('paintress_attack', `The Paintress unleashes ${attackDef.name}!`, '#7c3aed');

    // Tilt bonus: increase Paintress attack power
    const tiltScore = useTiltStore.getState().score;
    const tiltMultiplier = tiltScore >= 60 ? 1.25 : 1;

    switch (attackDef.effect) {
      case 'drain_capital': {
        const drain = +(state.teamCapital * attackDef.value / 100 * tiltMultiplier).toFixed(2);
        set((s) => ({ teamCapital: +(s.teamCapital - drain).toFixed(2) }));
        get().addLog('paintress_attack', `${attackDef.description} (-${drain.toFixed(2)})`, '#c41e3a');
        break;
      }
      case 'force_close': {
        const openPositions = state.positions;
        if (openPositions.length > 0) {
          const target = openPositions[Math.floor(Math.random() * openPositions.length)];
          get().closePosition(target.id, target.currentPrice);
          get().addLog('paintress_attack', attackDef.description, '#c41e3a');
        }
        break;
      }
      case 'double_losses': {
        set({ voidInkUntil: Date.now() + attackDef.value * 1000 });
        get().addLog('paintress_attack', attackDef.description, '#7c3aed');
        break;
      }
    }

    setTimeout(() => {
      if (get().phase === 'paintress_attack') set({ phase: 'trading' });
    }, 2000);
  },

  endBattle: (result) => {
    const state = get();
    if (state._timerInterval) clearInterval(state._timerInterval);
    if (state._chaosTimer) clearTimeout(state._chaosTimer);

    set({ phase: result, _timerInterval: null, _chaosTimer: null });
    sfx.play('battle_end');

    // Progression
    const progression = useProgressionStore.getState();
    progression.addXp(50, 'Battle completed');

    if (result === 'victory') {
      progression.addXp(200, 'Paintress defeated!');
      progression.incrementBadge('paintress_slayer');
      get().addLog('system', 'The Paintress falls! Expedition 33 is victorious!', '#c9a959');
    } else {
      get().addLog('system', 'The expedition has failed. The Paintress endures.', '#c41e3a');
    }

    // Zero Revenge badge
    if (useTiltStore.getState().revengeFlags === 0) {
      progression.incrementBadge('zero_revenge');
    }
  },

  resetBattle: () => {
    const state = get();
    if (state._timerInterval) clearInterval(state._timerInterval);
    if (state._chaosTimer) clearTimeout(state._chaosTimer);
    set({
      phase: 'setup',
      _timerInterval: null,
      _chaosTimer: null,
      positions: [],
      closedPositions: [],
      battleLog: [],
      teamCapital: STARTING_CAPITAL,
      paintressHP: PAINTRESS_MAX_HP,
      roundTimer: ROUND_DURATION,
      consecutiveWins: 0,
      cooldowns: {},
      voidInkUntil: 0,
      lossReductionNext: 0,
      chaosActive: false,
      chaosHeadline: null,
      chaosTradesCount: 0,
      inkShieldActive: false,
      timerFrozen: false,
      timerFrozenUntil: 0,
      revealedPaintressAttack: null,
      sessionPnl: 0,
      lastStake: 0,
    });
  },

  addLog: (type, message, color) => {
    set((s) => ({
      battleLog: [
        { id: `log_${++s._logId}`, timestamp: Date.now(), type, message, color },
        ...s.battleLog,
      ].slice(0, 100),
    }));
  },

  isAttackAvailable: (attackId) => {
    const state = get();
    const cd = state.cooldowns[attackId];
    if (cd && Date.now() < cd) return false;
    return true;
  },
}));
