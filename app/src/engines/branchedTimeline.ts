import { Position } from '../types/trading';

export interface TimelineBranch {
  id: string;
  label: string;
  description: string;
  hypotheticalPnl: number;
  actualPnl: number;
  delta: number;
  sentiment: 'better' | 'worse' | 'same';
}

const PAYOUT_RATIO = 0.85;

function binaryPnl(direction: 'STRIKE_UP' | 'STRIKE_DOWN', entry: number, exit: number, stake: number): number {
  if (entry === 0) return 0;
  const won = direction === 'STRIKE_UP' ? exit > entry : exit < entry;
  return won ? stake * PAYOUT_RATIO : -stake;
}

export function computeBranchedTimelines(trades: Position[]): TimelineBranch[] {
  const branches: TimelineBranch[] = [];
  const resolved = trades.filter(t => t.status === 'closed' || t.status === 'liquidated');

  if (resolved.length === 0) return branches;

  const actualTotalPnl = resolved.reduce((sum, t) => sum + t.pnl, 0);

  // "If you reversed" — flip direction on every trade
  {
    const reversedPnl = resolved.reduce((sum, t) => {
      const flipped: 'STRIKE_UP' | 'STRIKE_DOWN' = t.direction === 'STRIKE_UP' ? 'STRIKE_DOWN' : 'STRIKE_UP';
      return sum + binaryPnl(flipped, t.entryPrice, t.currentPrice, t.stake);
    }, 0);
    const delta = round(reversedPnl - actualTotalPnl);
    branches.push({
      id: 'reversed',
      label: 'If you reversed',
      description: `Every trade flipped: ${resolved.length} trades`,
      hypotheticalPnl: round(reversedPnl),
      actualPnl: round(actualTotalPnl),
      delta,
      sentiment: delta > 0.01 ? 'better' : delta < -0.01 ? 'worse' : 'same',
    });
  }

  // "If you skipped worst" — remove single worst trade
  if (resolved.length >= 2) {
    const worstTrade = resolved.reduce((worst, t) => t.pnl < worst.pnl ? t : worst);
    const withoutWorst = actualTotalPnl - worstTrade.pnl;
    const delta = round(withoutWorst - actualTotalPnl);
    branches.push({
      id: 'skip-worst',
      label: 'If you skipped worst',
      description: `Without your ${worstTrade.pnl.toFixed(2)} trade`,
      hypotheticalPnl: round(withoutWorst),
      actualPnl: round(actualTotalPnl),
      delta,
      sentiment: delta > 0.01 ? 'better' : delta < -0.01 ? 'worse' : 'same',
    });
  }

  // "If you doubled winners" — 2x stake on wins only
  {
    const doubledPnl = resolved.reduce((sum, t) => {
      return sum + (t.pnl > 0 ? t.pnl * 2 : t.pnl);
    }, 0);
    const delta = round(doubledPnl - actualTotalPnl);
    if (Math.abs(delta) > 0.01) {
      branches.push({
        id: 'doubled-wins',
        label: 'If you doubled winners',
        description: '2x stake on every winning trade',
        hypotheticalPnl: round(doubledPnl),
        actualPnl: round(actualTotalPnl),
        delta,
        sentiment: delta > 0.01 ? 'better' : delta < -0.01 ? 'worse' : 'same',
      });
    }
  }

  // "If you paused after losses" — skip any trade that followed a loss
  if (resolved.length >= 3) {
    let prevWasLoss = false;
    let sitOutPnl = 0;
    let skippedCount = 0;
    for (const t of resolved) {
      if (prevWasLoss) {
        skippedCount++;
        prevWasLoss = t.pnl < 0;
        continue;
      }
      sitOutPnl += t.pnl;
      prevWasLoss = t.pnl < 0;
    }

    if (skippedCount > 0) {
      const delta = round(sitOutPnl - actualTotalPnl);
      branches.push({
        id: 'sit-out-losses',
        label: 'If you paused after losses',
        description: `Skipped ${skippedCount} post-loss trade${skippedCount > 1 ? 's' : ''}`,
        hypotheticalPnl: round(sitOutPnl),
        actualPnl: round(actualTotalPnl),
        delta,
        sentiment: delta > 0.01 ? 'better' : delta < -0.01 ? 'worse' : 'same',
      });
    }
  }

  return branches;
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
