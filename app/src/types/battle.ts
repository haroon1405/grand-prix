export type BattlePhase = 'setup' | 'trading' | 'paintress_attack' | 'victory' | 'defeat';

export type TiltZone = 'green' | 'yellow' | 'red';

export interface Attack {
  id: string;
  name: string;
  loreDescription: string;
  characterId: string | 'common';
  type: 'common' | 'unique';
  tradeAction: 'buy' | 'sell' | 'close_all' | 'close_profitable' | 'special';
  stakeMultiplier: number;
  autoSL?: number;
  autoTP?: number;
  cooldownSeconds: number;
  requiresWinStreak?: number;
  isDelayed?: boolean;
  delaySeconds?: number;
  reduceLoss?: number;
  bonusOnClose?: number;
  defaultDuration: number;
  defaultDurationUnit: string;
}

export interface ChaosHeadline {
  id: string;
  text: string;
  source: string;
  volatilityMultiplier: number;
  directionBias: 'bull' | 'bear' | 'neutral';
}

export type PowerUpType = 'ink_shield' | 'time_fracture' | 'gommage_lens';

export interface PaintressAttackDef {
  id: string;
  name: string;
  description: string;
  effect: 'drain_capital' | 'force_close' | 'double_losses';
  value: number; // percentage for drain, duration for debuff
}

export interface BattleLogEntry {
  id: string;
  timestamp: number;
  type: 'trade_open' | 'trade_close' | 'paintress_attack' | 'paintress_damage' | 'paintress_heal' | 'system';
  message: string;
  color?: string;
}
