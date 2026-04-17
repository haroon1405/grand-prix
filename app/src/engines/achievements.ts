export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  tiers: [{ label: string; target: number }, { label: string; target: number }, { label: string; target: number }];
  xp: [number, number, number];
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Hold winning trades to full expiry',
    tiers: [{ label: 'Bronze', target: 5 }, { label: 'Silver', target: 25 }, { label: 'Gold', target: 100 }],
    xp: [100, 300, 1000],
  },
  {
    id: 'cool_head',
    name: 'Cool Head',
    description: 'Wait 5+ minutes after a loss before next trade',
    tiers: [{ label: 'Bronze', target: 10 }, { label: 'Silver', target: 25 }, { label: 'Gold', target: 50 }],
    xp: [100, 250, 750],
  },
  {
    id: 'tilt_survivor',
    name: 'Tilt Survivor',
    description: 'Reach tilt 60+ and voluntarily stop trading',
    tiers: [{ label: 'Bronze', target: 1 }, { label: 'Silver', target: 5 }, { label: 'Gold', target: 15 }],
    xp: [300, 750, 2000],
  },
  {
    id: 'zero_revenge',
    name: 'Zero Revenge',
    description: 'Complete a full battle with zero revenge-trading flags',
    tiers: [{ label: 'Bronze', target: 1 }, { label: 'Silver', target: 5 }, { label: 'Gold', target: 15 }],
    xp: [500, 1500, 5000],
  },
  {
    id: 'paintress_slayer',
    name: 'Paintress Slayer',
    description: 'Defeat The Paintress',
    tiers: [{ label: 'Bronze', target: 1 }, { label: 'Silver', target: 5 }, { label: 'Gold', target: 15 }],
    xp: [200, 500, 1500],
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a winning streak in a single battle',
    tiers: [{ label: 'Bronze', target: 3 }, { label: 'Silver', target: 5 }, { label: 'Gold', target: 10 }],
    xp: [150, 400, 1200],
  },
  {
    id: 'expedition_scholar',
    name: 'Expedition Scholar',
    description: "Use every character's unique attacks",
    tiers: [{ label: 'Bronze', target: 5 }, { label: 'Silver', target: 10 }, { label: 'Gold', target: 20 }],
    xp: [200, 500, 1500],
  },
  {
    id: 'phantom_master',
    name: 'Phantom Master',
    description: 'Unlock all other badges at any tier',
    tiers: [{ label: 'Bronze', target: 3 }, { label: 'Silver', target: 6 }, { label: 'Gold', target: 7 }],
    xp: [1000, 3000, 10000],
  },
];

export type RankName = 'Conscript' | 'Expeditioner' | 'Veteran' | 'Commander' | 'Immortal';
export type SubTier = 'I' | 'II' | 'III';

export interface RankInfo {
  rank: RankName;
  subTier: SubTier;
  level: number;
  color: string;
  nextThreshold: number;
  currentThreshold: number;
  progress: number;
  totalXp: number;
}

const RANK_COLORS: Record<RankName, string> = {
  Conscript: '#71717a',
  Expeditioner: '#cd7f32',
  Veteran: '#c0c0c0',
  Commander: '#c9a959',
  Immortal: '#0d9488',
};

const RANK_THRESHOLDS: { rank: RankName; subTier: SubTier; threshold: number }[] = [
  { rank: 'Conscript', subTier: 'I', threshold: 0 },
  { rank: 'Conscript', subTier: 'II', threshold: 250 },
  { rank: 'Conscript', subTier: 'III', threshold: 500 },
  { rank: 'Expeditioner', subTier: 'I', threshold: 1000 },
  { rank: 'Expeditioner', subTier: 'II', threshold: 2500 },
  { rank: 'Expeditioner', subTier: 'III', threshold: 5000 },
  { rank: 'Veteran', subTier: 'I', threshold: 7500 },
  { rank: 'Veteran', subTier: 'II', threshold: 12000 },
  { rank: 'Veteran', subTier: 'III', threshold: 18000 },
  { rank: 'Commander', subTier: 'I', threshold: 25000 },
  { rank: 'Commander', subTier: 'II', threshold: 40000 },
  { rank: 'Commander', subTier: 'III', threshold: 60000 },
  { rank: 'Immortal', subTier: 'I', threshold: 80000 },
  { rank: 'Immortal', subTier: 'II', threshold: 120000 },
  { rank: 'Immortal', subTier: 'III', threshold: 200000 },
];

export function xpToRank(totalXp: number): RankInfo {
  let idx = 0;
  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    if (totalXp >= RANK_THRESHOLDS[i].threshold) idx = i;
  }

  const current = RANK_THRESHOLDS[idx];
  const next = RANK_THRESHOLDS[idx + 1] ?? null;
  const nextThreshold = next ? next.threshold : current.threshold;
  const range = nextThreshold - current.threshold;
  const progress = range > 0
    ? Math.min(100, Math.round(((totalXp - current.threshold) / range) * 100))
    : 100;

  return {
    rank: current.rank,
    subTier: current.subTier,
    level: idx + 1,
    color: RANK_COLORS[current.rank],
    nextThreshold,
    currentThreshold: current.threshold,
    progress,
    totalXp,
  };
}

export function formatRank(info: RankInfo): string {
  return `${info.rank} ${info.subTier}`;
}

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === id);
}
