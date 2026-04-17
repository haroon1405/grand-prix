import { Attack, PaintressAttackDef } from '../types/battle';

// Base stake is 2% of team capital
export const BASE_STAKE_PERCENT = 0.02;

// === COMMON ATTACKS (all characters) ===

const commonAttacks: Attack[] = [
  {
    id: 'strike_up',
    name: 'Strike Up',
    loreDescription: 'Commit upward. Read the momentum and ride the rise.',
    characterId: 'common',
    type: 'common',
    tradeAction: 'buy',
    stakeMultiplier: 1,
    cooldownSeconds: 3,
    defaultDuration: 1,
    defaultDurationUnit: 'm',
  },
  {
    id: 'strike_down',
    name: 'Strike Down',
    loreDescription: 'Commit downward. Sense the descent and profit from the fall.',
    characterId: 'common',
    type: 'common',
    tradeAction: 'sell',
    stakeMultiplier: 1,
    cooldownSeconds: 3,
    defaultDuration: 1,
    defaultDurationUnit: 'm',
  },
  {
    id: 'brace',
    name: 'Brace',
    loreDescription: 'Defensive retreat. Close all positions and lock in current P&L.',
    characterId: 'common',
    type: 'common',
    tradeAction: 'close_all',
    stakeMultiplier: 0,
    cooldownSeconds: 5,
    defaultDuration: 0,
    defaultDurationUnit: 's',
  },
];

// === GUSTAVE (Engineer) — Balanced ===

const gustaveAttacks: Attack[] = [
  {
    id: 'calibrated_strike',
    name: 'Calibrated Strike',
    loreDescription: 'A precision entry. Auto-sets Brace at -3% and Prophecy at +5%.',
    characterId: 'gustave',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 1,
    autoSL: 3,
    autoTP: 5,
    cooldownSeconds: 8,
    defaultDuration: 2,
    defaultDurationUnit: 'm',
  },
  {
    id: 'iron_resolve',
    name: 'Iron Resolve',
    loreDescription: 'Mechanical arm absorbs the blow. Next trade\'s losses halved.',
    characterId: 'gustave',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 1,
    reduceLoss: 0.5,
    cooldownSeconds: 15,
    defaultDuration: 2,
    defaultDurationUnit: 'm',
  },
];

// === MAELLE (Fencer) — Aggressive ===

const maelleAttacks: Attack[] = [
  {
    id: 'riposte',
    name: 'Riposte',
    loreDescription: 'Counter the market\'s last blow. Reverses the last losing direction at double stake.',
    characterId: 'maelle',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 2,
    cooldownSeconds: 10,
    defaultDuration: 30,
    defaultDurationUnit: 's',
  },
  {
    id: 'crimson_lunge',
    name: 'Crimson Lunge',
    loreDescription: 'All-in aggression. Triple stake, no safety net.',
    characterId: 'maelle',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 3,
    cooldownSeconds: 12,
    defaultDuration: 30,
    defaultDurationUnit: 's',
  },
];

// === LUNE (Mage) — Technical ===

const luneAttacks: Attack[] = [
  {
    id: 'pattern_read',
    name: 'Pattern Read',
    loreDescription: 'The mage reads the chart\'s hidden stains. Reveals trend direction for 30 seconds.',
    characterId: 'lune',
    type: 'unique',
    tradeAction: 'special',
    stakeMultiplier: 0,
    cooldownSeconds: 20,
    defaultDuration: 0,
    defaultDurationUnit: 's',
  },
  {
    id: 'arcane_forecast',
    name: 'Arcane Forecast',
    loreDescription: 'Arcane sight pierces the veil. Predicts likely direction for the next 60 seconds.',
    characterId: 'lune',
    type: 'unique',
    tradeAction: 'special',
    stakeMultiplier: 0,
    cooldownSeconds: 30,
    defaultDuration: 0,
    defaultDurationUnit: 's',
  },
];

// === SCIEL (Reaper) — Patient ===

const scielAttacks: Attack[] = [
  {
    id: 'foretell',
    name: 'Foretell',
    loreDescription: 'A card is drawn. The trade executes 60 seconds from now at future price.',
    characterId: 'sciel',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 1,
    isDelayed: true,
    delaySeconds: 60,
    cooldownSeconds: 15,
    defaultDuration: 5,
    defaultDurationUnit: 'm',
  },
  {
    id: 'harvest',
    name: 'Harvest',
    loreDescription: 'The scythe swings. All profitable positions close with a 10% bonus.',
    characterId: 'sciel',
    type: 'unique',
    tradeAction: 'close_profitable',
    stakeMultiplier: 0,
    bonusOnClose: 0.1,
    cooldownSeconds: 20,
    defaultDuration: 0,
    defaultDurationUnit: 's',
  },
];

// === VERSO (Immortal) — Veteran ===

const versoAttacks: Attack[] = [
  {
    id: 'perfection',
    name: 'Perfection',
    loreDescription: 'Only the worthy may wield this. Triple stake, but requires 2 consecutive wins.',
    characterId: 'verso',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 3,
    requiresWinStreak: 2,
    cooldownSeconds: 10,
    defaultDuration: 1,
    defaultDurationUnit: 'm',
  },
  {
    id: 'eternal_strike',
    name: 'Eternal Strike',
    loreDescription: 'A trade that transcends time. Stays open until you close it or the round ends.',
    characterId: 'verso',
    type: 'unique',
    tradeAction: 'buy',
    stakeMultiplier: 1.5,
    cooldownSeconds: 15,
    defaultDuration: 5,
    defaultDurationUnit: 'm',
  },
];

// === ALL ATTACKS INDEXED ===

export const ALL_ATTACKS: Attack[] = [
  ...commonAttacks,
  ...gustaveAttacks,
  ...maelleAttacks,
  ...luneAttacks,
  ...scielAttacks,
  ...versoAttacks,
];

export const ATTACK_MAP = Object.fromEntries(ALL_ATTACKS.map(a => [a.id, a]));

export function getAttacksForCharacter(characterId: string): Attack[] {
  return [
    ...commonAttacks,
    ...ALL_ATTACKS.filter(a => a.characterId === characterId && a.type === 'unique'),
  ];
}

// === PAINTRESS ATTACKS ===

export const PAINTRESS_ATTACKS: PaintressAttackDef[] = [
  {
    id: 'gommage_stroke',
    name: 'Gommage Stroke',
    description: 'The Paintress drags her brush. 5% of team capital is erased.',
    effect: 'drain_capital',
    value: 5,
  },
  {
    id: 'erasure',
    name: 'Erasure',
    description: 'A name is struck from the ledger. A random position is force-closed.',
    effect: 'force_close',
    value: 1,
  },
  {
    id: 'void_ink',
    name: 'Void Ink',
    description: 'Dark ink seeps into the charts. All losses are doubled for 30 seconds.',
    effect: 'double_losses',
    value: 30,
  },
];
