import { ChaosHeadline } from '../types/battle';

const HEADLINE_POOL: Omit<ChaosHeadline, 'id'>[] = [
  { text: "The Paintress's brush quivers — volatile strokes ahead", source: 'The Paintress', volatilityMultiplier: 2.5, directionBias: 'neutral' },
  { text: 'A Gommage manifestation distorts the charts', source: 'Gommage Rift', volatilityMultiplier: 2.0, directionBias: 'bear' },
  { text: 'Lune detects a Pattern Disturbance in the ink', source: 'Arcane Tome', volatilityMultiplier: 3.0, directionBias: 'neutral' },
  { text: 'The Nevron Pulse surges — instruments resonate', source: 'Nevron Core', volatilityMultiplier: 1.8, directionBias: 'bull' },
  { text: 'Ancient ink bleeds through — prices may fracture', source: 'The Continent', volatilityMultiplier: 2.8, directionBias: 'bear' },
  { text: "A forgotten expedition's journal reveals a hidden pattern", source: 'Lost Archives', volatilityMultiplier: 1.5, directionBias: 'bull' },
  { text: 'The Continent shifts — trade routes disrupted', source: 'Seismic Event', volatilityMultiplier: 2.2, directionBias: 'neutral' },
  { text: 'Verso glimpses a memory from before the numbering', source: 'The Immortal', volatilityMultiplier: 2.0, directionBias: 'neutral' },
  { text: "Gustave's instruments detect resonance in the Gradient field", source: 'Mechanical Gauntlet', volatilityMultiplier: 1.6, directionBias: 'bull' },
  { text: "Maelle's blade hums — the market's rhythm accelerates", source: 'Rapier of Stances', volatilityMultiplier: 2.4, directionBias: 'bull' },
  { text: "Sciel draws a Foretell card — 'The Tower' appears", source: 'Harvest Cards', volatilityMultiplier: 2.6, directionBias: 'bear' },
  { text: 'The number 33 appears in the chart candles', source: 'The Prophecy', volatilityMultiplier: 3.0, directionBias: 'neutral' },
];

let usedIndices = new Set<number>();

export function getRandomHeadline(): ChaosHeadline {
  if (usedIndices.size >= HEADLINE_POOL.length) {
    usedIndices.clear();
  }

  let idx: number;
  do {
    idx = Math.floor(Math.random() * HEADLINE_POOL.length);
  } while (usedIndices.has(idx));

  usedIndices.add(idx);
  return { id: `chaos-${Date.now()}-${idx}`, ...HEADLINE_POOL[idx] };
}

export function getNextChaosInterval(): number {
  return 90_000 + Math.random() * 30_000;
}

export const CHAOS_DISPLAY_DURATION_MS = 5_000;
export const CHAOS_EFFECT_DURATION_MS = 15_000;
export const CHAOS_SCORE_MULTIPLIER = 1.5;

export function resetChaosEngine(): void {
  usedIndices.clear();
}
