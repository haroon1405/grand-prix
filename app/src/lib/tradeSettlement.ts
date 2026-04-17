const WIN_PAYOUT_MULTIPLIER = 0.85;
const EARLY_EXIT_PROFIT_HAIRCUT = 0.7;

export function resolveExpirySettlement({
  won,
  stake,
}: {
  won: boolean;
  stake: number;
}): { pnl: number; status: 'won' | 'lost'; won: boolean } {
  return {
    pnl: roundMoney(won ? stake * WIN_PAYOUT_MULTIPLIER : -stake),
    status: won ? 'won' : 'lost',
    won,
  };
}

export function resolveEarlySellSettlement({
  currentPnl,
}: {
  currentPnl: number;
}): { pnl: number; status: 'won' | 'lost'; won: boolean } {
  const pnl = roundMoney(
    currentPnl > 0 ? currentPnl * EARLY_EXIT_PROFIT_HAIRCUT : currentPnl
  );
  const won = pnl >= 0;
  return { pnl, status: won ? 'won' : 'lost', won };
}

export function getExpiryMs(duration: number, unit: string): number {
  switch (unit) {
    case 's': return duration * 1000;
    case 'm': return duration * 60_000;
    case 'h': return duration * 3_600_000;
    default: return duration * 60_000;
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
