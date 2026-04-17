import { create } from 'zustand';
import { PowerUpType } from '../types/battle';

export interface PowerUpDef {
  type: PowerUpType;
  label: string;
  cost: number;
  description: string;
  cooldownMs: number;
  durationMs: number;
}

export const POWER_UP_DEFS: Record<PowerUpType, PowerUpDef> = {
  ink_shield: {
    type: 'ink_shield',
    label: 'Ink Shield',
    cost: 2,
    description: 'Block the next Paintress attack',
    cooldownMs: 15_000,
    durationMs: 120_000, // lasts until next attack
  },
  time_fracture: {
    type: 'time_fracture',
    label: 'Time Fracture',
    cost: 4,
    description: 'Freeze battle timer for 10s',
    cooldownMs: 15_000,
    durationMs: 10_000,
  },
  gommage_lens: {
    type: 'gommage_lens',
    label: 'Gommage Lens',
    cost: 3,
    description: 'Reveal next Paintress attack type',
    cooldownMs: 15_000,
    durationMs: 120_000,
  },
};

interface ActivePowerUp {
  type: PowerUpType;
  activatedAt: number;
  expiresAt: number;
}

interface PowerUpStore {
  credits: number;
  activePowerUps: ActivePowerUp[];
  cooldowns: Record<PowerUpType, number>;

  addCredits: (amount: number) => void;
  activate: (type: PowerUpType) => boolean;
  tick: () => void;
  isActive: (type: PowerUpType) => boolean;
  canAfford: (type: PowerUpType) => boolean;
  isOnCooldown: (type: PowerUpType) => boolean;
  consumeShield: () => boolean;
  reset: () => void;
}

export const usePowerUpStore = create<PowerUpStore>((set, get) => ({
  credits: 0,
  activePowerUps: [],
  cooldowns: { ink_shield: 0, time_fracture: 0, gommage_lens: 0 },

  addCredits: (amount) => set((s) => ({ credits: s.credits + amount })),

  activate: (type) => {
    const state = get();
    const def = POWER_UP_DEFS[type];
    const now = Date.now();

    if (state.credits < def.cost) return false;
    if (state.cooldowns[type] > now) return false;

    set((s) => ({
      credits: s.credits - def.cost,
      activePowerUps: [
        ...s.activePowerUps,
        { type, activatedAt: now, expiresAt: now + def.durationMs },
      ],
      cooldowns: { ...s.cooldowns, [type]: now + def.cooldownMs },
    }));
    return true;
  },

  tick: () => {
    const now = Date.now();
    set((s) => ({
      activePowerUps: s.activePowerUps.filter(p => p.expiresAt > now),
    }));
  },

  isActive: (type) => {
    const now = Date.now();
    return get().activePowerUps.some(p => p.type === type && p.expiresAt > now);
  },

  canAfford: (type) => get().credits >= POWER_UP_DEFS[type].cost,

  isOnCooldown: (type) => get().cooldowns[type] > Date.now(),

  consumeShield: () => {
    const state = get();
    const shieldIdx = state.activePowerUps.findIndex(
      p => p.type === 'ink_shield' && p.expiresAt > Date.now()
    );
    if (shieldIdx === -1) return false;
    set((s) => ({
      activePowerUps: s.activePowerUps.filter((_, i) => i !== shieldIdx),
    }));
    return true;
  },

  reset: () => set({
    credits: 0,
    activePowerUps: [],
    cooldowns: { ink_shield: 0, time_fracture: 0, gommage_lens: 0 },
  }),
}));
