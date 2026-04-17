import { create } from 'zustand';
import { xpToRank, BADGE_DEFINITIONS, formatRank } from '../engines/achievements';
import type { RankInfo } from '../engines/achievements';

interface BadgeProgress {
  badgeId: string;
  count: number;
  tier: number; // 0 = none, 1 = Bronze, 2 = Silver, 3 = Gold
}

interface XpEntry {
  amount: number;
  reason: string;
  timestamp: number;
}

interface ProgressionStore {
  totalXp: number;
  rank: RankInfo;
  rankLabel: string;
  badges: BadgeProgress[];
  xpHistory: XpEntry[];

  addXp: (amount: number, reason: string) => void;
  incrementBadge: (badgeId: string) => void;
  reset: () => void;
}

const STORAGE_KEY = 'expedition33_progression';

function loadFromStorage(): { totalXp: number; badges: BadgeProgress[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    totalXp: 0,
    badges: BADGE_DEFINITIONS.map(b => ({ badgeId: b.id, count: 0, tier: 0 })),
  };
}

function saveToStorage(totalXp: number, badges: BadgeProgress[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalXp, badges }));
  } catch { /* ignore */ }
}

const initial = loadFromStorage();
const initialRank = xpToRank(initial.totalXp);

export const useProgressionStore = create<ProgressionStore>((set, get) => ({
  totalXp: initial.totalXp,
  rank: initialRank,
  rankLabel: formatRank(initialRank),
  badges: initial.badges,
  xpHistory: [],

  addXp: (amount, reason) => {
    set((s) => {
      const newXp = s.totalXp + amount;
      const newRank = xpToRank(newXp);
      saveToStorage(newXp, s.badges);
      return {
        totalXp: newXp,
        rank: newRank,
        rankLabel: formatRank(newRank),
        xpHistory: [{ amount, reason, timestamp: Date.now() }, ...s.xpHistory].slice(0, 50),
      };
    });
  },

  incrementBadge: (badgeId) => {
    set((s) => {
      const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      if (!def) return s;

      const badges = s.badges.map(bp => {
        if (bp.badgeId !== badgeId) return bp;
        const newCount = bp.count + 1;
        let newTier = bp.tier;

        // Check tier upgrades
        for (let t = 0; t < 3; t++) {
          if (newCount >= def.tiers[t].target && newTier <= t) {
            newTier = t + 1;
          }
        }

        // Award XP for tier-up
        if (newTier > bp.tier) {
          const xpGain = def.xp[newTier - 1];
          setTimeout(() => get().addXp(xpGain, `${def.name} — ${def.tiers[newTier - 1].label}`), 0);
        }

        return { ...bp, count: newCount, tier: newTier };
      });

      saveToStorage(s.totalXp, badges);

      // Check Phantom Master progress
      const unlockedCount = badges.filter(b => b.tier > 0 && b.badgeId !== 'phantom_master').length;
      const phantomIdx = badges.findIndex(b => b.badgeId === 'phantom_master');
      if (phantomIdx >= 0) {
        badges[phantomIdx] = { ...badges[phantomIdx], count: unlockedCount };
        const pmDef = BADGE_DEFINITIONS.find(b => b.id === 'phantom_master')!;
        let pmTier = badges[phantomIdx].tier;
        for (let t = 0; t < 3; t++) {
          if (unlockedCount >= pmDef.tiers[t].target && pmTier <= t) {
            pmTier = t + 1;
            setTimeout(() => get().addXp(pmDef.xp[t], `${pmDef.name} — ${pmDef.tiers[t].label}`), 0);
          }
        }
        badges[phantomIdx] = { ...badges[phantomIdx], tier: pmTier };
      }

      return { badges };
    });
  },

  reset: () => {
    // Only resets session XP history, not persistent progression
    set({ xpHistory: [] });
  },
}));
