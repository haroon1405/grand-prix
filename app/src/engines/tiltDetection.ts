import { TiltZone } from '../types/battle';

export interface TiltSignal {
  type: string;
  delta: number;
  description: string;
}

export interface TiltCalculation {
  score: number;
  zone: TiltZone;
  signals: TiltSignal[];
}

export interface PlacementTiltInputs {
  currentScore: number;
  consecutiveLosses: number;
  timeSinceLastTradeMs: number | null;
  timeSinceLastLossMs: number | null;
  stakeEscalationRatio: number;
  lastTradeWasLoss: boolean;
  isUnfamiliarAsset: boolean;
  sessionPnl: number;
}

export interface ResolutionTiltInputs {
  currentScore: number;
  won: boolean;
  heldToExpiry: boolean;
  consecutiveLosses: number;
  previousConsecutiveLosses?: number;
  winStreak: number;
  sessionPnl: number;
}

function push(signals: TiltSignal[], type: string, delta: number, description: string): number {
  signals.push({ type, delta, description });
  return delta;
}

export function scoreToZone(score: number): TiltZone {
  if (score >= 60) return 'red';
  if (score >= 30) return 'yellow';
  return 'green';
}

export const TILT_ZONE_COLORS: Record<TiltZone, string> = {
  green: '#0d9488',
  yellow: '#c9a959',
  red: '#c41e3a',
};

export const TILT_ZONE_LABELS: Record<TiltZone, string> = {
  green: 'Composed',
  yellow: 'Warming',
  red: 'On Tilt',
};

export function calculateEntryTilt(inputs: PlacementTiltInputs): TiltCalculation {
  const signals: TiltSignal[] = [];
  let delta = 0;

  // Consecutive losses compound pressure (10 pts each, cap 50)
  const lossPts = Math.min(inputs.consecutiveLosses * 10, 50);
  if (lossPts > 0) {
    delta += push(signals, 'consecutive_losses', lossPts,
      `${inputs.consecutiveLosses} consecutive loss${inputs.consecutiveLosses > 1 ? 'es' : ''}`);
  }

  // Re-entry speed
  if (inputs.timeSinceLastTradeMs !== null) {
    if (inputs.timeSinceLastTradeMs < 30_000) {
      delta += push(signals, 'panic_reentry', 22, 'Panic re-entry — < 30s since last trade');
    } else if (inputs.timeSinceLastTradeMs < 2 * 60_000) {
      delta += push(signals, 'hasty_reentry', 12, 'Hasty re-entry — < 2 min since last trade');
    }
  }

  // Stake sizing after last trade
  if (inputs.stakeEscalationRatio > 2.0) {
    delta += push(signals, 'aggressive_escalation', 22,
      `Aggressive stake escalation — ${inputs.stakeEscalationRatio.toFixed(1)}x last stake`);
  } else if (inputs.stakeEscalationRatio > 1.5) {
    delta += push(signals, 'stake_escalation', 14,
      `Stake escalation — ${inputs.stakeEscalationRatio.toFixed(1)}x last stake`);
  }

  // Recency bias — trading in the emotional window after a loss
  if (inputs.timeSinceLastLossMs !== null) {
    if (inputs.timeSinceLastLossMs < 90_000) {
      delta += push(signals, 'recency_bias', 12, 'Revenge trade window — loss < 90s ago');
    } else if (inputs.timeSinceLastLossMs < 3 * 60_000) {
      delta += push(signals, 'recent_loss', 6, 'Still in loss window — loss < 3 min ago');
    }
  }

  // Unfamiliar asset
  if (inputs.isUnfamiliarAsset) {
    delta += push(signals, 'unfamiliar_asset', 10, 'Trading on an unfamiliar asset');
  }

  // Trading while already elevated
  if (inputs.currentScore > 60) {
    delta += push(signals, 'trading_while_tilted', 8, 'Entering a trade while already on tilt');
  } else if (inputs.currentScore > 40) {
    delta += push(signals, 'trading_while_warming', 4, 'Entering a trade while tilt is warming');
  }

  // Session drawdown pressure
  if (inputs.sessionPnl < -100) {
    delta += push(signals, 'session_deep_red', 10, 'Session P&L deep in the red');
  } else if (inputs.sessionPnl < -50) {
    delta += push(signals, 'session_red', 5, 'Session P&L in the red');
  }

  // -- SUBTRACTIVE SIGNALS --

  // Break length — cooldown rewards
  if (inputs.timeSinceLastTradeMs !== null) {
    if (inputs.timeSinceLastTradeMs > 20 * 60_000) {
      delta += push(signals, 'extended_break', -25, 'Extended break — 20+ min cooldown');
    } else if (inputs.timeSinceLastTradeMs > 10 * 60_000) {
      delta += push(signals, 'long_break', -18, 'Long break — 10+ min cooldown');
    } else if (inputs.timeSinceLastTradeMs > 5 * 60_000) {
      delta += push(signals, 'medium_break', -12, 'Took a 5+ min break');
    }
  }

  // Responsible stake sizing after a loss
  if (inputs.lastTradeWasLoss) {
    if (inputs.stakeEscalationRatio < 0.75) {
      delta += push(signals, 'responsible_sizing', -12, 'Reduced stake after a loss — disciplined');
    } else if (inputs.stakeEscalationRatio <= 1.1) {
      delta += push(signals, 'steady_sizing', -5, 'Kept stake steady after a loss — composed');
    }
  }

  // Composed entry bonus
  if (inputs.currentScore <= 20 && inputs.consecutiveLosses === 0) {
    delta += push(signals, 'composed_entry', -4, 'Entered from a composed, streak-free state');
  }

  const newScore = Math.max(0, Math.min(100, inputs.currentScore + delta));
  return { score: newScore, zone: scoreToZone(newScore), signals };
}

export function calculateExitTilt(inputs: ResolutionTiltInputs): TiltCalculation {
  const signals: TiltSignal[] = [];
  let delta = 0;

  if (inputs.won) {
    if (inputs.heldToExpiry) {
      delta += push(signals, 'disciplined_win', -18, 'Won and held to expiry — conviction paid off');
    } else {
      delta += push(signals, 'smart_early_exit', -12, 'Won with a smart early exit');
    }

    // Win breaking a loss streak
    if ((inputs.previousConsecutiveLosses ?? 0) >= 2) {
      delta += push(signals, 'streak_broken', -15,
        `Broke a ${inputs.previousConsecutiveLosses}-loss streak`);
    }

    // Win streak composure
    if (inputs.winStreak >= 3) {
      delta += push(signals, 'hot_streak', -8, `${inputs.winStreak}-win streak — in the zone`);
    }
  } else {
    // Loss path
    if (inputs.heldToExpiry) {
      delta += push(signals, 'disciplined_loss', 5, 'Loss but held to expiry — disciplined exit');
    } else {
      delta += push(signals, 'panic_exit', 15, 'Panic early exit on losing trade');
    }

    // Loss streak intensifies
    if (inputs.consecutiveLosses >= 3) {
      delta += push(signals, 'loss_streak_pressure', 12,
        `${inputs.consecutiveLosses}-loss streak — mounting pressure`);
    }
  }

  const newScore = Math.max(0, Math.min(100, inputs.currentScore + delta));
  return { score: newScore, zone: scoreToZone(newScore), signals };
}

export function applyTiltDecay(score: number, minutesElapsed: number): number {
  if (minutesElapsed <= 0 || score <= 0) return score;
  const decayRate = 0.05; // 5% per minute
  const decayed = score * Math.pow(1 - decayRate, minutesElapsed);
  return Math.max(0, Math.round(decayed * 100) / 100);
}
