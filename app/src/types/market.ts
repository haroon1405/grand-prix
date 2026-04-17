export interface Tick {
  symbol: string;
  quote: number;
  bid: number;
  ask: number;
  epoch: number;
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  epoch: number;
}

export interface MarketState {
  symbol: string;
  lastPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  trendScore: number; // -1 to 1
  volatilityScore: number; // 0 to 1
  recentCandles: Candle[];
  recentTicks: Tick[];
}

export interface AssetDefinition {
  symbol: string;
  gameName: string;
  gameCategory: string;
  description: string;
  loreText: string;
  basePrice: number;
  volatility: number; // multiplier
  pipSize: number;
  iconColor: string;
  region: string;
}

export type MarketMood = 'calm' | 'stirring' | 'volatile' | 'tempest' | 'anomaly';
