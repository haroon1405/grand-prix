import { create } from 'zustand';
import { TiltZone } from '../types/battle';

interface TiltHistoryEntry {
  timestamp: number;
  score: number;
  zone: TiltZone;
}

interface TiltStore {
  score: number;
  zone: TiltZone;
  consecutiveLosses: number;
  lastTradeTimestamp: number | null;
  lastLossTimestamp: number | null;
  history: TiltHistoryEntry[];
  revengeFlags: number; // count of revenge-trading triggers this battle

  setScore: (score: number) => void;
  setZone: (zone: TiltZone) => void;
  setConsecutiveLosses: (count: number) => void;
  setLastTradeTimestamp: (ts: number) => void;
  setLastLossTimestamp: (ts: number) => void;
  addHistory: (entry: TiltHistoryEntry) => void;
  incrementRevengeFlags: () => void;
  reset: () => void;
}

export const useTiltStore = create<TiltStore>((set) => ({
  score: 0,
  zone: 'green',
  consecutiveLosses: 0,
  lastTradeTimestamp: null,
  lastLossTimestamp: null,
  history: [],
  revengeFlags: 0,

  setScore: (score) => set({ score }),
  setZone: (zone) => set({ zone }),
  setConsecutiveLosses: (consecutiveLosses) => set({ consecutiveLosses }),
  setLastTradeTimestamp: (lastTradeTimestamp) => set({ lastTradeTimestamp }),
  setLastLossTimestamp: (lastLossTimestamp) => set({ lastLossTimestamp }),
  addHistory: (entry) =>
    set((s) => ({ history: [...s.history, entry].slice(-100) })),
  incrementRevengeFlags: () =>
    set((s) => ({ revengeFlags: s.revengeFlags + 1 })),
  reset: () =>
    set({
      score: 0,
      zone: 'green',
      consecutiveLosses: 0,
      lastTradeTimestamp: null,
      lastLossTimestamp: null,
      history: [],
      revengeFlags: 0,
    }),
}));
