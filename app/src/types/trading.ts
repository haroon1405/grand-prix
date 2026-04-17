export type TradeDirection = 'STRIKE_UP' | 'STRIKE_DOWN';
export type StakeLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'RECKLESS';
export type PositionStatus = 'open' | 'closed' | 'liquidated';

export interface Position {
  id: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  currentPrice: number;
  stake: number;
  stakeLevel: StakeLevel;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: number;
  closeTime?: number;
  expiryTime?: number;
  duration?: number;
  durationUnit?: string;
  status: PositionStatus;
  characterId: string;
}

export interface TradeOrder {
  symbol: string;
  direction: TradeDirection;
  stake: number;
  stakeLevel: StakeLevel;
  stopLoss?: number;
  takeProfit?: number;
  characterId: string;
}

export interface PortfolioState {
  capital: number;
  startingCapital: number;
  totalPnl: number;
  exposure: number; // 0 to 1
  resolve: number; // 0 to 100, emotional resilience
  positions: Position[];
  closedPositions: Position[];
  tradeCount: number;
  winCount: number;
  lossCount: number;
}
